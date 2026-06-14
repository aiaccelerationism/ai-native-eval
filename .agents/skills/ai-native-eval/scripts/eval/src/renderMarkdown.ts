import type {
  DeductionGroupResult,
  EvaluationNodeResult,
  EvaluationReport
} from "./types.js";

export function renderMarkdownReport(report: EvaluationReport): string {
  const lines: string[] = [];
  lines.push(`# AI Native Eval Report`);
  lines.push("");
  lines.push(`- Scope: ${report.scope}`);
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Score: ${formatScore(report.summary.score0To10)}`);
  lines.push(`- Level: ${report.summary.level0To10 ?? "n/a"}`);
  lines.push(`- Confidence: ${report.summary.confidence}`);
  if (report.reproducibility?.repoCommit) {
    lines.push(`- Repo commit: \`${report.reproducibility.repoCommit}\``);
  }
  lines.push("");
  renderPluginResolution(lines, report);
  renderRunConfig(lines, report);
  lines.push("## Evaluation Tree");
  lines.push("");
  renderNode(lines, report.root, 0);
  return `${lines.join("\n")}\n`;
}

function renderPluginResolution(lines: string[], report: EvaluationReport): void {
  if (!report.pluginResolution) return;
  lines.push("## Plugin Resolution");
  lines.push("");
  lines.push(`- Roots: ${formatInlineList(report.pluginResolution.rootPluginIds)}`);
  lines.push(`- Resolved: ${report.pluginResolution.resolvedPluginIds.length} plugin(s)`);
  if (report.pluginResolution.disabledPluginIds?.length) {
    lines.push(`- Disabled: ${formatInlineList(report.pluginResolution.disabledPluginIds)}`);
  }
  if (report.pluginResolution.missingPluginIds.length) {
    lines.push(`- Missing: ${formatInlineList(report.pluginResolution.missingPluginIds)}`);
  }
  lines.push("");
}

function renderRunConfig(lines: string[], report: EvaluationReport): void {
  const config = report.runConfig;
  if (!config) return;
  lines.push("## Run Configuration");
  lines.push("");
  lines.push(`- Built-in roots: ${formatInlineList(config.builtInRootPluginIds)}`);
  if (config.disabled.length) {
    lines.push("- Disabled plugins:");
    for (const item of config.disabled) {
      lines.push(`  - \`${item.pluginId}\` (${item.source}): ${item.reason}`);
    }
  }
  lines.push("");
}

function renderNode(
  lines: string[],
  node: EvaluationNodeResult,
  depth: number
): void {
  const prefix = "  ".repeat(depth);
  const score = formatScore(node.score0To10);
  const tags = [
    node.status,
    score,
    node.confidence,
    node.pluginId ? `\`${node.pluginId}\`` : undefined
  ].filter(Boolean);
  lines.push(`${prefix}- ${node.label} (${tags.join(" · ")})`);
  if (node.reason) {
    lines.push(`${prefix}  - Reason: ${node.reason}`);
  }
  if (node.disabledReason) {
    lines.push(`${prefix}  - Disabled: ${node.disabledReason}`);
  }
  renderEvidence(lines, node, prefix);
  renderRecommendations(lines, node, prefix);
  renderDeductions(lines, node.deductionGroups, prefix);
  for (const child of node.children) {
    renderNode(lines, child, depth + 1);
  }
}

function renderEvidence(
  lines: string[],
  node: EvaluationNodeResult,
  prefix: string
): void {
  if (!node.evidence?.length) return;
  lines.push(`${prefix}  - Evidence:`);
  for (const evidence of node.evidence) {
    const locator = evidence.locator ? ` ${evidence.locator}` : "";
    const url = evidence.url ? ` (${evidence.url})` : "";
    lines.push(
      `${prefix}    - ${evidence.source}${locator}${url}: ${evidence.summary}`
    );
  }
}

function renderRecommendations(
  lines: string[],
  node: EvaluationNodeResult,
  prefix: string
): void {
  if (!node.recommendations?.length) return;
  lines.push(`${prefix}  - Recommendations:`);
  for (const recommendation of node.recommendations) {
    const priority = recommendation.priority ? ` [${recommendation.priority}]` : "";
    lines.push(`${prefix}    -${priority} ${recommendation.summary}`);
  }
}

function renderDeductions(
  lines: string[],
  groups: DeductionGroupResult[] | undefined,
  prefix: string
): void {
  const appliedGroups = (groups ?? []).filter(
    (group) => group.appliedDeductions.length > 0
  );
  if (appliedGroups.length === 0) return;
  lines.push(`${prefix}  - Why not 10/10:`);
  for (const group of appliedGroups) {
    const cap = group.capped ? `, capped at ${group.budget}` : "";
    lines.push(
      `${prefix}    - ${group.label}: -${round(group.pointsLost)}${cap}`
    );
    renderAppliedDeductions(lines, group, prefix);
  }
}

function renderAppliedDeductions(
  lines: string[],
  group: DeductionGroupResult,
  prefix: string
): void {
  for (const deduction of group.appliedDeductions) {
    lines.push(
      `${prefix}      - ${deduction.label}: -${round(deduction.pointsLost)}`
    );
    if (deduction.reason) {
      lines.push(`${prefix}        - Reason: ${deduction.reason}`);
    }
    if (deduction.evidence?.length) {
      lines.push(`${prefix}        - Evidence:`);
      for (const evidence of deduction.evidence) {
        const locator = evidence.locator ? ` ${evidence.locator}` : "";
        lines.push(
          `${prefix}          - ${evidence.source}${locator}: ${evidence.summary}`
        );
      }
    }
    if (deduction.recommendation) {
      const priority = deduction.recommendation.priority
        ? ` [${deduction.recommendation.priority}]`
        : "";
      lines.push(
        `${prefix}        - Recommendation${priority}: ${deduction.recommendation.summary}`
      );
    }
  }
}

function formatInlineList(values: string[]): string {
  return values.map((value) => `\`${value}\``).join(", ");
}

function formatScore(value: number | null): string {
  return value === null ? "n/a" : `${value.toFixed(1)} / 10`;
}

function round(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
}
