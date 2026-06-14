---
name: ai-native-eval-self-evaluator
description: Evaluate AI Native Eval as an evaluator system. Use only when evaluating this project itself or a compatible evaluator-system project, not for ordinary repository maturity reviews.
---

# AI Native Eval Self Evaluator

Evaluate the AI Native Eval evaluator system itself.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

This evaluator is not a default root for ordinary repositories. It is intended for this repository's own project config and for projects that are themselves evaluator systems.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-self-evaluator",
  "label": "AI Native Eval self evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [
    { "pluginId": "ai-native-eval-rubric-quality-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-eval-aggregation-integrity-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-eval-plugin-boundary-integrity-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-eval-self-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect direct child evaluator outputs for rubric quality, deterministic aggregation integrity, and plugin-boundary integrity.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Ensure each direct child evaluates a domain-specific part of the evaluator-system itself rather than generic repository maturity.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
