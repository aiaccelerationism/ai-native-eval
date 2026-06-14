import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import type {
  EffectiveEvalConfigSnapshot,
  EvalConfig,
  EvalConfigSource,
  ResolvedDisabledPlugin,
  ResolvedRootPlugin
} from "./types.js";

export const builtInRootPluginIds = [
  "ai-native-foundation-evaluator",
  "bmad-method-evaluator"
] as const;

export interface InitRunInput {
  repoRoot: string;
  runFolder: string;
  personConfigPath?: string;
  projectConfigPath?: string;
  explicitConfigPath?: string;
  reportId?: string;
  generatedAt?: string;
  language?: string;
  uiLanguage?: "en" | "zh-TW";
  scope?: string;
  repoCommit?: string;
}

export async function resolveEffectiveConfig(input: {
  repoRoot: string;
  personConfigPath?: string;
  projectConfigPath?: string;
  explicitConfigPath?: string;
}): Promise<EffectiveEvalConfigSnapshot> {
  const sources: EvalConfigSource[] = [{ kind: "built-in", found: true }];
  const roots: ResolvedRootPlugin[] = builtInRootPluginIds.map((pluginId) => ({
    pluginId,
    origin: "built-in",
    source: "built-in"
  }));
  const disabled = new Map<string, ResolvedDisabledPlugin>();

  const configs = await Promise.all([
    readConfigSource("person", input.personConfigPath, sources),
    readConfigSource(
      "project",
      input.projectConfigPath ?? join(input.repoRoot, ".ai-native-eval/config.json"),
      sources
    ),
    readConfigSource("explicit", input.explicitConfigPath, sources)
  ]);

  for (const config of configs) {
    if (!config) continue;
    for (const additional of config.config.additionalRoots ?? []) {
      if (!roots.some((root) => root.pluginId === additional.pluginId)) {
        roots.push({
          pluginId: additional.pluginId,
          origin: "additional",
          reason: additional.reason,
          source: config.source.kind
        });
      }
    }
    for (const item of config.config.disabled ?? []) {
      disabled.set(item.pluginId, {
        pluginId: item.pluginId,
        reason: item.reason,
        source: config.source.kind
      });
    }
  }

  return {
    schemaVersion: 1,
    configSources: sources,
    builtInRootPluginIds: [...builtInRootPluginIds],
    roots,
    disabled: Array.from(disabled.values())
  };
}

export async function initRun(input: InitRunInput): Promise<string> {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const effectiveConfig = await resolveEffectiveConfig(input);
  const rootPluginIds = effectiveConfig.roots.map((root) => root.pluginId);
  const run = {
    schemaVersion: 1,
    runId: input.reportId ?? defaultRunId(generatedAt),
    reportId: input.reportId ?? defaultRunId(generatedAt),
    reviewType: "baseline",
    generatedAt,
    language: input.language,
    uiLanguage: input.uiLanguage,
    scope: input.scope ?? "baseline full review",
    configSources: effectiveConfig.configSources,
    effectiveConfig,
    rootPluginIds,
    reproducibility: {
      repoCommit: input.repoCommit,
      configHash: hashJson(effectiveConfig),
      scoringModelVersion: "folder-first-config-v1"
    }
  };
  await mkdir(input.runFolder, { recursive: true });
  await mkdir(join(input.runFolder, "evaluators"), { recursive: true });
  const runPath = join(input.runFolder, "run.json");
  await mkdir(dirname(runPath), { recursive: true });
  await writeFile(runPath, `${JSON.stringify(run, null, 2)}\n`);
  return runPath;
}

async function readConfigSource(
  kind: "person" | "project" | "explicit",
  path: string | undefined,
  sources: EvalConfigSource[]
): Promise<{ source: EvalConfigSource; config: EvalConfig } | undefined> {
  if (!path) {
    sources.push({ kind, found: false });
    return undefined;
  }
  try {
    const config = JSON.parse(await readFile(path, "utf8")) as EvalConfig;
    const source = { kind, path, found: true } satisfies EvalConfigSource;
    sources.push(source);
    return { source, config };
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (code === "ENOENT") {
      sources.push({ kind, path, found: false });
      return undefined;
    }
    throw error;
  }
}

function defaultRunId(generatedAt: string): string {
  return generatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
