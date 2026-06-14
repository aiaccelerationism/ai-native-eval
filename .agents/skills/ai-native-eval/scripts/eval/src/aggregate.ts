import type {
  Confidence,
  DeductionGroupInput,
  DeductionGroupResult,
  DeductionInput,
  DeductionResult,
  DimensionScore,
  EvaluationNodeInput,
  EvaluationNodeResult,
  EvaluationReport,
  EvaluationStatus,
  EvalSummary,
  PolicyRuleConfig,
  PolicyRuleDefinition,
  PolicyRuleOptions,
  PolicyRuleResult,
  PolicySeverity,
  PolicySummary
} from "./types.js";

const confidenceOrder: Record<Confidence, number> = {
  low: 0,
  medium: 1,
  high: 2
};

export function buildReport(input: {
  reportId?: string;
  generatedAt?: string;
  language?: string;
  uiLanguage?: EvaluationReport["uiLanguage"];
  scope?: string;
  evaluationContext?: EvaluationReport["evaluationContext"];
  root: EvaluationNodeInput;
  pluginResolution?: EvaluationReport["pluginResolution"];
  runConfig?: EvaluationReport["runConfig"];
  executionBatches?: EvaluationReport["executionBatches"];
  evaluatorRuns?: EvaluationReport["evaluatorRuns"];
  policyRules?: PolicyRuleDefinition[];
  reproducibility?: EvaluationReport["reproducibility"];
}): EvaluationReport {
  const aggregatedRoot = aggregateNode(input.root);
  const policy = input.policyRules?.length
    ? evaluatePolicyRules(aggregatedRoot, input.policyRules, input.runConfig)
    : undefined;
  const root = annotatePolicyResults(aggregatedRoot, policy?.results ?? []);
  const summary = summarize(root);
  return {
    reportId: input.reportId ?? stableReportId(root),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    language: input.language,
    uiLanguage: input.uiLanguage,
    scope: input.scope ?? "repository",
    evaluationContext: input.evaluationContext,
    root,
    summary: {
      ...summary,
      ...(policy ? { policy } : {})
    },
    pluginResolution: input.pluginResolution,
    runConfig: input.runConfig,
    executionBatches: input.executionBatches,
    evaluatorRuns: input.evaluatorRuns,
    ...(policy ? { policy } : {}),
    reproducibility: input.reproducibility
  };
}

export function aggregateNode(node: EvaluationNodeInput): EvaluationNodeResult {
  const children = (node.children ?? []).map(aggregateNode);
  const weight = normalizedWeight(node.weight);

  if (children.length > 0) {
    return aggregateParent(node, children, weight);
  }

  return aggregateLeaf(node, weight);
}

function aggregateLeaf(
  node: EvaluationNodeInput,
  weight: number
): EvaluationNodeResult {
  const status = node.status ?? "missing";
  const pointsAvailable =
    status === "not_applicable" ? 0 : Math.max(0, node.pointsAvailable ?? 1);
  const deductionGroups = node.deductionGroups
    ? aggregateDeductionGroups(node.id, node.deductionGroups, pointsAvailable)
    : undefined;
  const deductionPointsLost = deductionGroups
    ? round3(deductionGroups.reduce((total, group) => total + group.pointsLost, 0))
    : undefined;
  const pointsEarned = deductionGroups
    ? round3(pointsAvailable - clamp(deductionPointsLost ?? 0, 0, pointsAvailable))
    : clamp(
        node.pointsEarned ?? defaultEarnedPoints(status, pointsAvailable),
        0,
        pointsAvailable
      );
  const score0To10 =
    pointsAvailable > 0 ? round2((pointsEarned / pointsAvailable) * 10) : null;

  return {
    ...node,
    weight,
    status: node.status ?? statusFromScore(score0To10, []),
    confidence: node.confidence ?? defaultConfidence(node, status),
    pointsAvailable: round3(pointsAvailable),
    pointsEarned: round3(pointsEarned),
    lostPoints: round3(pointsAvailable - pointsEarned),
    score0To10,
    deductionGroups,
    children: []
  };
}

