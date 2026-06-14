export type EvaluationStatus =
  | "pass"
  | "partial"
  | "fail"
  | "missing"
  | "stale"
  | "not_applicable";

export type Confidence = "low" | "medium" | "high";

export type ReportUiLanguage = "en" | "zh-TW";

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
  root: EvaluationNodeResult;
  summary: EvalSummary;
  pluginResolution?: PluginResolution;
  runConfig?: EffectiveEvalConfigSnapshot;
  executionBatches?: EvaluationBatch[];
  evaluatorRuns?: EvaluatorRunRecord[];
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

export interface EvalConfig {
  schemaVersion: number;
  additionalRoots?: EvalConfigRoot[];
  disabled?: EvalConfigDisabled[];
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

export interface EffectiveEvalConfigSnapshot {
  schemaVersion: number;
  configSources: EvalConfigSource[];
  builtInRootPluginIds: string[];
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
