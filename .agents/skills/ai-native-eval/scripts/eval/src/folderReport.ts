import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { buildReport } from "./aggregate.js";
import type {
  DeductionGroupInput,
  DeductionGroupRubricInput,
  DeductionInput,
  EffectiveEvalConfigSnapshot,
  EvaluationNodeInput,
  EvaluationReport,
  EvaluatorPluginManifest,
  LeafEvaluatorOutput,
  ReportUiLanguage
} from "./types.js";

export interface FolderRunConfig {
  reportId?: string;
  generatedAt?: string;
  language?: string;
  uiLanguage?: ReportUiLanguage;
  scope?: string;
  effectiveConfig?: EffectiveEvalConfigSnapshot;
  configSources?: EffectiveEvalConfigSnapshot["configSources"];
  rootPluginIds: string[];
  reproducibility?: EvaluationReport["reproducibility"];
}

export interface FolderValidationResult {
  errors: string[];
}

interface SkillDefinition {
  manifest: EvaluatorPluginManifest;
  rubric?: DeductionGroupRubricInput[];
}

interface FolderLoadResult {
  config?: FolderRunConfig;
  skills: Map<string, SkillDefinition>;
  outputs: Map<string, LeafEvaluatorOutput>;
  errors: string[];
}

interface RuntimeGraph {
  enabled: Set<string>;
  disabled: Set<string>;
  disabledRoots: Set<string>;
  disabledInfo: Map<string, { reason: string; source: string }>;
  rootOrigins: Map<string, "built-in" | "additional">;
}

const manifestFencePattern = /## Plugin Manifest[\s\S]*?```json\s*([\s\S]*?)```/;
const rubricFencePattern =
  /```ai-native-deduction-groups\s*([\s\S]*?)```/;

export async function validateFolderReport(input: {
  runFolder: string;
  skillsDir: string;
}): Promise<FolderValidationResult> {
  const loaded = await loadFolderInputs(input);
  if (loaded.config) {
    validateRuntimeGraph(loaded, loaded.errors);
  }
  return { errors: loaded.errors };
}

export async function buildReportFromFolder(input: {
  runFolder: string;
  skillsDir: string;
}): Promise<EvaluationReport> {
  const loaded = await loadFolderInputs(input);
  if (loaded.config) {
    validateRuntimeGraph(loaded, loaded.errors);
  }
  if (loaded.errors.length > 0 || !loaded.config) {
    throw new FolderValidationError(loaded.errors);
  }

  const graph = buildRuntimeGraph(loaded);
  const root: EvaluationNodeInput = {
    id: loaded.config.reportId ?? "ai-native-folder-report",
    label: loaded.config.scope ?? "AI-native maturity",
    kind: "eval",
    children: loaded.config.rootPluginIds.map((pluginId) =>
      buildNodeFromPlugin(pluginId, loaded, graph, [])
    )
  };

  return buildReport({
    reportId: loaded.config.reportId,
    generatedAt: loaded.config.generatedAt,
    language: loaded.config.language,
    uiLanguage: loaded.config.uiLanguage,
    scope: loaded.config.scope,
    root,
    pluginResolution: {
      rootPluginIds: loaded.config.rootPluginIds,
      resolvedPluginIds: Array.from(graph.enabled),
      missingPluginIds: [],
      disabledPluginIds: Array.from(graph.disabled)
    },
    runConfig: loaded.config.effectiveConfig,
    reproducibility: loaded.config.reproducibility
  });
}

export class FolderValidationError extends Error {
  constructor(readonly errors: string[]) {
    super(`Folder validation failed with ${errors.length} error(s)`);
  }
}

async function loadFolderInputs(input: {
  runFolder: string;
  skillsDir: string;
}): Promise<FolderLoadResult> {
  const errors: string[] = [];
  const [config, skills, outputs] = await Promise.all([
    readRunConfig(input.runFolder, errors),
    readSkillDefinitions(input.skillsDir, errors),
    readEvaluatorOutputs(input.runFolder, errors)
  ]);
  return { config, skills, outputs, errors };
}

async function readRunConfig(
  runFolder: string,
  errors: string[]
): Promise<FolderRunConfig | undefined> {
  try {
    const raw = JSON.parse(await readFile(join(runFolder, "run.json"), "utf8")) as Partial<FolderRunConfig>;
    if (!Array.isArray(raw.rootPluginIds) || raw.rootPluginIds.length === 0) {
      errors.push("run.json: rootPluginIds must be a non-empty array");
      return undefined;
    }
    return raw as FolderRunConfig;
  } catch (error) {
    errors.push(`run.json: ${formatReadOrParseError(error)}`);
    return undefined;
  }
}