function aggregateDeductionGroups(
  nodeId: string,
  groups: DeductionGroupInput[],
  pointsAvailable: number
): DeductionGroupResult[] {
  if (pointsAvailable <= 0) {
    throw new Error(
      `Node ${nodeId} cannot define deductionGroups when pointsAvailable is 0`
    );
  }

  const totalBudget = round3(groups.reduce((total, group) => total + group.budget, 0));
  if (totalBudget > pointsAvailable) {
    throw new Error(
      `Node ${nodeId} deduction group budgets (${totalBudget}) exceed pointsAvailable (${pointsAvailable})`
    );
  }

  return groups.map((group) => aggregateDeductionGroup(nodeId, group));
}

function aggregateDeductionGroup(
  nodeId: string,
  group: DeductionGroupInput
): DeductionGroupResult {
  if (!Number.isFinite(group.budget) || group.budget <= 0) {
    throw new Error(`Node ${nodeId} deduction group ${group.id} budget must be > 0`);
  }
  if (group.deductions.length === 0) {
    throw new Error(`Node ${nodeId} deduction group ${group.id} must include deductions`);
  }

  const totalPossible = round3(
    group.deductions.reduce((total, deduction) => {
      validateDeduction(nodeId, group.id, deduction);
      return total + deduction.points;
    }, 0)
  );
  if (totalPossible < group.budget) {
    throw new Error(
      `Node ${nodeId} deduction group ${group.id} deductions total (${totalPossible}) is less than budget (${group.budget})`
    );
  }

  const deductions = group.deductions.map((deduction): DeductionResult => ({
    ...deduction,
    pointsLost: deduction.applies ? round3(deduction.points) : 0
  }));
  const appliedDeductions = deductions.filter((deduction) => deduction.applies);
  const rawPointsLost = round3(
    appliedDeductions.reduce((total, deduction) => total + deduction.pointsLost, 0)
  );
  const pointsLost = round3(Math.min(rawPointsLost, group.budget));

  return {
    ...group,
    pointsLost,
    capped: rawPointsLost > group.budget,
    deductions,
    appliedDeductions
  };
}

function validateDeduction(
  nodeId: string,
  groupId: string,
  deduction: DeductionInput
): void {
  if (!Number.isFinite(deduction.points) || deduction.points < 0) {
    throw new Error(
      `Node ${nodeId} deduction group ${groupId} deduction ${deduction.id} points must be >= 0`
    );
  }
  if (deduction.applies && !deduction.reason?.trim()) {
    throw new Error(
      `Node ${nodeId} deduction group ${groupId} deduction ${deduction.id} requires a reason when applies is true`
    );
  }
}

function aggregateParent(
  node: EvaluationNodeInput,
  children: EvaluationNodeResult[],
  weight: number
): EvaluationNodeResult {
  const { deductionGroups: _deductionGroups, ...nodeWithoutDeductionGroups } = node;
  const applicable = children.filter(
    (child) => child.status !== "not_applicable" && child.score0To10 !== null
  );

  const childWeightTotal = applicable.reduce(
    (total, child) => total + child.weight,
    0
  );
  const score0To10 =
    childWeightTotal > 0
      ? round2(
          applicable.reduce(
            (total, child) => total + (child.score0To10 ?? 0) * child.weight,
            0
          ) / childWeightTotal
        )
      : null;
  const pointsAvailable = round3(
    applicable.reduce(
      (total, child) => total + child.pointsAvailable * child.weight,
      0
    )
  );
  const pointsEarned = round3(
    applicable.reduce(
      (total, child) => total + child.pointsEarned * child.weight,
      0
    )
  );

  return {
    ...nodeWithoutDeductionGroups,
    weight,
    status: node.status ?? statusFromScore(score0To10, children),
    confidence: node.confidence ?? aggregateConfidence(children),
    pointsAvailable,
    pointsEarned,
    lostPoints: round3(pointsAvailable - pointsEarned),
    score0To10,
    children
  };
}

