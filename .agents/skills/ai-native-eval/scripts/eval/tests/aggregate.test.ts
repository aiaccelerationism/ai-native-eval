import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { buildReport } from "../src/aggregate.js";
import { builtInRootPluginIds, initRun } from "../src/config.js";
import {
  buildReportFromFolder,
  validateFolderReport
} from "../src/folderReport.js";
import {
  artifactPaths,
  buildIncrementalManifest,
  createRunId,
  mergeCarriedForwardTree
} from "../src/persistence.js";
import { resolvePluginGraph } from "../src/plugins.js";
import { renderHtmlReport } from "../src/renderHtml.js";
import { renderMarkdownReport } from "../src/renderMarkdown.js";
import type {
  EvaluationNodeInput,
  EvaluationReport,
  EvaluatorPluginManifest,
  PolicyRuleDefinition
} from "../src/types.js";

test("aggregates an arbitrarily nested evaluation tree deterministically", async () => {
  const fixture = JSON.parse(
    await readFile("fixtures/evaluation-tree.example.json", "utf8")
  ) as { root: EvaluationNodeInput };

  const first = buildReport({ root: fixture.root, generatedAt: "fixed" });
  const second = buildReport({ root: fixture.root, generatedAt: "fixed" });

  assert.deepEqual(first.summary, second.summary);
  assert.equal(first.summary.level0To10, 8);
  assert.equal(first.summary.score0To100, 82);
  assert.equal(first.root.children[0]?.score0To10, 8);
});

test("supports user weight changes without changing evaluator outputs", () => {
  const root: EvaluationNodeInput = {
    id: "root",
    label: "Root",
    children: [
      {
        id: "important",
        label: "Important evaluator",
        weight: 3,
        children: [
          {
            id: "important.rule",
            label: "Important rule",
            dimension: "important",
            status: "pass",
            pointsAvailable: 1
          }
        ]
      },
      {
        id: "less-important",
        label: "Less important evaluator",
        weight: 1,
        children: [
          {
            id: "less.rule",
            label: "Less rule",
            dimension: "less",
            status: "fail",
            pointsAvailable: 1
          }
        ]
      }
    ]
  };

  const report = buildReport({ root, generatedAt: "fixed" });
  assert.equal(report.summary.score0To100, 75);
  assert.equal(report.summary.level0To10, 7);
});

test("renders drill-down HTML report with evidence and recommendations", async () => {
  const fixture = JSON.parse(
    await readFile("fixtures/evaluation-tree.example.json", "utf8")
  ) as {
    root: EvaluationNodeInput;
    language?: string;
    uiLanguage?: EvaluationReport["uiLanguage"];
    evaluationContext?: EvaluationReport["evaluationContext"];
    runConfig?: EvaluationReport["runConfig"];
    policyRules?: PolicyRuleDefinition[];
  };
  const report = buildReport({
    root: fixture.root,
    generatedAt: "fixed",
    language: fixture.language,
    uiLanguage: fixture.uiLanguage,
    evaluationContext: fixture.evaluationContext,
    runConfig: fixture.runConfig,
    policyRules: fixture.policyRules
  });
  const html = renderHtmlReport(report);

  assert.match(html, /AI Native Eval Report/);
  assert.match(html, /AI Native 段位報告/);
  assert.match(html, /AI Native Eval 报告/);
  assert.match(html, /Informe de AI Native Eval/);
  assert.match(html, /AI Native Eval Bericht/);
  assert.match(html, /AI Native Eval レポート/);
  assert.match(html, /data-language-select/);
  assert.match(html, /<option value="en" selected>English<\/option>/);
  assert.match(html, /<option value="zh-CN">简体中文<\/option>/);
  assert.match(html, /<option value="zh-TW">繁體中文<\/option>/);
  assert.match(html, /<option value="es">Español<\/option>/);
  assert.match(html, /<option value="de">Deutsch<\/option>/);
  assert.match(html, /<option value="ja">日本語<\/option>/);
  assert.match(html, /data-i18n="evaluationTree"/);
  assert.match(html, /data-i18n="reviewType"/);
  assert.match(html, /data-i18n="builtIn"/);
  assert.match(html, /data-i18n="none"/);
  assert.match(html, /8\.2 \/ 10/);
  assert.match(html, /BLOCKED/);
  assert.match(html, /policy-error/);
  assert.doesNotMatch(html, /Dimension Breakdown/);
  assert.doesNotMatch(html, /Lost Points/);
  assert.match(html, /PR lifecycle evaluator/);
  assert.match(html, /PR readiness is below the configured merge bar/);
  assert.match(html, /pull_request/);
  assert.match(html, /ai-native-pr-lifecycle-evaluator/);
  assert.match(html, /Recommended Actions/);
  assert.match(html, /Copy agent prompt/);
  assert.match(html, /Fix the AI-native eval finding represented by this evaluation subtree/);
  assert.match(html, /Acceptance proof/);
});

test("resolves evaluator plugins through direct child references only", async () => {
  const fixture = JSON.parse(
    await readFile("fixtures/evaluator-plugin-manifests.example.json", "utf8")
  ) as {
    rootPluginIds: string[];
    manifests: EvaluatorPluginManifest[];
  };

  const root = fixture.manifests.find(
    (manifest) => manifest.pluginId === "repo-operability"
  );
  assert.deepEqual(root?.directChildren?.map((child) => child.pluginId), [
    "runtime-reproducibility"
  ]);
  assert.equal(
    root?.directChildren?.some(
      (child) => child.pluginId === "runtime-command-failure-handling"
    ),
    false
  );

  const resolution = resolvePluginGraph(fixture);
  assert.deepEqual(resolution.rootPluginIds, ["repo-operability"]);
  assert.deepEqual(resolution.missingPluginIds, []);
  assert.deepEqual(resolution.resolvedPluginIds, [
    "repo-operability",
    "runtime-reproducibility",
    "runtime-command",
    "runtime-command-failure-handling"
  ]);
});