async function readSkillDefinitions(
  skillsDir: string,
  errors: string[]
): Promise<Map<string, SkillDefinition>> {
  const skills = new Map<string, SkillDefinition>();
  let entries: string[];
  try {
    entries = await readdir(skillsDir);
  } catch (error) {
    errors.push(`skillsDir ${skillsDir}: ${formatReadOrParseError(error)}`);
    return skills;
  }

  await Promise.all(
    entries
      .filter((entry) => entry.endsWith("-evaluator"))
      .map(async (entry) => {
        const skillPath = join(skillsDir, entry, "SKILL.md");
        try {
          const body = await readFile(skillPath, "utf8");
          const manifest = parseManifest(body, skillPath, errors);
          if (!manifest) return;
          const rubric = parseRubric(body, skillPath, errors);
          skills.set(manifest.pluginId, { manifest, rubric });
        } catch (error) {
          errors.push(`${skillPath}: ${formatReadOrParseError(error)}`);
        }
      })
  );

  return skills;
}

async function readEvaluatorOutputs(
  runFolder: string,
  errors: string[]
): Promise<Map<string, LeafEvaluatorOutput>> {
  const outputs = new Map<string, LeafEvaluatorOutput>();
  const evaluatorsDir = join(runFolder, "evaluators");
  let entries: string[];
  try {
    entries = await readdir(evaluatorsDir);
  } catch (error) {
    errors.push(`evaluators/: ${formatReadOrParseError(error)}`);
    return outputs;
  }

  await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".json"))
      .map(async (entry) => {
        const outputPath = join(evaluatorsDir, entry);
        try {
          const output = JSON.parse(
            await readFile(outputPath, "utf8")
          ) as LeafEvaluatorOutput;
          if (!output.pluginId) {
            errors.push(`${outputPath}: pluginId is required`);
            return;
          }
          const filePluginId = basename(entry, ".json");
          if (filePluginId !== output.pluginId) {
            errors.push(
              `${outputPath}: filename pluginId ${filePluginId} does not match output pluginId ${output.pluginId}`
            );
          }
          if (outputs.has(output.pluginId)) {
            errors.push(`${outputPath}: duplicate output for pluginId ${output.pluginId}`);
            return;
          }
          outputs.set(output.pluginId, output);
        } catch (error) {
          errors.push(`${outputPath}: ${formatReadOrParseError(error)}`);
        }
      })
  );

  return outputs;
}

function validateRuntimeGraph(loaded: FolderLoadResult, errors: string[]): void {
  const graph = buildRuntimeGraph(loaded);

  for (const pluginId of loaded.config?.rootPluginIds ?? []) {
    if (!loaded.skills.has(pluginId)) {
      errors.push(`run.json: unknown root pluginId ${pluginId}`);
    }
  }

  for (const disabled of loaded.config?.effectiveConfig?.disabled ?? []) {
    if (!loaded.skills.has(disabled.pluginId)) {
      errors.push(`run.json: disabled pluginId ${disabled.pluginId} is not installed`);
    }
  }

  for (const pluginId of graph.enabled) {
    const skill = loaded.skills.get(pluginId);
    if (!skill) {
      errors.push(`plugin ${pluginId}: referenced by runtime graph but skill is not installed`);
      continue;
    }
    const children = skill.manifest.directChildren ?? [];
    if (children.length === 0) {
      validateLeafPlugin(pluginId, skill, loaded.outputs.get(pluginId), errors);
    }
  }

  for (const pluginId of loaded.outputs.keys()) {
    if (graph.disabled.has(pluginId)) {
      const disabledBy = nearestDisabledRoot(pluginId, graph, loaded.skills) ?? pluginId;
      errors.push(
        `evaluators/${pluginId}.json: output exists under disabled subtree ${disabledBy}`
      );
    } else if (!graph.enabled.has(pluginId)) {
      errors.push(`evaluators/${pluginId}.json: output plugin is not reachable from effective config`);
    }
  }
}

