#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
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
  EvaluationNodeInput,
  EvaluationReport,
  ReportUiLanguage
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
      headCommit: report.reproducibility?.repoCommit,
      changedFiles: readRepeatedOption(rest, "--changed-file")
    });
    await writeJsonArtifact(paths.reportJsonPath, report);
    await writeJsonArtifact(paths.snapshotPath, snapshotFromReport(report));
    await writeJsonArtifact(paths.manifestPath, manifest);
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
  const out = readOption(rest, "--out");
  if (!out) {
    console.error("Missing --out <run-folder>");
    process.exitCode = 2;
    return;
  }
  const runPath = await initRun({
    repoRoot,
    runFolder: out,
    personConfigPath: readOption(rest, "--person-config"),
    projectConfigPath: readOption(rest, "--project-config"),
    explicitConfigPath: readOption(rest, "--config"),
    reportId: readOption(rest, "--report-id"),
    language: readOption(rest, "--language"),
    uiLanguage: readOption(rest, "--ui-language") as "en" | "zh-TW" | undefined,
    scope: readOption(rest, "--scope"),
    repoCommit: readOption(rest, "--repo-commit")
  });
  console.log(runPath);
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
    const out = readOption(rest, "--out");
    const jsonOut = readOption(rest, "--json-out");
    const markdownOut = readOption(rest, "--markdown-out");
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

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function usage(): void {
  console.error(`Usage:
  ai-native-eval score <evaluation-tree.json>
  ai-native-eval render <evaluation-tree.json> --out <report.html> [--language zh-TW] [--ui-language zh-TW]
  ai-native-eval persist <evaluation-tree.json> [--root .ai-native-eval/artifacts] [--language zh-TW] [--ui-language zh-TW] [--changed-file <path>]...
  ai-native-eval init-run <repo-root> --out <run-folder> [--config <path>] [--project-config <path>] [--person-config <path>]
  ai-native-eval validate-folder <run-folder> [--skills-dir .agents/skills]
  ai-native-eval render-folder <run-folder> [--out <report.html>] [--json-out <report.json>] [--markdown-out <report.md>] [--skills-dir .agents/skills]`);
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

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
