---
name: ai-native-research-evaluator
description: Evaluate whether AI Native Eval has a credible research program for proving eval-guided AI-native adoption improves development outcomes. Use only for this project or compatible evaluator-system projects, not ordinary foundation reviews.
---

# AI Native Research Evaluator

Evaluate whether this evaluator-system project has enough research design, measurable outcomes, and evidence-chain discipline to test its central claim.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

This evaluator is not a default root for ordinary repositories. It is intended for this repository's own project config and for compatible evaluator-system projects that need to evaluate research readiness.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-research-evaluator",
  "label": "AI Native research evaluator",
  "version": "0.1.0",
  "dimension": "research_readiness",
  "directChildren": [
    { "pluginId": "ai-native-research-claim-design-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-research-performance-metrics-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-research-evidence-chain-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-research-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect direct child evaluator outputs for claim and study design readiness, measurable performance metrics, and evidence-chain validity.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Ensure each direct child evaluates research readiness for proving eval-guided AI-native adoption, not generic repository maturity and not foundation readiness.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