function validateLeafPlugin(
  pluginId: string,
  skill: SkillDefinition,
  output: LeafEvaluatorOutput | undefined,
  errors: string[]
): void {
  if (!skill.rubric) {
    errors.push(`${pluginId}: leaf evaluator SKILL.md is missing ai-native-deduction-groups fence`);
    return;
  }
  validateRubric(pluginId, skill.rubric, errors);
  if (!output) {
    errors.push(`evaluators/${pluginId}.json: missing output for required leaf evaluator`);
    return;
  }
  if (!Array.isArray(output.deductions)) {
    errors.push(`evaluators/${pluginId}.json: deductions must be an array`);
    return;
  }

  const groups = new Map(skill.rubric.map((group) => [group.id, group]));
  const seen = new Set<string>();
  for (const deduction of output.deductions) {
    const group = groups.get(deduction.groupId);
    if (!group) {
      errors.push(`${pluginId}: unknown deduction groupId ${deduction.groupId}`);
      continue;
    }
    const rubricDeduction = group.deductions.find(
      (candidate) => candidate.id === deduction.deductionId
    );
    if (!rubricDeduction) {
      errors.push(
        `${pluginId}: unknown deductionId ${deduction.deductionId} in group ${deduction.groupId}`
      );
      continue;
    }
    const key = `${deduction.groupId}/${deduction.deductionId}`;
    if (seen.has(key)) {
      errors.push(`${pluginId}: duplicate deduction judgment ${key}`);
    }
    seen.add(key);
    if (deduction.applies && !deduction.reason?.trim()) {
      errors.push(`${pluginId}: applied deduction ${key} requires reason`);
    }
  }
}

function validateRubric(
  pluginId: string,
  rubric: DeductionGroupRubricInput[],
  errors: string[]
): void {
  if (rubric.length === 0) {
    errors.push(`${pluginId}: deduction rubric must include at least one group`);
  }
  for (const group of rubric) {
    if (!Number.isFinite(group.budget) || group.budget <= 0) {
      errors.push(`${pluginId}: group ${group.id} budget must be > 0`);
    }
    const total = group.deductions.reduce((sum, deduction) => sum + deduction.points, 0);
    if (total < group.budget) {
      errors.push(
        `${pluginId}: group ${group.id} deductions total ${round3(total)} is less than budget ${group.budget}`
      );
    }
  }
}

function buildNodeFromPlugin(
  pluginId: string,
  loaded: FolderLoadResult,
  graph: RuntimeGraph,
  ancestry: string[]
): EvaluationNodeInput {
  if (ancestry.includes(pluginId)) {
    throw new Error(`Plugin cycle detected: ${[...ancestry, pluginId].join(" -> ")}`);
  }
  const skill = loaded.skills.get(pluginId);
  if (!skill) {
    throw new Error(`Missing skill for ${pluginId}`);
  }

  if (graph.disabled.has(pluginId)) {
    const info = graph.disabledInfo.get(pluginId) ?? {
      reason: "Disabled by effective config",
      source: "config"
    };
    return {
      id: pluginId,
      label: skill.manifest.label,
      kind: "evaluator",
      dimension: skill.manifest.dimension,
      pluginId,
      origin: graph.rootOrigins.get(pluginId),
      status: "not_applicable",
      confidence: "high",
      pointsAvailable: 0,
      reason: `Disabled: ${info.reason}`,
      disabledReason: info.reason,
      disabledSource: info.source,
      children: []
    };
  }

  const children = skill.manifest.directChildren ?? [];
  if (children.length > 0) {
    return {
      id: pluginId,
      label: skill.manifest.label,
      kind: "evaluator",
      dimension: skill.manifest.dimension,
      pluginId,
      origin: graph.rootOrigins.get(pluginId),
      children: children.map((child) => ({
        ...buildNodeFromPlugin(child.pluginId, loaded, graph, [...ancestry, pluginId]),
        weight: child.weight
      }))
    };
  }

  const output = loaded.outputs.get(pluginId);
  if (!output || !skill.rubric) {
    throw new Error(`Missing validated leaf output or rubric for ${pluginId}`);
  }

  return {
    id: output.nodeId ?? pluginId,
    label: output.label ?? skill.manifest.label,
    kind: output.kind ?? "evaluator",
    dimension: output.dimension ?? skill.manifest.dimension,
    pluginId,
    origin: graph.rootOrigins.get(pluginId),
    status: output.status,
    confidence: output.confidence,
    reason: output.reason,
    evidence: output.evidence,
    recommendations: output.recommendations,
    references: output.references,
    pointsAvailable: 1,
    deductionGroups: mergeRubricWithOutput(skill.rubric, output)
  };
}

