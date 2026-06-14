import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import type {
  ConfigWarning,
  EffectiveEvalConfigSnapshot,
  EvaluationContext,
  EvaluatorChildRef,
  EvalConfig,
  EvalContextRoute,
  EvalConfigSource,
  ResolvedDisabledPlugin,
  ResolvedEvaluatorConfig,
  ResolvedContextRoute,
  ResolvedRootPlugin
} from "./types.js";

export const builtInRootPluginIds = ["ai-native-repo-maturity-evaluator"] as const;

export const builtInContextRootPluginIds = {
  repo: "ai-native-repo-maturity-evaluator",
  pull_request: "ai-native-pr-lifecycle-evaluator",
  pr: "ai-native-pr-lifecycle-evaluator",
  issue: "ai-native-issue-lifecycle-evaluator",
  thread: "ai-native-thread-checkpoint-evaluator",
  agent_thread: "ai-native-thread-checkpoint-evaluator",
  turn: "ai-native-turn-guardrail-evaluator",
  user_turn: "ai-native-turn-guardrail-evaluator",
  periodic: "ai-native-periodic-health-evaluator",
  schedule: "ai-native-periodic-health-evaluator",
  scheduled: "ai-native-periodic-health-evaluator"
} as const;

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
  evaluationContext?: EvaluationContext;
  repoCommit?: string;
}

export async function resolveEffectiveConfig(input: {
  repoRoot: string;
  personConfigPath?: string;
  projectConfigPath?: string;
  explicitConfigPath?: string;
  evaluationContext?: EvaluationContext;
}): Promise<EffectiveEvalConfigSnapshot> {
  const sources: EvalConfigSource[] = [{ kind: "built-in", found: true }];
  const selectedRootPluginId = rootPluginIdForContext(input.evaluationContext);
  const roots: ResolvedRootPlugin[] = [{
    pluginId: selectedRootPluginId,
    origin: "built-in",
    source: "built-in"
  }];
  const disabled = new Map<string, ResolvedDisabledPlugin>();
  const appliedContextRoutes: ResolvedContextRoute[] = [];
  const evaluatorConfigs = new Map<string, ResolvedEvaluatorConfig>();
  const warnings: ConfigWarning[] = [];

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
    applyEvaluatorConfigs(evaluatorConfigs, config.config.evaluators, config.source.kind);
    collectDeprecatedWarnings(config.config, config.source.kind, warnings);
    applyConfigRoots(roots, config.config.additionalRoots, config.source.kind);
    applyConfigDisabled(disabled, config.config.disabled, config.source.kind);

    for (const route of config.config.contextRoutes ?? []) {
      if (!input.evaluationContext || !matchesContextRoute(route, input.evaluationContext)) {
        continue;
      }
      applyConfigRoots(roots, route.additionalRoots, config.source.kind);
      applyConfigDisabled(disabled, route.disabled, config.source.kind);
      appliedContextRoutes.push({
        id: route.id,
        source: config.source.kind,
        description: route.description,
        scope: route.scope,
        outputIntents: route.outputIntents,
        affectsOverallScore: route.affectsOverallScore
      });
    }
  }

  return {
    schemaVersion: 1,
    configSources: sources,
    builtInRootPluginIds: [selectedRootPluginId],
    evaluationContext: input.evaluationContext,
    appliedContextRoutes,
    evaluatorConfigs: Array.from(evaluatorConfigs.values()),
    warnings,
    roots,
    disabled: Array.from(disabled.values())
  };
}

