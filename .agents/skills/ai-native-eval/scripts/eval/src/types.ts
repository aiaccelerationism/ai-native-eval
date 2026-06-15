export type EvaluationStatus =
  | "pass"
  | "partial"
  | "fail"
  | "missing"
  | "stale"
  | "not_applicable";

export type Confidence = "low" | "medium" | "high";

export type ReportUiLanguage = "en" | "zh-CN" | "zh-TW" | "es" | "de" | "ja";

export type TriggerMode =
  | "one_shot"
  | "turn_inline"
  | "self_iteration"
  | "periodic"
  | "external_event";

export interface TriggerMetadata {
  mode: TriggerMode;
  source?: "user" | "agent" | "github" | "scheduler" | "wrapper" | string;
  event?: string;
  threshold?: number;
  maxIterations?: number;
}

export interface EvaluationContext {
  reviewType: string;
  target?: string;
  targetRef?: string;
  phase?: string;
  trigger?: string;
  triggerMetadata?: TriggerMetadata;
  targetSurfaces?: string[];
  outputIntents?: string[];
  affectsOverallScore?: boolean;
  assumption?: string;
}

export interface EvidenceLink {
  id?: string;
  source: string;
  locator?: string;
  url?: string;
  summary: string;
}

export interface Recommendation {
  id?: string;
  summary: string;
  priority?: "low" | "medium" | "high";
  triggeredBy?: string[];
}

export interface ImprovementReference {
  label: string;
  url?: string;
  source?: string;
  summary?: string;
}

export interface DeductionInput {
  id: string;
  label: string;
  points: number;
  applies: boolean;
  reason?: string;
  evidence?: EvidenceLink[];
  recommendation?: Recommendation;
}

export interface DeductionRubricInput {
  id: string;
  label: string;
  points: number;
  appliesWhen: string;
  evidenceRequired: string;
  recommendation?: string;
}

export interface DeductionGroupRubricInput {
  id: string;
  label: string;
  budget: number;
  deductions: DeductionRubricInput[];
}

export type PolicySeverity = "off" | "warn" | "error";

export type PolicyStatus = "passed" | "triggered";

export type PolicySummaryStatus = "pass" | "warn" | "blocked";

export type PolicyRuleCondition = "scoreBelow";

export interface PolicyRuleOptions {
  threshold?: number;
}

export interface PolicyRuleDefinition {
  id: string;
  label?: string;
  ownerPluginId?: string;
  targetPluginId?: string;
  targetNodeId?: string;
  condition: PolicyRuleCondition;
  defaultSeverity: PolicySeverity;
  defaultOptions?: PolicyRuleOptions;
  message: string;
}

export type PolicyRuleConfig =
  | PolicySeverity
  | [PolicySeverity, PolicyRuleOptions];

export interface PolicyRuleResult {
  ruleId: string;
  label?: string;
  ownerPluginId?: string;
  targetPluginId?: string;
  targetNodeId?: string;
  targetLabel?: string;
  severity: Exclude<PolicySeverity, "off">;
  status: PolicyStatus;
  condition: PolicyRuleCondition;
  threshold?: number;
  actualScore0To10?: number | null;
  message: string;
}

export interface PolicySummary {
  status: PolicySummaryStatus;
  errorCount: number;
  warnCount: number;
  triggeredCount: number;
  results: PolicyRuleResult[];
}

export interface EvaluatorDeductionJudgment {
  groupId: string;
  deductionId: string;
  applies: boolean;
  reason?: string;
  evidence?: EvidenceLink[];
  recommendation?: Recommendation;
}

export interface LeafEvaluatorOutput {
  pluginId: string;
  nodeId?: string;
  label?: string;
  kind?: string;
  dimension?: string;
  status?: EvaluationStatus;
  confidence?: Confidence;
  reason?: string;
  evidence?: EvidenceLink[];
  recommendations?: Recommendation[];
  references?: ImprovementReference[];
  deductions: EvaluatorDeductionJudgment[];
}