export function summarize(root: EvaluationNodeResult): EvalSummary {
  const score0To10 = root.score0To10;
  const score0To100 = score0To10 === null ? null : Math.round(score0To10 * 10);
  const level0To10 =
    score0To100 === null ? null : Math.min(10, Math.floor(score0To100 / 10));

  return {
    score0To10,
    score0To100,
    level0To10,
    confidence: root.confidence,
    dimensions: collectDimensions(root),
    lostPoints: collectLostPoints(root).slice(0, 20)
  };
}

function evaluatePolicyRules(
  root: EvaluationNodeResult,
  definitions: PolicyRuleDefinition[],
  runConfig: EvaluationReport["runConfig"]
): PolicySummary {
  const results: PolicyRuleResult[] = [];
  for (const definition of definitions) {
    const resolved = resolvePolicyRule(definition, runConfig);
    if (resolved.severity === "off") continue;
    const target = findPolicyTarget(root, definition);
    const actualScore0To10 = target?.score0To10;
    const status = isPolicyTriggered(definition, resolved.options, target)
      ? "triggered"
      : "passed";
    results.push({
      ruleId: definition.id,
      label: definition.label,
      ownerPluginId: definition.ownerPluginId,
      targetPluginId: definition.targetPluginId,
      targetNodeId: definition.targetNodeId,
      targetLabel: target?.label,
      severity: resolved.severity,
      status,
      condition: definition.condition,
      threshold: resolved.options.threshold,
      actualScore0To10,
      message: definition.message
    });
  }
  const triggered = results.filter((result) => result.status === "triggered");
  const errorCount = triggered.filter((result) => result.severity === "error").length;
  const warnCount = triggered.filter((result) => result.severity === "warn").length;
  return {
    status: errorCount > 0 ? "blocked" : warnCount > 0 ? "warn" : "pass",
    errorCount,
    warnCount,
    triggeredCount: triggered.length,
    results
  };
}

function resolvePolicyRule(
  definition: PolicyRuleDefinition,
  runConfig: EvaluationReport["runConfig"]
): { severity: PolicySeverity; options: PolicyRuleOptions } {
  const ownerConfig = runConfig?.evaluatorConfigs?.find(
    (config) => config.pluginId === definition.ownerPluginId
  );
  const rules = ownerConfig?.settings?.rules;
  const override =
    rules && typeof rules === "object" && !Array.isArray(rules)
      ? (rules as Record<string, PolicyRuleConfig>)[definition.id]
      : undefined;
  const overrideSeverity =
    typeof override === "string"
      ? parsePolicySeverity(override)
      : Array.isArray(override)
        ? parsePolicySeverity(override[0])
        : undefined;
  if (typeof override === "string" && overrideSeverity) {
    return {
      severity: overrideSeverity,
      options: definition.defaultOptions ?? {}
    };
  }
  if (Array.isArray(override) && overrideSeverity) {
    const [, options] = override;
    return {
      severity: overrideSeverity,
      options: {
        ...(definition.defaultOptions ?? {}),
        ...validPolicyOptions(options)
      }
    };
  }
  return {
    severity: definition.defaultSeverity,
    options: definition.defaultOptions ?? {}
  };
}

function parsePolicySeverity(value: unknown): PolicySeverity | undefined {
  return value === "off" || value === "warn" || value === "error"
    ? value
    : undefined;
}

function validPolicyOptions(value: unknown): PolicyRuleOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as PolicyRuleOptions;
  return {
    ...(Number.isFinite(options.threshold) ? { threshold: options.threshold } : {})
  };
}

function isPolicyTriggered(
  definition: PolicyRuleDefinition,
  options: PolicyRuleOptions,
  target: EvaluationNodeResult | undefined
): boolean {
  if (!target || target.status === "not_applicable") return false;
  if (definition.condition === "scoreBelow") {
    const threshold = options.threshold;
    if (!Number.isFinite(threshold)) return false;
    return target.score0To10 === null || target.score0To10 < (threshold as number);
  }
  return false;
}

function findPolicyTarget(
  root: EvaluationNodeResult,
  definition: PolicyRuleDefinition
): EvaluationNodeResult | undefined {
  if (definition.targetNodeId) {
    return [...walk(root)].find((node) => node.id === definition.targetNodeId);
  }
  if (definition.targetPluginId) {
    return [...walk(root)].find((node) => node.pluginId === definition.targetPluginId);
  }
  return undefined;
}