export async function initRun(input: InitRunInput): Promise<string> {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const effectiveConfig = await resolveEffectiveConfig(input);
  const rootPluginIds = effectiveConfig.roots.map((root) => root.pluginId);
  const appliedScope =
    input.scope ??
    effectiveConfig.appliedContextRoutes?.find((route) => route.scope)?.scope;
  const appliedOutputIntents = [
    ...new Set(effectiveConfig.appliedContextRoutes?.flatMap((route) => route.outputIntents ?? []) ?? [])
  ];
  const affectsOverallScore =
    input.evaluationContext?.affectsOverallScore ??
    [...(effectiveConfig.appliedContextRoutes ?? [])]
      .reverse()
      .find((route) => route.affectsOverallScore !== undefined)?.affectsOverallScore;
  const evaluationContext = input.evaluationContext
    ? {
        ...input.evaluationContext,
        ...(appliedOutputIntents.length > 0 ? { outputIntents: appliedOutputIntents } : {}),
        ...(affectsOverallScore !== undefined ? { affectsOverallScore } : {})
      }
    : undefined;
  const runEffectiveConfig = {
    ...effectiveConfig,
    evaluationContext
  };
  const run = {
    schemaVersion: 1,
    runId: input.reportId ?? defaultRunId(generatedAt),
    reportId: input.reportId ?? defaultRunId(generatedAt),
    reviewType: evaluationContext?.reviewType ?? "baseline",
    generatedAt,
    language: input.language,
    uiLanguage: input.uiLanguage,
    scope: appliedScope ?? "baseline full review",
    evaluationContext,
    configSources: effectiveConfig.configSources,
    effectiveConfig: runEffectiveConfig,
    rootPluginIds,
    reproducibility: {
      repoCommit: input.repoCommit,
      configHash: hashJson(runEffectiveConfig),
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

function rootPluginIdForContext(context: EvaluationContext | undefined): string {
  const target = context?.target;
  if (!target) return "ai-native-repo-maturity-evaluator";
  return (
    builtInContextRootPluginIds[target as keyof typeof builtInContextRootPluginIds] ??
    target
  );
}

function applyConfigRoots(
  roots: ResolvedRootPlugin[],
  additions: EvalConfig["additionalRoots"],
  source: string
): void {
  for (const additional of additions ?? []) {
    if (!roots.some((root) => root.pluginId === additional.pluginId)) {
      roots.push({
        pluginId: additional.pluginId,
        origin: "additional",
        reason: additional.reason,
        source
      });
    }
  }
}

function applyConfigDisabled(
  disabled: Map<string, ResolvedDisabledPlugin>,
  items: EvalConfig["disabled"],
  source: string
): void {
  for (const item of items ?? []) {
    disabled.set(item.pluginId, {
      pluginId: item.pluginId,
      reason: item.reason,
      source
    });
  }
}

function applyEvaluatorConfigs(
  configs: Map<string, ResolvedEvaluatorConfig>,
  additions: EvalConfig["evaluators"],
  source: string
): void {
  for (const [pluginId, config] of Object.entries(additions ?? {})) {
    const existing = configs.get(pluginId);
    configs.set(pluginId, {
      pluginId,
      source,
      enabled: config.enabled ?? existing?.enabled,
      additionalChildren: [
        ...(existing?.additionalChildren ?? []),
        ...(config.additionalChildren ?? []).map((child) => ({
          ...child,
          source
        }))
      ],
      disabledChildren: [
        ...(existing?.disabledChildren ?? []),
        ...(config.disabledChildren ?? []).map((child) => ({
          ...child,
          source
        }))
      ],
      settings: {
        ...(existing?.settings ?? {}),
        ...(config.settings ?? {})
      }
    });
  }
}

function collectDeprecatedWarnings(
  config: EvalConfig,
  source: string,
  warnings: ConfigWarning[]
): void {
  const deprecatedFields: Array<keyof Pick<EvalConfig, "additionalRoots" | "disabled" | "contextRoutes">> = [
    "additionalRoots",
    "disabled",
    "contextRoutes"
  ];
  for (const field of deprecatedFields) {
    const value = config[field];
    if (Array.isArray(value) && value.length > 0) {
      warnings.push({
        code: `deprecated-${field}`,
        source,
        message: `${field} is deprecated; configure evaluator-specific behavior under evaluators[pluginId].`
      });
    }
  }
}

function matchesContextRoute(route: EvalContextRoute, context: EvaluationContext): boolean {
  const match = route.match;
  if (match.reviewType && match.reviewType !== context.reviewType) return false;
  if (match.target && match.target !== context.target) return false;
  if (match.phase && match.phase !== context.phase) return false;
  if (match.trigger && match.trigger !== context.trigger) return false;
  if (
    match.targetSurface &&
    !(context.targetSurfaces ?? []).includes(match.targetSurface)
  ) {
    return false;
  }
  return true;
}