export interface DeductionGroupInput {
  id: string;
  label: string;
  budget: number;
  deductions: DeductionInput[];
}

export interface DeductionResult extends DeductionInput {
  pointsLost: number;
}

export interface DeductionGroupResult extends DeductionGroupInput {
  pointsLost: number;
  capped: boolean;
  deductions: DeductionResult[];
  appliedDeductions: DeductionResult[];
}

export interface EvaluationNodeInput {
  id: string;
  label: string;
  kind?: string;
  dimension?: string;
  evaluatorId?: string;
  pluginId?: string;
  runnerBatchId?: string;
  weight?: number;
  status?: EvaluationStatus;
  confidence?: Confidence;
  pointsAvailable?: number;
  pointsEarned?: number;
  reason?: string;
  evidence?: EvidenceLink[];
  recommendations?: Recommendation[];
  references?: ImprovementReference[];
  deductionGroups?: DeductionGroupInput[];
  policyResults?: PolicyRuleResult[];
  carriedForwardFrom?: string;
  disabledReason?: string;
  disabledSource?: string;
  origin?: "built-in" | "additional";
  children?: EvaluationNodeInput[];
}

export interface EvaluationNodeResult
  extends Omit<EvaluationNodeInput, "children" | "deductionGroups"> {
  weight: number;
  status: EvaluationStatus;
  confidence: Confidence;
  score0To10: number | null;
  pointsAvailable: number;
  pointsEarned: number;
  lostPoints: number;
  deductionGroups?: DeductionGroupResult[];
  children: EvaluationNodeResult[];
}

export interface DimensionScore {
  dimension: string;
  score0To10: number;
  weight: number;
  pointsAvailable: number;
  pointsEarned: number;
  nodeIds: string[];
}

export interface EvalSummary {
  score0To10: number | null;
  score0To100: number | null;
  level0To10: number | null;
  confidence: Confidence;
  dimensions: DimensionScore[];
  policy?: PolicySummary;
  lostPoints: Array<{
    nodeId: string;
    label: string;
    lostPoints: number;
    dimension?: string;
  }>;
}

export interface EvaluationReport {
  reportId: string;
  generatedAt: string;
  language?: string;
  uiLanguage?: ReportUiLanguage;
  scope: string;
  evaluationContext?: EvaluationContext;
  root: EvaluationNodeResult;
  summary: EvalSummary;
  pluginResolution?: PluginResolution;
  runConfig?: EffectiveEvalConfigSnapshot;
  executionBatches?: EvaluationBatch[];
  evaluatorRuns?: EvaluatorRunRecord[];
  policy?: PolicySummary;
  reproducibility?: {
    repoUrl?: string;
    repoCommit?: string;
    configHash?: string;
    evaluatorLockHash?: string;
    scoringModelVersion?: string;
  };
}

export interface EvaluatorChildRef {
  pluginId: string;
  weight?: number;
  required?: boolean;
  reason?: string;
}

export interface EvaluatorExtensionPoint {
  id: string;
  label?: string;
  description?: string;
}

export interface EvaluatorPluginManifest {
  pluginId: string;
  label: string;
  version?: string;
  dimension?: string;
  directChildren?: EvaluatorChildRef[];
  extensionPoints?: EvaluatorExtensionPoint[];
  policyRules?: PolicyRuleDefinition[];
}

export interface PluginResolution {
  rootPluginIds: string[];
  resolvedPluginIds: string[];
  missingPluginIds: string[];
  disabledPluginIds?: string[];
}

export interface EvalConfigRoot {
  pluginId: string;
  reason?: string;
}

export interface EvalConfigDisabled {
  pluginId: string;
  reason: string;
}

export interface EvalEvaluatorConfig {
  enabled?: boolean;
  additionalChildren?: EvaluatorChildRef[];
  disabledChildren?: EvalConfigDisabled[];
  settings?: Record<string, unknown>;
}

