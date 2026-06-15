#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { buildReport } from "./aggregate.js";
import { initRun } from "./config.js";
import {
  buildReportFromFolder,
  FolderValidationError,
  validateFolderReport
} from "./folderReport.js";
import {
  artifactPaths,
  buildIncrementalManifest,
  createRunId,
  snapshotFromReport,
  writeJsonArtifact
} from "./persistence.js";
import { renderHtmlReport } from "./renderHtml.js";
import { renderMarkdownReport } from "./renderMarkdown.js";
import type {
  EvaluationContext,
  EvaluationNodeInput,
  EvaluationReport,
  ReportUiLanguage,
  TriggerMetadata,
  TriggerMode
} from "./types.js";

async function main(): Promise<void> {
  const [command, inputPath, ...rest] = process.argv.slice(2);
  if (
    !command ||
    !inputPath ||
    ![
      "score",
      "render",
      "persist",
      "init-run",
      "validate-folder",
      "render-folder"
    ].includes(command)
  ) {
    usage();
    process.exitCode = 2;
    return;
  }

  if (command === "init-run") {
    await runInitRunCommand(inputPath, rest);
    return;
  }

  if (command === "validate-folder" || command === "render-folder") {
    await runFolderCommand(command, inputPath, rest);
    return;
  }

  const input = JSON.parse(await readFile(inputPath, "utf8")) as {
    reportId?: string;
    generatedAt?: string;
    language?: string;
    uiLanguage?: ReportUiLanguage;
    scope?: string;
    evaluationContext?: EvaluationContext;
    root: EvaluationNodeInput;
    pluginResolution?: EvaluationReport["pluginResolution"];
    executionBatches?: EvaluationReport["executionBatches"];
    evaluatorRuns?: EvaluationReport["evaluatorRuns"];
    reproducibility?: Record<string, string>;
  };
  const language = readOption(rest, "--language");
  const uiLanguage = readOption(rest, "--ui-language") as
    | ReportUiLanguage
    | undefined;
  if (language) input.language = language;
  if (uiLanguage) input.uiLanguage = uiLanguage;
  input.evaluationContext = readEvaluationContext(rest, input.evaluationContext);
  const report = buildReport(input);

  if (command === "score") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (command === "persist") {
    const root = readOption(rest, "--root") ?? ".ai-native-eval/artifacts";
    const runId = createRunId({
      generatedAt: report.generatedAt,
      headCommit: report.reproducibility?.repoCommit
    });
    const paths = artifactPaths(runId, root);
    const manifest = buildIncrementalManifest({
      manifestId: runId,
      generatedAt: report.generatedAt,
      evaluationContext: report.evaluationContext,
      headCommit: report.reproducibility?.repoCommit,
      changedFiles: readRepeatedOption(rest, "--changed-file")
    });
    await writeJsonArtifact(paths.reportJsonPath, report);
    await writeJsonArtifact(paths.snapshotPath, snapshotFromReport(report));
    await writeJsonArtifact(paths.manifestPath, manifest);
    await mkdir(dirname(paths.reportMarkdownPath), { recursive: true });
    await writeFile(paths.reportMarkdownPath, renderMarkdownReport(report));
    await mkdir(dirname(paths.reportHtmlPath), { recursive: true });
    await writeFile(paths.reportHtmlPath, renderHtmlReport(report));
    console.log(JSON.stringify(paths, null, 2));
    return;
  }

  const out = readOption(rest, "--out");
  if (!out) {
    console.error("Missing --out <path>");
    process.exitCode = 2;
    return;
  }
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, renderHtmlReport(report));
  console.log(out);
}

async function runInitRunCommand(repoRoot: string, rest: string[]): Promise<void> {
  const repoCommit = readOption(rest, "--repo-commit") ?? readGitCommit(repoRoot);
  const generatedAt = new Date().toISOString();
  const reportId =
    readOption(rest, "--report-id") ??
    createRunId({
      generatedAt,
      headCommit: repoCommit
    });
  const out =
    readOption(rest, "--out") ??
    join(repoRoot, ".ai-native-eval", "artifacts", reportId, "run");
  const runPath = await initRun({
    repoRoot,
    runFolder: out,
    personConfigPath: readOption(rest, "--person-config"),
    projectConfigPath: readOption(rest, "--project-config"),
    explicitConfigPath: readOption(rest, "--config"),
    reportId,
    generatedAt,
    language: readOption(rest, "--language"),
    uiLanguage: readOption(rest, "--ui-language") as ReportUiLanguage | undefined,
    scope: readOption(rest, "--scope"),
    evaluationContext: readEvaluationContext(rest),
    repoCommit
  });
  console.log(runPath);
}

