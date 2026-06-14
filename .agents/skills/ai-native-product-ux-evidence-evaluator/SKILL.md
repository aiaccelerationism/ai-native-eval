---
name: ai-native-product-ux-evidence-evaluator
description: Evaluate product and UX evidence for AI-native repo maturity. Use when a level review needs scoring for product design readiness, UX mock contracts, design review gates, and visual proof.
---

# AI Native Product UX Evidence Evaluator

Evaluate whether visible product work has enough design intent, mock contract, review gate, and visual evidence for agents to make reviewable progress.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-product-ux-evidence-evaluator",
  "label": "Product UX evidence evaluator",
  "version": "0.1.0",
  "dimension": "product_ux_evidence",
  "directChildren": [
    { "pluginId": "ai-native-product-design-readiness-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-ux-mock-contract-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-design-review-gate-evaluator", "weight": 1, "required": false },
    { "pluginId": "ai-native-visual-evidence-evaluator", "weight": 1, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-product-ux-evidence-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb product strategy, UX mock, design review, and visual proof into one score.

## Evidence

Inspect product briefs, UX mock policy, mock routes, design-review artifacts, screenshots, videos, traces, and PR evidence for visible work.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node when an expected direct child evaluator is unavailable.

## Required Checks

For each child, cite the exact product or UX evidence it evaluated.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