function mergeRubricWithOutput(
  rubric: DeductionGroupRubricInput[],
  output: LeafEvaluatorOutput
): DeductionGroupInput[] {
  const judgments = new Map(
    output.deductions.map((deduction) => [
      `${deduction.groupId}/${deduction.deductionId}`,
      deduction
    ])
  );
  return rubric.map((group) => ({
    id: group.id,
    label: group.label,
    budget: group.budget,
    deductions: group.deductions.map((deduction): DeductionInput => {
      const judgment = judgments.get(`${group.id}/${deduction.id}`);
      return {
        id: deduction.id,
        label: deduction.label,
        points: deduction.points,
        applies: judgment?.applies ?? false,
        reason: judgment?.reason,
        evidence: judgment?.evidence,
        recommendation:
          judgment?.recommendation ??
          (judgment?.applies && deduction.recommendation
            ? { summary: deduction.recommendation }
            : undefined)
      };
    })
  }));
}

function collectResolvedPluginIds(
  rootPluginIds: string[],
  skills: Map<string, SkillDefinition>
): Set<string> {
  const resolved = new Set<string>();
  const visit = (pluginId: string): void => {
    if (resolved.has(pluginId)) return;
    resolved.add(pluginId);
    const children = skills.get(pluginId)?.manifest.directChildren ?? [];
    for (const child of children) visit(child.pluginId);
  };
  for (const pluginId of rootPluginIds) visit(pluginId);
  return resolved;
}

function buildRuntimeGraph(loaded: FolderLoadResult): RuntimeGraph {
  const disabledInfo = new Map<string, { reason: string; source: string }>();
  const disabledRoots = new Set<string>();
  const rootOrigins = new Map<string, "built-in" | "additional">();
  for (const root of loaded.config?.effectiveConfig?.roots ?? []) {
    rootOrigins.set(root.pluginId, root.origin);
  }
  for (const item of loaded.config?.effectiveConfig?.disabled ?? []) {
    disabledRoots.add(item.pluginId);
    disabledInfo.set(item.pluginId, {
      reason: item.reason,
      source: item.source
    });
  }

  const enabled = new Set<string>();
  const disabled = new Set<string>();
  const visit = (
    pluginId: string,
    inheritedDisabled:
      | { rootPluginId: string; reason: string; source: string }
      | undefined
  ): void => {
    const ownDisabled = disabledInfo.get(pluginId);
    const disabledContext = inheritedDisabled ?? (ownDisabled
      ? { rootPluginId: pluginId, reason: ownDisabled.reason, source: ownDisabled.source }
      : undefined);
    if (disabledContext) {
      disabled.add(pluginId);
      disabledInfo.set(pluginId, {
        reason: disabledContext.reason,
        source: disabledContext.source
      });
    } else {
      enabled.add(pluginId);
    }
    const children = loaded.skills.get(pluginId)?.manifest.directChildren ?? [];
    for (const child of children) {
      visit(child.pluginId, disabledContext);
    }
  };

  for (const pluginId of loaded.config?.rootPluginIds ?? []) {
    visit(pluginId, undefined);
  }

  return { enabled, disabled, disabledRoots, disabledInfo, rootOrigins };
}

function nearestDisabledRoot(
  pluginId: string,
  graph: RuntimeGraph,
  skills: Map<string, SkillDefinition>
): string | undefined {
  for (const root of graph.disabledRoots) {
    const descendants = collectResolvedPluginIds([root], skills);
    if (descendants.has(pluginId)) return root;
  }
  return undefined;
}

function parseManifest(
  body: string,
  skillPath: string,
  errors: string[]
): EvaluatorPluginManifest | undefined {
  const match = body.match(manifestFencePattern);
  if (!match) {
    errors.push(`${skillPath}: missing Plugin Manifest JSON fence`);
    return undefined;
  }
  try {
    return JSON.parse(match[1]) as EvaluatorPluginManifest;
  } catch (error) {
    errors.push(`${skillPath}: invalid Plugin Manifest JSON: ${formatReadOrParseError(error)}`);
    return undefined;
  }
}

function parseRubric(
  body: string,
  skillPath: string,
  errors: string[]
): DeductionGroupRubricInput[] | undefined {
  const match = body.match(rubricFencePattern);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as DeductionGroupRubricInput[];
  } catch (error) {
    errors.push(`${skillPath}: invalid ai-native-deduction-groups JSON: ${formatReadOrParseError(error)}`);
    return undefined;
  }
}

function formatReadOrParseError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