export interface EvalContextRouteMatch {
  reviewType?: string;
  target?: string;
  phase?: string;
  trigger?: string;
  targetSurface?: string;
}

export interface EvalContextRoute {
  id: string;
  description?: string;
  match: EvalContextRouteMatch;
  scope?: string;
  additionalRoots?: EvalConfigRoot[];
  disabled?: EvalConfigDisabled[];
  outputIntents?: string[];
  affectsOverallScore?: boolean;
}

export interface EvalConfig {
  schemaVersion: number;
  evaluators?: Record<string, EvalEvaluatorConfig>;
  /**
   * @deprecated Use evaluators[pluginId].additionalChildren instead.
   */
  additionalRoots?: EvalConfigRoot[];
  /**
   * @deprecated Use evaluators[pluginId].disabledChildren or enabled:false instead.
   */
  disabled?: EvalConfigDisabled[];
  /**
   * @deprecated Route to evaluator skills directly and configure them under evaluators[pluginId].
   */
  contextRoutes?: EvalContextRoute[];
}

export interface EvalConfigSource {
  kind: "built-in" | "person" | "project" | "explicit";
  path?: string;
  found: boolean;
}

export interface ResolvedRootPlugin {
  pluginId: string;
  origin: "built-in" | "additional";
  reason?: string;
  source: string;
}

export interface ResolvedDisabledPlugin {
  pluginId: string;
  reason: string;
  source: string;
}

export interface ResolvedEvaluatorChildRef extends EvaluatorChildRef {
  source: string;
}

export interface ResolvedEvaluatorConfig {
  pluginId: string;
  source: string;
  enabled?: boolean;
  additionalChildren?: ResolvedEvaluatorChildRef[];
  disabledChildren?: ResolvedDisabledPlugin[];
  settings?: Record<string, unknown>;
}

export interface ConfigWarning {
  code: string;
  source: string;
  message: string;
}

export interface ResolvedContextRoute {
  id: string;
  source: string;
  description?: string;
  scope?: string;
  outputIntents?: string[];
  affectsOverallScore?: boolean;
}

export interface EffectiveEvalConfigSnapshot {
  schemaVersion: number;
  configSources: EvalConfigSource[];
  builtInRootPluginIds: string[];
  evaluationContext?: EvaluationContext;
  appliedContextRoutes?: ResolvedContextRoute[];
  evaluatorConfigs?: ResolvedEvaluatorConfig[];
  warnings?: ConfigWarning[];
  roots: ResolvedRootPlugin[];
  disabled: ResolvedDisabledPlugin[];
}

export interface EvaluationBatch {
  batchId: string;
  runner: "single-agent" | "subagent" | "manual";
  pluginIds: string[];
  scope?: {
    changedFiles?: string[];
    evidenceSurfaces?: string[];
  };
}

export interface EvaluatorRunRecord {
  evaluatorId: string;
  pluginId: string;
  runnerBatchId: string;
  nodeId: string;
  status: EvaluationStatus;
  confidence: Confidence;
  pointsAvailable: number;
  pointsEarned: number;
}

export interface EvalState {
  schemaVersion: number;
  repoRoot: string;
  lastReviewedCommit?: string;
  lastReviewedAt?: string;
  latestSnapshotPath?: string;
  latestReportJsonPath?: string;
  latestReportHtmlPath?: string;
  latestManifestPath?: string;
}

export interface IncrementalManifest {
  schemaVersion: number;
  manifestId: string;
  generatedAt: string;
  evaluationContext?: EvaluationContext;
  baseCommit?: string;
  headCommit?: string;
  changedFiles: string[];
  changedEvidenceSurfaces: string[];
  affectedNodeIds: string[];
  carriedForwardNodeIds: string[];
}

export interface ArtifactPaths {
  runId: string;
  bundleRoot: string;
  runFolder: string;
  snapshotPath: string;
  manifestPath: string;
  reportJsonPath: string;
  reportMarkdownPath: string;
  reportHtmlPath: string;
}