test("renders plugin-resolved reports while preserving per-evaluator run records", async () => {
  const fixture = JSON.parse(
    await readFile("fixtures/evaluator-plugin-resolved.example.json", "utf8")
  ) as {
    root: EvaluationNodeInput;
    language?: string;
    uiLanguage?: EvaluationReport["uiLanguage"];
    scope?: string;
    pluginResolution?: EvaluationReport["pluginResolution"];
    executionBatches?: EvaluationReport["executionBatches"];
    evaluatorRuns?: EvaluationReport["evaluatorRuns"];
    reproducibility?: EvaluationReport["reproducibility"];
  };
  const report = buildReport({
    root: fixture.root,
    generatedAt: "fixed",
    language: fixture.language,
    uiLanguage: fixture.uiLanguage,
    scope: fixture.scope,
    pluginResolution: fixture.pluginResolution,
    executionBatches: fixture.executionBatches,
    evaluatorRuns: fixture.evaluatorRuns,
    reproducibility: fixture.reproducibility
  });
  const html = renderHtmlReport(report);

  assert.match(html, /Runtime reproducibility/);
  assert.match(html, /Runtime command failure handling/);
  assert.match(html, /direct child/);
  assert.deepEqual(report.pluginResolution?.rootPluginIds, ["repo-operability"]);
  assert.equal(report.executionBatches?.[0]?.runner, "single-agent");
  assert.deepEqual(report.executionBatches?.[0]?.pluginIds, [
    "runtime-reproducibility",
    "runtime-command",
    "runtime-command-failure-handling"
  ]);
  assert.equal(report.evaluatorRuns?.length, 2);
  assert.equal(report.summary.score0To100, 75);
});

test("deduction groups score leaves deterministically without fallback points", () => {
  const report = buildReport({
    generatedAt: "fixed",
    root: {
      id: "root",
      label: "Root",
      children: [
        {
          id: "perfect",
          label: "Perfect checklist",
          status: "pass",
          pointsAvailable: 1,
          deductionGroups: [
            {
              id: "coverage",
              label: "Coverage",
              budget: 1,
              deductions: [
                {
                  id: "missing-coverage",
                  label: "Missing coverage",
                  points: 1,
                  applies: false
                }
              ]
            }
          ]
        },
        {
          id: "partial",
          label: "Partial checklist",
          pointsAvailable: 1,
          deductionGroups: [
            {
              id: "execution-evidence",
              label: "Execution evidence",
              budget: 0.6,
              deductions: [
                {
                  id: "no-record",
                  label: "No durable record",
                  points: 0.6,
                  applies: true,
                  reason: "No durable execution record was found."
                },
                {
                  id: "not-linked",
                  label: "Record is not linked",
                  points: 0.2,
                  applies: true,
                  reason: "The execution note is not linked from review evidence."
                }
              ]
            },
            {
              id: "reviewability",
              label: "Reviewability",
              budget: 0.2,
              deductions: [
                {
                  id: "weak-review-proof",
                  label: "Weak review proof",
                  points: 0.2,
                  applies: true,
                  reason: "Reviewer proof is present but not specific."
                }
              ]
            }
          ]
        }
      ]
    }
  });

  const perfect = report.root.children[0];
  const partial = report.root.children[1];
  assert.equal(perfect?.score0To10, 10);
  assert.equal(perfect?.pointsEarned, 1);
  assert.equal(partial?.pointsEarned, 0.2);
  assert.equal(partial?.score0To10, 2);
  assert.equal(partial?.deductionGroups?.[0]?.pointsLost, 0.6);
  assert.equal(partial?.deductionGroups?.[0]?.capped, true);
  assert.equal(partial?.deductionGroups?.[1]?.pointsLost, 0.2);
});

test("policy rules add ESLint-style error overlays without changing score", () => {
  const policyRules: PolicyRuleDefinition[] = [
    {
      id: "pr-readiness-min-score",
      ownerPluginId: "ai-native-pr-lifecycle-evaluator",
      targetPluginId: "ai-native-pr-readiness-evaluator",
      condition: "scoreBelow",
      defaultSeverity: "error",
      defaultOptions: { threshold: 10 },
      message: "PR readiness must be perfect before merge."
    }
  ];
  const report = buildReport({
    generatedAt: "fixed",
    root: {
      id: "root",
      label: "Root",
      children: [
        {
          id: "ai-native-pr-lifecycle-evaluator",
          label: "PR lifecycle",
          pluginId: "ai-native-pr-lifecycle-evaluator",
          children: [
            {
              id: "ai-native-pr-readiness-evaluator",
              label: "PR readiness",
              pluginId: "ai-native-pr-readiness-evaluator",
              status: "partial",
              pointsAvailable: 1,
              pointsEarned: 0.8
            }
          ]
        }
      ]
    },
    policyRules
  });

  assert.equal(report.summary.score0To10, 8);
  assert.equal(report.policy?.status, "blocked");
  assert.equal(report.policy?.errorCount, 1);
  assert.equal(report.policy?.warnCount, 0);
  assert.equal(report.policy?.results[0]?.status, "triggered");
  const target = findNode(report.root, "ai-native-pr-readiness-evaluator");
  assert.equal(target.policyResults?.[0]?.severity, "error");
  const html = renderHtmlReport(report);
  const markdown = renderMarkdownReport(report);
  assert.match(html, /BLOCKED/);
  assert.match(html, /policy-error/);
  assert.match(markdown, /Policy: BLOCKED/);
  assert.match(markdown, /ERROR `pr-readiness-min-score`/);
});

