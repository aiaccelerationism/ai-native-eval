---
name: ai-native-foundation-evaluator
description: Evaluate the built-in AI-native repository foundation pack. Use when a level review needs the default repo maturity model covering operability, docs, agent readiness, GitHub, CI/test, product UX evidence, architecture, and evidence discipline.
---

# AI Native Foundation Evaluator

Evaluate the built-in AI-native repository foundation pack.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-foundation-evaluator",
  "label": "AI-native foundation evaluator",
  "version": "0.1.0",
  "dimension": "ai_native_foundation",
  "directChildren": [
    { "pluginId": "ai-native-repo-operability-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-docs-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-agent-readiness-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-github-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-ci-test-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-product-ux-evidence-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-architecture-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-evidence-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-foundation-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect the child evaluator outputs for the built-in AI-native foundation model.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Ensure each direct child contributes its own evidence and scoring boundary.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
