---
name: bmad-method-evaluator
description: Evaluate BMAD Method adoption and artifact maturity. Use when an AI-native eval review should assess BMAD-style analysis, planning, solutioning, implementation, and core practice evidence.
---

# BMAD Method Evaluator

Evaluate BMAD Method adoption and artifact maturity.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-method-evaluator",
  "label": "BMAD Method evaluator",
  "version": "0.1.0",
  "dimension": "bmad_method",
  "directChildren": [
    { "pluginId": "bmad-analysis-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-planning-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-solutioning-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-implementation-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-core-practices-evaluator", "weight": 0.5, "required": true }
  ],
  "extensionPoints": [
    { "id": "bmad-method-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect product brief, PRFAQ, PRD, UX, architecture, epic/story, story context, implementation, and BMAD-style collaboration artifacts when present.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Keep this as a BMAD pack root. It owns only direct children and does not score leaf BMAD practices itself.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