test("policy rule config can downgrade to warn or disable with off", () => {
  const policyRules: PolicyRuleDefinition[] = [
    {
      id: "pr-readiness-min-score",
      ownerPluginId: "ai-native-pr-lifecycle-evaluator",
      targetPluginId: "ai-native-pr-readiness-evaluator",
      condition: "scoreBelow",
      defaultSeverity: "error",
      defaultOptions: { threshold: 10 },
      message: "PR readiness must meet the configured minimum."
    },
    {
      id: "artifact-traceability-min-score",
      ownerPluginId: "ai-native-pr-lifecycle-evaluator",
      targetPluginId: "ai-native-artifact-traceability-evaluator",
      condition: "scoreBelow",
      defaultSeverity: "warn",
      defaultOptions: { threshold: 8 },
      message: "Artifact traceability should meet review quality."
    }
  ];
  const root: EvaluationNodeInput = {
    id: "root",
    label: "Root",
    children: [
      {
        id: "ai-native-pr-readiness-evaluator",
        label: "PR readiness",
        pluginId: "ai-native-pr-readiness-evaluator",
        status: "partial",
        pointsAvailable: 1,
        pointsEarned: 0.7
      },
      {
        id: "ai-native-artifact-traceability-evaluator",
        label: "Artifact traceability",
        pluginId: "ai-native-artifact-traceability-evaluator",
        status: "partial",
        pointsAvailable: 1,
        pointsEarned: 0.6
      }
    ]
  };

  const downgraded = buildReport({
    generatedAt: "fixed",
    root,
    policyRules,
    runConfig: {
      schemaVersion: 1,
      configSources: [{ kind: "project", found: true }],
      builtInRootPluginIds: ["ai-native-pr-lifecycle-evaluator"],
      roots: [
        {
          pluginId: "ai-native-pr-lifecycle-evaluator",
          origin: "built-in",
          source: "built-in"
        }
      ],
      disabled: [],
      evaluatorConfigs: [
        {
          pluginId: "ai-native-pr-lifecycle-evaluator",
          source: "project",
          settings: {
            rules: {
              "pr-readiness-min-score": ["warn", { threshold: 8 }],
              "artifact-traceability-min-score": "off"
            }
          }
        }
      ]
    }
  });

  assert.equal(downgraded.summary.score0To10, 6.5);
  assert.equal(downgraded.policy?.status, "warn");
  assert.equal(downgraded.policy?.errorCount, 0);
  assert.equal(downgraded.policy?.warnCount, 1);
  assert.deepEqual(
    downgraded.policy?.results.map((result) => result.ruleId),
    ["pr-readiness-min-score"]
  );
});

test("deduction group validation prevents fallback scoring gaps", () => {
  assert.throws(
    () =>
      buildReport({
        root: {
          id: "root",
          label: "Root",
          pointsAvailable: 1,
          deductionGroups: [
            {
              id: "bad-budget",
              label: "Bad budget",
              budget: 0.6,
              deductions: [
                {
                  id: "only-small-deduction",
                  label: "Only small deduction",
                  points: 0.3,
                  applies: false
                }
              ]
            }
          ]
        }
      }),
    /less than budget/
  );

  assert.throws(
    () =>
      buildReport({
        root: {
          id: "root",
          label: "Root",
          pointsAvailable: 1,
          deductionGroups: [
            {
              id: "too-much-budget-a",
              label: "Too much budget A",
              budget: 0.7,
              deductions: [
                {
                  id: "missing-a",
                  label: "Missing A",
                  points: 0.7,
                  applies: false
                }
              ]
            },
            {
              id: "too-much-budget-b",
              label: "Too much budget B",
              budget: 0.4,
              deductions: [
                {
                  id: "missing-b",
                  label: "Missing B",
                  points: 0.4,
                  applies: false
                }
              ]
            }
          ]
        }
      }),
    /exceed pointsAvailable/
  );

  assert.throws(
    () =>
      buildReport({
        root: {
          id: "root",
          label: "Root",
          pointsAvailable: 1,
          deductionGroups: [
            {
              id: "missing-reason",
              label: "Missing reason",
              budget: 1,
              deductions: [
                {
                  id: "applied-without-reason",
                  label: "Applied without reason",
                  points: 1,
                  applies: true
                }
              ]
            }
          ]
        }
      }),
    /requires a reason/
  );
});

test("renders applied deductions as why-not-10 evidence", () => {
  const report = buildReport({
    generatedAt: "fixed",
    root: {
      id: "root",
      label: "Root",
      pointsAvailable: 1,
      deductionGroups: [
        {
          id: "execution-evidence",
          label: "Execution evidence",
          budget: 0.6,
          deductions: [
            {
              id: "no-record",
              label: "No durable record",
              points: 0.6,
              applies: true,
              reason: "No durable execution record was found.",
              evidence: [
                {
                  source: "docs/plan.md",
                  locator: "capacity section",
                  summary: "Capacity evidence exists but is not linked."
                }
              ],
              recommendation: {
                summary: "Record capacity checks in task plans."
              }
            },
            {
              id: "not-linked",
              label: "Record is not linked",
              points: 0.2,
              applies: true,
              reason: "The execution note is not linked from review evidence."
            }
          ]
        }
      ]
    }
  });
  const html = renderHtmlReport(report);

  assert.match(html, /Why Not 10\/10/);
  assert.match(html, /data-i18n="reason">Reason/);
  assert.match(html, /data-i18n="evidence">Evidence/);
  assert.match(html, /data-i18n="recommendation">Recommendation/);
  assert.match(html, /No durable execution record was found/);
  assert.match(html, /docs\/plan\.md capacity section/);
  assert.match(html, /Capped at 0\.6/);
  assert.match(html, /Record capacity checks in task plans/);
  assert.doesNotMatch(html, /No durable execution record was found\\. Evidence:/);
  assert.doesNotMatch(html, /score0To5/);
});

