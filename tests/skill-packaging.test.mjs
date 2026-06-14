import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("evaluator skills are standalone SKILL.md-first plugins", async () => {
  const skillDirs = await readdir(".agents/skills", { withFileTypes: true });
  const evaluatorSkillPaths = skillDirs
    .filter((entry) => entry.isDirectory())
    .map((entry) => `.agents/skills/${entry.name}/SKILL.md`)
    .filter((path) => path.includes("ai-native-") && path.endsWith("-evaluator/SKILL.md"))
    .sort();

  assert.ok(evaluatorSkillPaths.length >= 30);

  for (const path of evaluatorSkillPaths) {
    const body = await readFile(path, "utf8");
    assert.match(body, /## Plugin Manifest/, path);
    assert.match(body, /## Evidence/, path);
    assert.match(body, /## Scoring Rules/, path);
    assert.match(body, /## Required Checks/, path);
    assert.match(body, /## Output Expectations/, path);
    assert.match(body, /directChildren/, path);
    const directChildren = body.match(/"directChildren": \[([\s\S]*?)\]/);
    assert.ok(directChildren, path);
    if (directChildren[1].trim() === "") {
      assert.match(body, /per-leaf evaluator JSON file/, path);
      assert.match(body, /groupId/, path);
      assert.match(body, /deductionId/, path);
      assert.match(body, /Do not output `deductionGroups`/, path);
    } else {
      assert.match(body, /This is a grouping evaluator/, path);
      assert.match(body, /direct children declared in this skill's Plugin Manifest/, path);
      assert.match(body, /eval tool assembles the runtime tree/, path);
    }
    assert.doesNotMatch(body, /ai-native-evaluator-protocol/, path);
    assert.doesNotMatch(body, /ai-native-eval\/references/, path);
  }
});

test("fine-grained evaluator pack covers workflow surfaces", async () => {
  const requiredEvaluatorDirs = [
    "ai-native-foundation-evaluator",
    "ai-native-eval-self-evaluator",
    "ai-native-eval-rubric-quality-evaluator",
    "ai-native-eval-aggregation-integrity-evaluator",
    "ai-native-eval-plugin-boundary-integrity-evaluator",
    "ai-native-local-runtime-command-evaluator",
    "ai-native-local-environment-reproducibility-evaluator",
    "ai-native-repo-thread-bootstrap-evaluator",
    "ai-native-worktree-isolation-evaluator",
    "ai-native-parallel-agent-capacity-evaluator",
    "ai-native-thread-closeout-evaluator",
    "ai-native-issue-readiness-evaluator",
    "ai-native-pr-readiness-evaluator",
    "ai-native-review-contract-evaluator",
    "ai-native-auto-merge-safety-evaluator",
    "ai-native-product-design-readiness-evaluator",
    "ai-native-ux-mock-contract-evaluator",
    "ai-native-design-review-gate-evaluator",
    "ai-native-visual-evidence-evaluator",
    "ai-native-known-issue-awareness-evaluator",
    "ai-native-recurrence-prevention-evaluator",
    "ai-native-skill-routing-quality-evaluator",
    "ai-native-skill-maintenance-quality-evaluator",
    "bmad-method-evaluator",
    "bmad-product-brief-evaluator",
    "bmad-prd-quality-evaluator",
    "bmad-architecture-readiness-evaluator",
    "bmad-epic-story-breakdown-evaluator",
    "bmad-story-context-quality-evaluator"
  ];

  for (const dir of requiredEvaluatorDirs) {
    const body = await readFile(`.agents/skills/${dir}/SKILL.md`, "utf8");
    assert.match(body, new RegExp(`"pluginId": "${dir}"`), dir);
    assert.match(body, /Evaluate one thing:|This is a grouping evaluator\./, dir);
  }

  const parentExpectations = [
    [
      "ai-native-eval-self-evaluator",
      [
        "ai-native-eval-rubric-quality-evaluator",
        "ai-native-eval-aggregation-integrity-evaluator",
        "ai-native-eval-plugin-boundary-integrity-evaluator"
      ]
    ],
    [
      "ai-native-foundation-evaluator",
      [
        "ai-native-repo-operability-evaluator",
        "ai-native-docs-evaluator",
        "ai-native-agent-readiness-evaluator",
        "ai-native-github-evaluator",
        "ai-native-ci-test-evaluator",
        "ai-native-product-ux-evidence-evaluator",
        "ai-native-architecture-evaluator",
        "ai-native-evidence-evaluator"
      ]
    ],
    [
      "ai-native-repo-operability-evaluator",
      [
        "ai-native-local-runtime-command-evaluator",
        "ai-native-local-environment-reproducibility-evaluator"
      ]
    ],
    [
      "ai-native-agent-readiness-evaluator",
      [
        "ai-native-repo-thread-bootstrap-evaluator",
        "ai-native-worktree-isolation-evaluator",
        "ai-native-parallel-agent-capacity-evaluator",
        "ai-native-thread-closeout-evaluator",
        "ai-native-skill-routing-quality-evaluator"
      ]
    ],
    [
      "ai-native-product-ux-evidence-evaluator",
      [
        "ai-native-product-design-readiness-evaluator",
        "ai-native-ux-mock-contract-evaluator",
        "ai-native-design-review-gate-evaluator",
        "ai-native-visual-evidence-evaluator"
      ]
    ],
    [
      "bmad-method-evaluator",
      [
        "bmad-analysis-evaluator",
        "bmad-planning-evaluator",
        "bmad-solutioning-evaluator",
        "bmad-implementation-evaluator",
        "bmad-core-practices-evaluator"
      ]
    ]
  ];

  for (const [parent, children] of parentExpectations) {
    const body = await readFile(`.agents/skills/${parent}/SKILL.md`, "utf8");
    for (const child of children) {
      assert.match(body, new RegExp(`"pluginId": "${child}"`), `${parent} -> ${child}`);
    }
  }
});

test("leaf evaluator skills define their own deduction group rubrics", async () => {
  const skillDirs = await readdir(".agents/skills", { withFileTypes: true });
  const evaluatorSkillPaths = skillDirs
    .filter((entry) => entry.isDirectory())
    .map((entry) => `.agents/skills/${entry.name}/SKILL.md`)
    .filter((path) => path.includes("ai-native-") && path.endsWith("-evaluator/SKILL.md"))
    .sort();

  const leafEvaluatorPaths = [];

  for (const path of evaluatorSkillPaths) {
    const body = await readFile(path, "utf8");
    const directChildren = body.match(/"directChildren": \[([\s\S]*?)\]/);
    assert.ok(directChildren, path);

    if (directChildren[1].trim() === "") {
      leafEvaluatorPaths.push(path);
      assert.match(body, /## Deduction Groups/, path);
      assert.match(body, /```ai-native-deduction-groups/, path);
      assert.match(body, /"budget":/, path);
      assert.match(body, /"appliesWhen":/, path);
      assert.match(body, /"evidenceRequired":/, path);
      assert.match(body, /"recommendation":/, path);
      assert.match(body, /full group budget/, path);
      assert.match(body, /convert each rubric item into a runtime deduction/, path);
    }
  }

  assert.ok(leafEvaluatorPaths.length >= 30);
});

test("eval skill bundles the only report rendering tool source", async () => {
  const skillBody = await readFile(
    ".agents/skills/ai-native-eval/SKILL.md",
    "utf8"
  );
  const packageBody = await readFile(
    ".agents/skills/ai-native-eval/scripts/eval/package.json",
    "utf8"
  );
  const cliBody = await readFile(
    ".agents/skills/ai-native-eval/scripts/eval/src/cli.ts",
    "utf8"
  );
  const fixtureBody = await readFile(
    ".agents/skills/ai-native-eval/scripts/eval/fixtures/evaluation-tree.example.json",
    "utf8"
  );

  assert.match(skillBody, /scripts\/eval/);
  assert.match(skillBody, /pnpm --dir scripts\/eval render-folder/);
  assert.match(skillBody, /validate-folder/);
  assert.match(packageBody, /"bin":/);
  assert.match(packageBody, /"ai-native-eval": "dist\/src\/cli\.js"/);
  assert.match(cliBody, /renderHtmlReport/);
  assert.match(cliBody, /render-folder/);
  assert.match(fixtureBody, /"root"/);

  const rootEntries = await readdir(".");
  assert.equal(rootEntries.includes("src"), false);
  assert.equal(rootEntries.includes("fixtures"), false);
  assert.equal(rootEntries.includes("tsconfig.json"), false);
  assert.equal(rootEntries.includes("pnpm-lock.yaml"), true);
  assert.equal(rootEntries.includes("tools"), true);
});

test("every skill owns a skillgrade eval case", async () => {
  const skillDirs = await readdir(".agents/skills", { withFileTypes: true });
  const skillNames = skillDirs
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("_"))
    .sort();

  assert.equal(skillNames.length, 57);

  for (const skill of skillNames) {
    const evalYamlPath = `.agents/skills/${skill}/evals/eval.yaml`;
    const expectationPath = `.agents/skills/${skill}/evals/expectations/basic-routing.json`;
    const solutionPath = `.agents/skills/${skill}/evals/solutions/basic-routing.sh`;
    const [evalYaml, expectation] = await Promise.all([
      readFile(evalYamlPath, "utf8"),
      readFile(expectationPath, "utf8")
    ]);

    await access(solutionPath);
    assert.match(evalYaml, /agent: codex/, evalYamlPath);
    assert.match(evalYaml, /provider: local/, evalYamlPath);
    assert.match(evalYaml, /grade-response\.mjs/, evalYamlPath);
    assert.match(evalYaml, new RegExp(skill), evalYamlPath);
    assert.match(expectation, /AI_NATIVE_SKILL_EVAL_COMPLETE/, expectationPath);
    assert.match(expectation, new RegExp(skill), expectationPath);
  }
});

test("root skill eval runner separates contract and real-agent live modes", async () => {
  const [packageBody, runnerBody, wrapperBody, readmeBody] = await Promise.all([
    readFile("package.json", "utf8"),
    readFile("tools/skill-eval.sh", "utf8"),
    readFile(".agents/skills/_eval-support/bin/codex", "utf8"),
    readFile("README.md", "utf8")
  ]);

  assert.match(packageBody, /"skill-eval:contract": "tools\/skill-eval\.sh contract"/);
  assert.match(packageBody, /"skill-eval:live": "tools\/skill-eval\.sh live"/);
  assert.match(runnerBody, /--validate --ci --provider=local/);
  assert.match(runnerBody, /--agent=codex --provider=local --trials=1/);
  assert.match(runnerBody, /mindepth 3 -maxdepth 3/);
  assert.match(runnerBody, /AI_NATIVE_EVAL_REAL_CODEX="\$\{real_codex\}"/);
  assert.match(wrapperBody, /exec "\$AI_NATIVE_EVAL_REAL_CODEX"/);
  assert.match(readmeBody, /`contract` mode does not invoke a real agent/i);
  assert.match(readmeBody, /`live` mode intentionally invokes the real Codex CLI/i);
});