function annotatePolicyResults(
  root: EvaluationNodeResult,
  results: PolicyRuleResult[]
): EvaluationNodeResult {
  const triggered = results.filter((result) => result.status === "triggered");
  const visit = (node: EvaluationNodeResult): EvaluationNodeResult => {
    const nodeResults = triggered.filter(
      (result) =>
        (result.targetNodeId && result.targetNodeId === node.id) ||
        (result.targetPluginId && result.targetPluginId === node.pluginId)
    );
    return {
      ...node,
      ...(nodeResults.length > 0 ? { policyResults: nodeResults } : {}),
      children: node.children.map(visit)
    };
  };
  return visit(root);
}

function collectDimensions(root: EvaluationNodeResult): DimensionScore[] {
  const buckets = new Map<string, DimensionScore>();

  for (const node of walk(root)) {
    if (!node.dimension || node.children.length > 0 || node.status === "not_applicable") {
      continue;
    }
    const bucket =
      buckets.get(node.dimension) ??
      {
        dimension: node.dimension,
        score0To10: 0,
        weight: 0,
        pointsAvailable: 0,
        pointsEarned: 0,
        nodeIds: []
      };
    bucket.weight += node.weight;
    bucket.pointsAvailable += node.pointsAvailable;
    bucket.pointsEarned += node.pointsEarned;
    bucket.nodeIds.push(node.id);
    buckets.set(node.dimension, bucket);
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      pointsAvailable: round3(bucket.pointsAvailable),
      pointsEarned: round3(bucket.pointsEarned),
      score0To10:
        bucket.pointsAvailable > 0
          ? round2((bucket.pointsEarned / bucket.pointsAvailable) * 10)
          : 0
    }))
    .sort((a, b) => a.dimension.localeCompare(b.dimension));
}

function collectLostPoints(root: EvaluationNodeResult) {
  return [...walk(root)]
    .filter((node) => node.children.length === 0 && node.lostPoints > 0)
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      lostPoints: node.lostPoints,
      dimension: node.dimension
    }))
    .sort((a, b) => b.lostPoints - a.lostPoints || a.nodeId.localeCompare(b.nodeId));
}

export function* walk(
  node: EvaluationNodeResult
): Generator<EvaluationNodeResult> {
  yield node;
  for (const child of node.children) {
    yield* walk(child);
  }
}

function defaultEarnedPoints(
  status: EvaluationStatus,
  pointsAvailable: number
): number {
  if (status === "pass") return pointsAvailable;
  if (status === "partial") return pointsAvailable * 0.5;
  return 0;
}

function statusFromScore(
  score0To10: number | null,
  children: EvaluationNodeResult[]
): EvaluationStatus {
  if (children.length > 0 && children.every((child) => child.status === "not_applicable")) {
    return "not_applicable";
  }
  if (children.length > 0 && children.every((child) => child.status === "missing")) {
    return "missing";
  }
  if (score0To10 === null) return "missing";
  if (score0To10 >= 9) return "pass";
  if (score0To10 >= 5) return "partial";
  return "fail";
}

function aggregateConfidence(children: EvaluationNodeResult[]): Confidence {
  const applicable = children.filter((child) => child.status !== "not_applicable");
  if (applicable.length === 0) return "low";
  const average =
    applicable.reduce((total, child) => total + confidenceOrder[child.confidence], 0) /
    applicable.length;
  if (average >= 1.5) return "high";
  if (average >= 0.75) return "medium";
  return "low";
}

function defaultConfidence(
  node: EvaluationNodeInput,
  status: EvaluationStatus
): Confidence {
  if (status === "missing" || status === "stale") return "low";
  if ((node.evidence ?? []).length > 0) return "medium";
  return "low";
}

function normalizedWeight(weight: number | undefined): number {
  if (weight === undefined) return 1;
  if (!Number.isFinite(weight) || weight < 0) return 0;
  return weight;
}

function stableReportId(root: EvaluationNodeResult): string {
  return `report-${root.id}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