test("renders compact markdown reports with deductions and config", async () => {
  const report = await buildReportFromFolder({
    runFolder: "fixtures/folder-run.disabled-root",
    skillsDir: "../../../"
  });
  const markdown = renderMarkdownReport(report);

  assert.match(markdown, /^# AI Native Eval Report/);
  assert.match(markdown, /Score: n\/a/);
  assert.match(markdown, /Disabled plugins:/);
  assert.match(markdown, /ai-native-product-ux-evidence-evaluator/);
  assert.match(markdown, /Disabled: This project has no visible product workflow in scope/);
  assert.doesNotMatch(markdown, /<script/);
});

test("builds reports from per-leaf evaluator output folders", async () => {
  const report = await buildReportFromFolder({
    runFolder: "fixtures/folder-run.valid",
    skillsDir: "../../../"
  });
  const html = renderHtmlReport(report);

  assert.equal(report.reportId, "folder-run-valid");
  assert.equal(report.pluginResolution?.rootPluginIds[0], "ai-native-repo-operability-evaluator");
  assert.match(html, /Local runtime command evaluator/);
  assert.match(html, /Incomplete runtime entrypoints/);
  assert.match(html, /Reason/);
  assert.match(html, /Evidence/);
});

test("render-folder can write validated JSON and markdown reports", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-render-folder-"));
  try {
    const jsonPath = join(tempRoot, "report.json");
    const markdownPath = join(tempRoot, "report.md");
    const result = spawnSync(
      process.execPath,
      [
        "dist/src/cli.js",
        "render-folder",
        "fixtures/folder-run.valid",
        "--json-out",
        jsonPath,
        "--markdown-out",
        markdownPath,
        "--skills-dir",
        "../../../"
      ],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(await readFile(jsonPath, "utf8")) as EvaluationReport;
    const expected = await buildReportFromFolder({
      runFolder: "fixtures/folder-run.valid",
      skillsDir: "../../../"
    });
    assert.equal(report.reportId, "folder-run-valid");
    assert.deepEqual(report.summary, expected.summary);
    const markdown = await readFile(markdownPath, "utf8");
    assert.match(markdown, /Local runtime command evaluator/);
    assert.match(markdown, /Incomplete runtime entrypoints/);
    assert.doesNotMatch(markdown, /<style/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("render-folder defaults to report files beside a bundle run folder", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-bundle-render-"));
  try {
    const bundleRoot = join(tempRoot, "20260613T120000Z-abcdef123456");
    const runFolder = join(bundleRoot, "run");
    await cp("fixtures/folder-run.valid", runFolder, { recursive: true });

    const result = spawnSync(
      process.execPath,
      ["dist/src/cli.js", "render-folder", runFolder, "--skills-dir", "../../../"],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /report\.html/);
    assert.match(result.stdout, /report\.json/);
    assert.match(result.stdout, /report\.md/);
    assert.match(result.stdout, /snapshot\.json/);
    assert.match(result.stdout, /manifest\.json/);
    const html = await readFile(join(bundleRoot, "report.html"), "utf8");
    const json = JSON.parse(await readFile(join(bundleRoot, "report.json"), "utf8")) as EvaluationReport;
    const markdown = await readFile(join(bundleRoot, "report.md"), "utf8");
    const snapshot = JSON.parse(await readFile(join(bundleRoot, "snapshot.json"), "utf8")) as {
      reportId: string;
    };
    const manifest = JSON.parse(await readFile(join(bundleRoot, "manifest.json"), "utf8")) as {
      manifestId: string;
    };
    assert.match(html, /Local runtime command evaluator/);
    assert.equal(json.reportId, "folder-run-valid");
    assert.match(markdown, /Local runtime command evaluator/);
    assert.equal(snapshot.reportId, "folder-run-valid");
    assert.equal(manifest.manifestId, "folder-run-valid");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("folder validation reports all evaluator output errors", async () => {
  const result = await validateFolderReport({
    runFolder: "fixtures/folder-run.invalid",
    skillsDir: "../../../"
  });

  assert.ok(result.errors.length >= 4);
  assert.ok(
    result.errors.some((error) => error.includes("unknown deduction groupId observed-gaps"))
  );
  assert.ok(
    result.errors.some((error) =>
      error.includes("applied deduction runtime-entrypoints/incomplete-runtime-entrypoints requires reason")
    )
  );
  assert.ok(
    result.errors.some((error) =>
      error.includes("missing output for required leaf evaluator")
    )
  );
  assert.ok(
    result.errors.some((error) =>
      error.includes("missing deduction judgment for group recent-change-follow-through")
    )
  );
  assert.ok(
    result.errors.some((error) =>
      error.includes("output plugin is not reachable")
    )
  );
});

test("initializes an audited run config snapshot from built-in and project config", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-init-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    const runFolder = join(tempRoot, "run");
    const projectConfigPath = join(tempRoot, "project-config.json");
    await writeFile(
      projectConfigPath,
      JSON.stringify(
        {
          additionalRoots: [
            {
              pluginId: "ai-native-local-runtime-command-evaluator",
              reason: "Focused runtime review."
            }
          ],
          disabled: [
            {
              pluginId: "ai-native-product-ux-evidence-evaluator",
              reason: "No visible product work in scope."
            }
          ]
        },
        null,
        2
      )
    );

    const runPath = await initRun({
      repoRoot,
      runFolder,
      projectConfigPath,
      reportId: "config-snapshot-test",
      generatedAt: "2026-06-13T00:00:00.000Z",
      language: "zh-TW",
      uiLanguage: "en",
      scope: "config snapshot test",
      repoCommit: "abc123"
    });
    const run = JSON.parse(await readFile(runPath, "utf8")) as {
      rootPluginIds: string[];
      effectiveConfig: {
        builtInRootPluginIds: string[];
        roots: Array<{ pluginId: string; origin: string; reason?: string }>;
        disabled: Array<{ pluginId: string; reason: string; source: string }>;
        warnings: Array<{ code: string; source: string; message: string }>;
      };
      reproducibility: { configHash?: string };
    };

    assert.deepEqual(run.effectiveConfig.builtInRootPluginIds, [
      ...builtInRootPluginIds
    ]);
    assert.ok(run.rootPluginIds.includes("ai-native-repo-maturity-evaluator"));
    assert.ok(
      run.rootPluginIds.includes("ai-native-local-runtime-command-evaluator")
    );
    assert.equal(
      run.effectiveConfig.roots.find(
        (root) => root.pluginId === "ai-native-local-runtime-command-evaluator"
      )?.origin,
      "additional"
    );
    assert.equal(
      run.effectiveConfig.disabled.find(
        (item) => item.pluginId === "ai-native-product-ux-evidence-evaluator"
      )?.source,
      "project"
    );
    assert.ok(
      run.effectiveConfig.warnings.some(
        (warning) => warning.code === "deprecated-additionalRoots"
      )
    );
    assert.ok(
      run.effectiveConfig.warnings.some(
        (warning) => warning.code === "deprecated-disabled"
      )
    );
    assert.match(run.reproducibility.configHash ?? "", /^[a-f0-9]{64}$/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("context routes add roots and audit targeted evaluation intent", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-context-route-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    const runFolder = join(tempRoot, "run");
    const projectConfigPath = join(tempRoot, "project-config.json");
    await writeFile(
      projectConfigPath,
      JSON.stringify(
        {
          contextRoutes: [
            {
              id: "pr-opened-advisory",
              description: "Targeted PR opened advisory route.",
              match: {
                reviewType: "event",
                target: "pull_request",
                phase: "opened",
                targetSurface: "pr"
              },
              scope: "PR opened targeted review",
              additionalRoots: [
                {
                  pluginId: "ai-native-pr-readiness-evaluator",
                  reason: "PR opened route checks PR readiness."
                }
              ],
              disabled: [
                {
                  pluginId: "bmad-method-evaluator",
                  reason: "BMAD is not part of this PR opened route."
                }
              ],
              outputIntents: ["advisory", "markdown"],
              affectsOverallScore: false
            }
          ]
        },
        null,
        2
      )
    );

    const runPath = await initRun({
      repoRoot,
      runFolder,
      projectConfigPath,
      reportId: "context-route-test",
      generatedAt: "2026-06-13T00:00:00.000Z",
      repoCommit: "abc123",
      evaluationContext: {
        reviewType: "event",
        target: "pull_request",
        targetRef: "PR-123",
        phase: "opened",
        trigger: "user",
        triggerMetadata: {
          mode: "one_shot",
          source: "user"
        },
        targetSurfaces: ["pr"]
      }
    });
    const run = JSON.parse(await readFile(runPath, "utf8")) as {
      reviewType: string;
      scope: string;
      evaluationContext: {
        reviewType: string;
        target: string;
        targetRef: string;
        triggerMetadata: { mode: string; source: string };
        outputIntents: string[];
        affectsOverallScore: boolean;
      };
      rootPluginIds: string[];
      effectiveConfig: {
        appliedContextRoutes: Array<{ id: string; source: string }>;
        disabled: Array<{ pluginId: string; source: string }>;
      };
    };

    assert.equal(run.reviewType, "event");
    assert.equal(run.scope, "PR opened targeted review");
    assert.deepEqual(run.evaluationContext.outputIntents, ["advisory", "markdown"]);
    assert.equal(run.evaluationContext.affectsOverallScore, false);
    assert.equal(run.evaluationContext.targetRef, "PR-123");
    assert.equal(run.evaluationContext.triggerMetadata.mode, "one_shot");
    assert.equal(run.evaluationContext.triggerMetadata.source, "user");
    assert.equal(run.rootPluginIds[0], "ai-native-pr-lifecycle-evaluator");
    assert.ok(run.rootPluginIds.includes("ai-native-pr-readiness-evaluator"));
    assert.deepEqual(
      run.effectiveConfig.appliedContextRoutes.map((route) => ({
        id: route.id,
        source: route.source
      })),
      [{ id: "pr-opened-advisory", source: "project" }]
    );
    assert.equal(
      run.effectiveConfig.disabled.find(
        (item) => item.pluginId === "bmad-method-evaluator"
      )?.source,
      "project"
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("init-run defaults to a repo-local timestamped artifact bundle", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-cli-init-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    await mkdir(repoRoot, { recursive: true });

    const result = spawnSync(
      process.execPath,
      ["dist/src/cli.js", "init-run", repoRoot, "--repo-commit", "abcdef1234567890"],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    const runPath = result.stdout.trim();
    assert.match(
      runPath,
      /repo\/\.ai-native-eval\/artifacts\/\d{8}T\d{6}Z-abcdef123456\/run\/run\.json$/
    );
    const run = JSON.parse(await readFile(runPath, "utf8")) as {
      runId: string;
      reportId: string;
      reproducibility: { repoCommit?: string };
    };
    assert.match(run.runId, /^\d{8}T\d{6}Z-abcdef123456$/);
    assert.equal(run.reportId, run.runId);
    assert.equal(run.reproducibility.repoCommit, "abcdef1234567890");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("init-run accepts open-ended evaluation context CLI flags", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-cli-context-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    const runFolder = join(tempRoot, "run");
    await mkdir(repoRoot, { recursive: true });

    const result = spawnSync(
      process.execPath,
      [
        "dist/src/cli.js",
        "init-run",
        repoRoot,
        "--out",
        runFolder,
        "--repo-commit",
        "abcdef1234567890",
        "--review-type",
        "turn",
        "--target",
        "user_turn",
        "--target-ref",
        "thread-7:turn-3",
        "--phase",
        "after_user_query",
        "--trigger",
        "agent",
        "--trigger-mode",
        "turn_inline",
        "--trigger-source",
        "agent",
        "--trigger-event",
        "thread.turn.completed",
        "--threshold",
        "0.85",
        "--max-iterations",
        "3",
        "--target-surface",
        "thread",
        "--output-intent",
        "advisory",
        "--affects-overall-score",
        "false",
        "--assumption",
        "Treating this as a lightweight turn guardrail check."
      ],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    const run = JSON.parse(await readFile(result.stdout.trim(), "utf8")) as {
      reviewType: string;
      rootPluginIds: string[];
      evaluationContext: {
        reviewType: string;
        target: string;
        targetRef: string;
        phase: string;
        trigger: string;
        triggerMetadata: {
          mode: string;
          source: string;
          event: string;
          threshold: number;
          maxIterations: number;
        };
        targetSurfaces: string[];
        outputIntents: string[];
        affectsOverallScore: boolean;
        assumption: string;
      };
    };
    assert.equal(run.reviewType, "turn");
    assert.deepEqual(run.rootPluginIds, ["ai-native-turn-guardrail-evaluator"]);
    assert.equal(run.evaluationContext.phase, "after_user_query");
    assert.deepEqual(run.evaluationContext.triggerMetadata, {
      mode: "turn_inline",
      source: "agent",
      event: "thread.turn.completed",
      threshold: 0.85,
      maxIterations: 3
    });
    assert.deepEqual(run.evaluationContext.targetSurfaces, ["thread"]);
    assert.deepEqual(run.evaluationContext.outputIntents, ["advisory"]);
    assert.equal(run.evaluationContext.affectsOverallScore, false);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("init-run defaults explicit PR targets to one-shot trigger mode", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-trigger-default-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    const runFolder = join(tempRoot, "run");
    await mkdir(repoRoot, { recursive: true });

    const runPath = await initRun({
      repoRoot,
      runFolder,
      reportId: "trigger-default-test",
      generatedAt: "2026-06-13T00:00:00.000Z",
      repoCommit: "abc123",
      evaluationContext: {
        reviewType: "event",
        target: "pull_request",
        phase: "opened"
      }
    });
    const run = JSON.parse(await readFile(runPath, "utf8")) as {
      rootPluginIds: string[];
      evaluationContext: {
        target: string;
        triggerMetadata: { mode: string };
      };
    };

    assert.deepEqual(run.rootPluginIds, ["ai-native-pr-lifecycle-evaluator"]);
    assert.equal(run.evaluationContext.triggerMetadata.mode, "one_shot");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("init-run defaults periodic targets to periodic trigger mode", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-trigger-periodic-"));
  try {
    const repoRoot = join(tempRoot, "repo");
    const runFolder = join(tempRoot, "run");
    await mkdir(repoRoot, { recursive: true });

    const runPath = await initRun({
      repoRoot,
      runFolder,
      reportId: "trigger-periodic-test",
      generatedAt: "2026-06-13T00:00:00.000Z",
      repoCommit: "abc123",
      evaluationContext: {
        reviewType: "periodic",
        target: "periodic",
        phase: "scheduled"
      }
    });
    const run = JSON.parse(await readFile(runPath, "utf8")) as {
      rootPluginIds: string[];
      evaluationContext: {
        triggerMetadata: { mode: string };
      };
    };

    assert.deepEqual(run.rootPluginIds, ["ai-native-periodic-health-evaluator"]);
    assert.equal(run.evaluationContext.triggerMetadata.mode, "periodic");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("disabled root remains visible in the report without requiring leaf outputs", async () => {
  const validation = await validateFolderReport({
    runFolder: "fixtures/folder-run.disabled-root",
    skillsDir: "../../../"
  });
  assert.deepEqual(validation.errors, []);

  const report = await buildReportFromFolder({
    runFolder: "fixtures/folder-run.disabled-root",
    skillsDir: "../../../"
  });
  const html = renderHtmlReport(report);
  const disabledNode = findNode(
    report.root,
    "ai-native-product-ux-evidence-evaluator"
  );

  assert.equal(disabledNode.status, "not_applicable");
  assert.equal(disabledNode.pointsAvailable, 0);
  assert.equal(disabledNode.disabledSource, "project");
  assert.equal(disabledNode.children.length, 0);
  assert.deepEqual(report.pluginResolution?.disabledPluginIds, [
    "ai-native-product-ux-evidence-evaluator",
    "ai-native-product-design-readiness-evaluator",
    "ai-native-ux-mock-contract-evaluator",
    "ai-native-design-review-gate-evaluator",
    "ai-native-visual-evidence-evaluator"
  ]);
  assert.match(html, /Run Configuration/);
  assert.match(html, /This project has no visible product workflow in scope/);
  assert.match(html, /node-badge disabled/);
});

test("per-evaluator config can add and disable children under the selected pack", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-evaluator-config-"));
  try {
    const runFolder = join(tempRoot, "run");
    await mkdir(join(runFolder, "evaluators"), { recursive: true });
    const disabledChildren = [
      "ai-native-pr-readiness-evaluator",
      "ai-native-ci-required-checks-evaluator",
      "ai-native-review-contract-evaluator",
      "ai-native-acceptance-proof-evaluator",
      "ai-native-artifact-traceability-evaluator",
      "ai-native-quality-gate-skip-policy-evaluator",
      "ai-native-thread-closeout-evaluator",
      "ai-native-local-runtime-command-evaluator"
    ].map((pluginId) => ({
      pluginId,
      reason: "Disabled for evaluator config test."
    }));
    await writeFile(
      join(runFolder, "run.json"),
      JSON.stringify(
        {
          reportId: "per-evaluator-config-test",
          generatedAt: "2026-06-13T00:00:00.000Z",
          scope: "per evaluator config test",
          evaluationContext: {
            reviewType: "event",
            target: "pull_request",
            phase: "opened"
          },
          rootPluginIds: ["ai-native-pr-lifecycle-evaluator"],
          effectiveConfig: {
            schemaVersion: 1,
            configSources: [{ kind: "project", found: true }],
            builtInRootPluginIds: ["ai-native-pr-lifecycle-evaluator"],
            roots: [
              {
                pluginId: "ai-native-pr-lifecycle-evaluator",
                origin: "built-in",
                source: "built-in"
              }
            ],
            evaluatorConfigs: [
              {
                pluginId: "ai-native-pr-lifecycle-evaluator",
                source: "project",
                enabled: true,
                additionalChildren: [
                  {
                    pluginId: "ai-native-local-runtime-command-evaluator",
                    weight: 0.25,
                    required: false,
                    reason: "Project wants runtime command evidence in PR checks.",
                    source: "project"
                  }
                ],
                disabledChildren: disabledChildren.map((child) => ({
                  ...child,
                  source: "project"
                })),
                settings: {
                  defaultPhase: "opened",
                  triggers: {
                    self_iteration: {
                      minimumScore: 0.85,
                      maxIterations: 3
                    }
                  }
                }
              }
            ],
            disabled: [],
            warnings: []
          }
        },
        null,
        2
      )
    );

    const validation = await validateFolderReport({
      runFolder,
      skillsDir: "../../../"
    });
    assert.deepEqual(validation.errors, []);

    const report = await buildReportFromFolder({
      runFolder,
      skillsDir: "../../../"
    });
    const html = renderHtmlReport(report);
    const added = findNode(report.root, "ai-native-local-runtime-command-evaluator");
    assert.equal(added.status, "not_applicable");
    assert.equal(added.disabledSource, "project");
    assert.match(html, /Evaluator configs/);
    assert.match(html, /ai-native-local-runtime-command-evaluator/);
    assert.equal(report.policy?.status, "pass");
    assert.ok(
      report.policy?.results.some(
        (result) => result.ruleId === "pr-readiness-min-score"
      )
    );
    assert.deepEqual(
      report.runConfig?.evaluatorConfigs?.[0]?.settings?.triggers,
      {
        self_iteration: {
          minimumScore: 0.85,
          maxIterations: 3
        }
      }
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("folder reports preserve evaluation context in rendered artifacts", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-folder-context-"));
  try {
    const runFolder = join(tempRoot, "run");
    await cp("fixtures/folder-run.valid", runFolder, { recursive: true });
    const runJsonPath = join(runFolder, "run.json");
    const run = JSON.parse(await readFile(runJsonPath, "utf8"));
    run.evaluationContext = {
      reviewType: "periodic",
      target: "repo",
      phase: "weekly",
      trigger: "schedule",
      triggerMetadata: {
        mode: "periodic",
        source: "scheduler",
        event: "weekly.health",
        threshold: 0.8,
        maxIterations: 1
      },
      outputIntents: ["artifact"],
      affectsOverallScore: true
    };
    await writeFile(runJsonPath, `${JSON.stringify(run, null, 2)}\n`);

    const report = await buildReportFromFolder({
      runFolder,
      skillsDir: "../../../"
    });
    const markdown = renderMarkdownReport(report);
    const html = renderHtmlReport(report);
    const manifest = buildIncrementalManifest({
      manifestId: report.reportId,
      generatedAt: report.generatedAt,
      evaluationContext: report.evaluationContext,
      changedFiles: []
    });

    assert.equal(report.evaluationContext?.reviewType, "periodic");
    assert.match(markdown, /Evaluation Context/);
    assert.match(markdown, /Review type: periodic/);
    assert.match(markdown, /Trigger mode: periodic/);
    assert.match(markdown, /Trigger owner: external systems own scheduling/);
    assert.match(html, /Evaluation Context/);
    assert.match(html, /Trigger mode/);
    assert.match(html, /weekly\.health/);
    assert.equal(manifest.evaluationContext?.phase, "weekly");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("folder validation can load disabled non-ai-native evaluator roots", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-eval-disabled-bmad-"));
  try {
    const runFolder = join(tempRoot, "run");
    await mkdir(runFolder, { recursive: true });
    await writeFile(
      join(runFolder, "run.json"),
      JSON.stringify(
        {
          reportId: "disabled-bmad-test",
          generatedAt: "2026-06-14T00:00:00.000Z",
          scope: "disabled bmad validation",
          rootPluginIds: ["bmad-method-evaluator"],
          effectiveConfig: {
            schemaVersion: 1,
            configSources: [{ kind: "built-in", found: true }],
            builtInRootPluginIds: ["bmad-method-evaluator"],
            roots: [
              {
                pluginId: "bmad-method-evaluator",
                origin: "built-in",
                source: "built-in"
              }
            ],
            disabled: [
              {
                pluginId: "bmad-method-evaluator",
                reason: "Not in scope for this test.",
                source: "explicit"
              }
            ]
          }
        },
        null,
        2
      )
    );
    await mkdir(join(runFolder, "evaluators"), { recursive: true });

    const validation = await validateFolderReport({
      runFolder,
      skillsDir: "../../../"
    });
    assert.deepEqual(validation.errors, []);

    const report = await buildReportFromFolder({
      runFolder,
      skillsDir: "../../../"
    });
    assert.equal(report.root.children[0]?.pluginId, "bmad-method-evaluator");
    assert.equal(report.root.children[0]?.status, "not_applicable");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("folder validation rejects outputs under disabled subtrees", async () => {
  const result = await validateFolderReport({
    runFolder: "fixtures/folder-run.disabled-output",
    skillsDir: "../../../"
  });

  assert.ok(
    result.errors.some((error) =>
      error.includes(
        "output exists under disabled subtree ai-native-product-ux-evidence-evaluator"
      )
    )
  );
});

test("additional roots are audited in config and marked in the report", async () => {
  const report = await buildReportFromFolder({
    runFolder: "fixtures/folder-run.additional-root",
    skillsDir: "../../../"
  });
  const html = renderHtmlReport(report);
  const node = findNode(report.root, "ai-native-local-runtime-command-evaluator");

  assert.equal(node.origin, "additional");
  assert.equal(report.summary.score0To100, 100);
  assert.match(html, /Project wants a focused runtime command review/);
  assert.match(html, /node-badge additional/);
  assert.match(html, /Additional/);
});

test("folder validation rejects evaluator filename and plugin id mismatches", async () => {
  const result = await validateFolderReport({
    runFolder: "fixtures/folder-run.filename-mismatch",
    skillsDir: "../../../"
  });

  assert.ok(
    result.errors.some((error) =>
      error.includes(
        "filename pluginId not-the-runtime-plugin does not match output pluginId ai-native-local-runtime-command-evaluator"
      )
    )
  );
});

test("targeted folder fixture proves expected pass and fail rubric matches", async () => {
  const report = await buildReportFromFolder({
    runFolder: "fixtures/folder-run.targeted",
    skillsDir: "../../../"
  });
  const html = renderHtmlReport(report);

  const runtime = findNode(report.root, "ai-native-local-runtime-command-evaluator");
  const readme = findNode(report.root, "ai-native-readme-onboarding-evaluator");
  const testSurface = findNode(report.root, "ai-native-test-command-surface-evaluator");

  assert.equal(groupLost(runtime, "runtime-entrypoints"), 0);
  assert.equal(groupLost(runtime, "scriptability"), 0);
  assert.equal(groupLost(runtime, "runtime-command-validation"), 0);
  assert.equal(runtime.score0To10, 10);

  assert.equal(groupLost(readme, "repo-purpose"), 0);
  assert.equal(groupLost(readme, "first-run-path"), 0);
  assert.equal(groupLost(readme, "next-step-routing"), 0.125);

  assert.equal(groupLost(testSurface, "test-command-coverage"), 0.1);
  assert.equal(groupLost(testSurface, "test-command-documentation"), 0);
  assert.equal(groupLost(testSurface, "test-result-actionability"), 0);

  assert.match(html, /Missing next-step routing/);
  assert.match(html, /Incomplete test command coverage/);
  assert.doesNotMatch(html, /Evidence-backed deduction/);
});

test("creates append-only artifact paths and incremental manifests", () => {
  const runId = createRunId({
    generatedAt: "2026-06-13T12:00:00.000Z",
    headCommit: "abcdef1234567890"
  });
  assert.equal(runId, "20260613T120000Z-abcdef123456");

  const paths = artifactPaths(runId);
  assert.equal(
    paths.bundleRoot,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456"
  );
  assert.equal(
    paths.runFolder,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/run"
  );
  assert.equal(
    paths.reportHtmlPath,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/report.html"
  );
  assert.equal(
    paths.reportMarkdownPath,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/report.md"
  );
  assert.equal(
    paths.reportJsonPath,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/report.json"
  );
  assert.equal(
    paths.snapshotPath,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/snapshot.json"
  );
  assert.equal(
    paths.manifestPath,
    ".ai-native-eval/artifacts/20260613T120000Z-abcdef123456/manifest.json"
  );

  const manifest = buildIncrementalManifest({
    manifestId: runId,
    generatedAt: "2026-06-13T12:00:00.000Z",
    baseCommit: "base",
    headCommit: "head",
    changedFiles: ["docs/blueprint.md", ".github/workflows/test.yml", "src/index.ts"]
  });
  assert.deepEqual(manifest.changedEvidenceSurfaces, ["ci", "docs", "source"]);
});

function findNode(
  node: EvaluationReport["root"],
  pluginId: string
): EvaluationReport["root"] {
  const found = findNodeOrUndefined(node, pluginId);
  if (!found) throw new Error(`Could not find node for plugin ${pluginId}`);
  return found;
}

function findNodeOrUndefined(
  node: EvaluationReport["root"],
  pluginId: string
): EvaluationReport["root"] | undefined {
  if (node.pluginId === pluginId) return node;
  for (const child of node.children) {
    const found = findNodeOrUndefined(child, pluginId);
    if (found) return found;
  }
  return undefined;
}

function groupLost(node: EvaluationReport["root"], groupId: string): number {
  const group = node.deductionGroups?.find((candidate) => candidate.id === groupId);
  if (!group) throw new Error(`Could not find group ${groupId} on ${node.id}`);
  return group.pointsLost;
}

test("merges updated subtrees while carrying forward unchanged nodes", () => {
  const previousRoot: EvaluationNodeInput = {
    id: "root",
    label: "Root",
    children: [
      {
        id: "docs",
        label: "Docs",
        children: [
          {
            id: "docs.runtime",
            label: "Runtime docs",
            dimension: "documentation_onboarding",
            status: "partial",
            pointsAvailable: 1
          }
        ]
      },
      {
        id: "github",
        label: "GitHub",
        dimension: "issue_readiness",
        status: "missing",
        pointsAvailable: 1
      }
    ]
  };

  const updatedDocs: EvaluationNodeInput = {
    id: "docs",
    label: "Docs",
    children: [
      {
        id: "docs.runtime",
        label: "Runtime docs",
        dimension: "documentation_onboarding",
        status: "pass",
        pointsAvailable: 1
      }
    ]
  };

  const merged = mergeCarriedForwardTree({
    previousRoot,
    updatedNodes: [updatedDocs],
    previousSnapshotId: "snapshot-a"
  });

  assert.deepEqual(merged.carriedForwardNodeIds, ["github", "root"]);
  assert.equal(merged.root.children?.[0]?.carriedForwardFrom, undefined);
  assert.equal(merged.root.children?.[1]?.carriedForwardFrom, "snapshot-a");

  const report = buildReport({ root: merged.root, generatedAt: "fixed" });
  assert.equal(report.summary.dimensions.find((d) => d.dimension === "documentation_onboarding")?.score0To10, 10);
  assert.equal(report.summary.dimensions.find((d) => d.dimension === "issue_readiness")?.score0To10, 0);
});