function readGitCommit(repoRoot: string): string | undefined {
  const result = spawnSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], {
    encoding: "utf8"
  });
  if (result.status !== 0) return undefined;
  return result.stdout.trim() || undefined;
}

async function runFolderCommand(
  command: "validate-folder" | "render-folder",
  inputPath: string,
  rest: string[]
): Promise<void> {
  const skillsDir = readOption(rest, "--skills-dir") ?? ".agents/skills";
  const validation = await validateFolderReport({
    runFolder: inputPath,
    skillsDir
  });
  if (validation.errors.length > 0) {
    printValidationErrors(validation.errors);
    process.exitCode = 1;
    return;
  }
  if (command === "validate-folder") {
    console.log("Folder validation passed");
    return;
  }

  try {
    const report = await buildReportFromFolder({
      runFolder: inputPath,
      skillsDir
    });
    const explicitOut = readOption(rest, "--out");
    const explicitJsonOut = readOption(rest, "--json-out");
    const explicitMarkdownOut = readOption(rest, "--markdown-out");
    const defaultOutputs =
      !explicitOut && !explicitJsonOut && !explicitMarkdownOut
        ? defaultReportOutputs(inputPath)
        : undefined;
    const out = explicitOut ?? defaultOutputs?.html;
    const jsonOut = explicitJsonOut ?? defaultOutputs?.json;
    const markdownOut = explicitMarkdownOut ?? defaultOutputs?.markdown;
    if (!out && !jsonOut && !markdownOut) {
      console.error(
        "Missing one of --out <report.html>, --json-out <report.json>, or --markdown-out <report.md>"
      );
      process.exitCode = 2;
      return;
    }
    if (out) {
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, renderHtmlReport(report));
      console.log(out);
    }
    if (jsonOut) {
      await mkdir(dirname(jsonOut), { recursive: true });
      await writeFile(jsonOut, `${JSON.stringify(report, null, 2)}\n`);
      console.log(jsonOut);
    }
    if (markdownOut) {
      await mkdir(dirname(markdownOut), { recursive: true });
      await writeFile(markdownOut, renderMarkdownReport(report));
      console.log(markdownOut);
    }
    if (defaultOutputs) {
      await writeJsonArtifact(defaultOutputs.snapshot, snapshotFromReport(report));
      await writeJsonArtifact(
        defaultOutputs.manifest,
        buildIncrementalManifest({
          manifestId: report.reportId,
          generatedAt: report.generatedAt,
          evaluationContext: report.evaluationContext,
          headCommit: report.reproducibility?.repoCommit,
          changedFiles: []
        })
      );
      console.log(defaultOutputs.snapshot);
      console.log(defaultOutputs.manifest);
    }
  } catch (error) {
    if (error instanceof FolderValidationError) {
      printValidationErrors(error.errors);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

function printValidationErrors(errors: string[]): void {
  console.error(`Folder validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
}

function defaultReportOutputs(runFolder: string):
  | { html: string; json: string; markdown: string; snapshot: string; manifest: string }
  | undefined {
  if (basename(runFolder) !== "run") return undefined;
  const bundleRoot = dirname(runFolder);
  return {
    html: join(bundleRoot, "report.html"),
    json: join(bundleRoot, "report.json"),
    markdown: join(bundleRoot, "report.md"),
    snapshot: join(bundleRoot, "snapshot.json"),
    manifest: join(bundleRoot, "manifest.json")
  };
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function usage(): void {
  console.error(`Usage:
  ai-native-eval score <evaluation-tree.json>
  ai-native-eval render <evaluation-tree.json> --out <report.html> [--language zh-TW] [--ui-language zh-CN|zh-TW|es|de|ja] [--review-type event] [--target pull_request] [--phase opened] [--trigger-mode one_shot] [--target-surface pr]...
  ai-native-eval persist <evaluation-tree.json> [--root .ai-native-eval/artifacts] [--language zh-TW] [--ui-language zh-CN|zh-TW|es|de|ja] [--changed-file <path>]... [--review-type event] [--target pull_request] [--trigger-mode one_shot]
  ai-native-eval init-run <repo-root> [--out <run-folder>] [--config <path>] [--project-config <path>] [--person-config <path>] [--review-type event] [--target pull_request] [--target-ref PR-123] [--phase opened] [--trigger user] [--trigger-mode external_event] [--trigger-source github] [--trigger-event pull_request.opened] [--threshold 0.85] [--max-iterations 3] [--target-surface pr]...
  ai-native-eval validate-folder <run-folder> [--skills-dir .agents/skills]
  ai-native-eval render-folder <run-folder> [--out <report.html>] [--json-out <report.json>] [--markdown-out <report.md>] [--skills-dir .agents/skills]

Default repo-local artifact bundle:
  init-run without --out creates .ai-native-eval/artifacts/<timestamp>-<commit>/run
  render-folder on a bundle run folder writes report.html, report.md, report.json, snapshot.json, and manifest.json beside run/`);
}

function readRepeatedOption(args: string[], name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name && args[index + 1]) {
      values.push(args[index + 1]);
      index += 1;
    }
  }
  return values;
}

function readEvaluationContext(
  args: string[],
  existing?: EvaluationContext
): EvaluationContext | undefined {
  const reviewType = readOption(args, "--review-type");
  const target = readOption(args, "--target");
  const targetRef = readOption(args, "--target-ref");
  const phase = readOption(args, "--phase");
  const trigger = readOption(args, "--trigger");
  const triggerMetadata = readTriggerMetadata(args, target, existing?.triggerMetadata);
  const assumption = readOption(args, "--assumption");
  const targetSurfaces = readRepeatedOption(args, "--target-surface");
  const outputIntents = readRepeatedOption(args, "--output-intent");
  const affectsOverallScore = readBooleanOption(args, "--affects-overall-score");
  if (
    !existing &&
    !reviewType &&
    !target &&
    !targetRef &&
    !phase &&
    !trigger &&
    !triggerMetadata &&
    !assumption &&
    targetSurfaces.length === 0 &&
    outputIntents.length === 0 &&
    affectsOverallScore === undefined
  ) {
    return undefined;
  }
  return {
    ...(existing ?? { reviewType: "custom" }),
    ...(reviewType ? { reviewType } : {}),
    ...(target ? { target } : {}),
    ...(targetRef ? { targetRef } : {}),
    ...(phase ? { phase } : {}),
    ...(trigger ? { trigger } : {}),
    ...(triggerMetadata ? { triggerMetadata } : {}),
    ...(targetSurfaces.length > 0 ? { targetSurfaces } : {}),
    ...(outputIntents.length > 0 ? { outputIntents } : {}),
    ...(affectsOverallScore !== undefined ? { affectsOverallScore } : {}),
    ...(assumption ? { assumption } : {})
  };
}

function readTriggerMetadata(
  args: string[],
  target: string | undefined,
  existing?: TriggerMetadata
): TriggerMetadata | undefined {
  const explicitMode = readOption(args, "--trigger-mode");
  const source = readOption(args, "--trigger-source");
  const event = readOption(args, "--trigger-event");
  const threshold = readNumberOption(args, "--threshold");
  const maxIterations = readIntegerOption(args, "--max-iterations");
  const mode = explicitMode
    ? parseTriggerMode(explicitMode)
    : defaultTriggerModeForTarget(target);
  if (
    !existing &&
    !mode &&
    !source &&
    !event &&
    threshold === undefined &&
    maxIterations === undefined
  ) {
    return undefined;
  }
  return {
    ...(existing ?? { mode: mode ?? "one_shot" }),
    ...(mode ? { mode } : {}),
    ...(source ? { source } : {}),
    ...(event ? { event } : {}),
    ...(threshold !== undefined ? { threshold } : {}),
    ...(maxIterations !== undefined ? { maxIterations } : {})
  };
}

function defaultTriggerModeForTarget(target: string | undefined): TriggerMode | undefined {
  if (!target) return undefined;
  return ["periodic", "schedule", "scheduled"].includes(target)
    ? "periodic"
    : "one_shot";
}

function parseTriggerMode(value: string): TriggerMode {
  const modes = new Set<TriggerMode>([
    "one_shot",
    "turn_inline",
    "self_iteration",
    "periodic",
    "external_event"
  ]);
  if (!modes.has(value as TriggerMode)) {
    throw new Error(
      `--trigger-mode must be one of ${Array.from(modes).join(", ")}`
    );
  }
  return value as TriggerMode;
}

function readNumberOption(args: string[], name: string): number | undefined {
  const value = readOption(args, name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number`);
  return parsed;
}

function readIntegerOption(args: string[], name: string): number | undefined {
  const parsed = readNumberOption(args, name);
  if (parsed === undefined) return undefined;
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return parsed;
}

function readBooleanOption(args: string[], name: string): boolean | undefined {
  const value = readOption(args, name);
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
