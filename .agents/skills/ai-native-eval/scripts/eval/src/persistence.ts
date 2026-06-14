import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  ArtifactPaths,
  EvaluationNodeInput,
  EvaluationReport,
  IncrementalManifest
} from "./types.js";

export function createRunId(input: {
  generatedAt?: string;
  headCommit?: string;
}): string {
  const timestamp = sanitizeTimestamp(input.generatedAt ?? new Date().toISOString());
  const commit = (input.headCommit ?? "unknown").slice(0, 12);
  return `${timestamp}-${commit}`;
}

export function artifactPaths(runId: string, root = ".ai-native-eval/artifacts"): ArtifactPaths {
  return {
    runId,
    snapshotPath: join(root, "snapshots", `${runId}-snapshot.json`),
    manifestPath: join(root, "manifests", `${runId}-manifest.json`),
    reportJsonPath: join(root, "reports", `${runId}-level-report.json`),
    reportHtmlPath: join(root, "reports", `${runId}-level-report.html`)
  };
}

export function buildIncrementalManifest(input: {
  manifestId: string;
  generatedAt: string;
  baseCommit?: string;
  headCommit?: string;
  changedFiles: string[];
  affectedNodeIds?: string[];
  carriedForwardNodeIds?: string[];
}): IncrementalManifest {
  return {
    schemaVersion: 1,
    manifestId: input.manifestId,
    generatedAt: input.generatedAt,
    baseCommit: input.baseCommit,
    headCommit: input.headCommit,
    changedFiles: [...input.changedFiles].sort(),
    changedEvidenceSurfaces: [...new Set(input.changedFiles.map(classifyEvidenceSurface))].sort(),
    affectedNodeIds: [...(input.affectedNodeIds ?? [])].sort(),
    carriedForwardNodeIds: [...(input.carriedForwardNodeIds ?? [])].sort()
  };
}

export function mergeCarriedForwardTree(input: {
  previousRoot: EvaluationNodeInput;
  updatedNodes: EvaluationNodeInput[];
  previousSnapshotId: string;
}): { root: EvaluationNodeInput; carriedForwardNodeIds: string[] } {
  const updates = new Map(input.updatedNodes.map((node) => [node.id, node]));
  const carriedForwardNodeIds: string[] = [];

  function merge(node: EvaluationNodeInput): EvaluationNodeInput {
    const replacement = updates.get(node.id);
    if (replacement) {
      return replacement;
    }

    const children = (node.children ?? []).map(merge);
    const carried = {
      ...node,
      carriedForwardFrom: input.previousSnapshotId,
      children
    };
    carriedForwardNodeIds.push(node.id);
    return carried;
  }

  return {
    root: merge(input.previousRoot),
    carriedForwardNodeIds: carriedForwardNodeIds.sort()
  };
}

export async function writeJsonArtifact(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function snapshotFromReport(report: EvaluationReport): object {
  return {
    schemaVersion: 1,
    reportId: report.reportId,
    generatedAt: report.generatedAt,
    scope: report.scope,
    root: report.root,
    summary: report.summary,
    reproducibility: report.reproducibility
  };
}

function classifyEvidenceSurface(file: string): string {
  if (file === "README.md" || file.startsWith("docs/")) return "docs";
  if (file === "AGENTS.md" || file.startsWith(".agents/")) return "agent_instructions";
  if (file.startsWith(".github/workflows/")) return "ci";
  if (file.includes("test") || file.includes("e2e") || file.includes("spec")) return "tests";
  if (file.includes("package.json") || file.includes("pnpm-lock")) return "runtime";
  return "source";
}

function sanitizeTimestamp(value: string): string {
  return value.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
