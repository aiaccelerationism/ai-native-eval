---
name: bmad-implementation-evaluator
description: Evaluate BMAD implementation-stage artifacts. Use when scoring story context quality and implementation handoff readiness.
---

# BMAD Implementation Evaluator

Evaluate BMAD implementation-stage artifacts.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-implementation-evaluator",
  "label": "BMAD implementation evaluator",
  "version": "0.1.0",
  "dimension": "bmad_implementation",
  "directChildren": [
    { "pluginId": "bmad-story-context-quality-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "bmad-implementation-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect story files, dev-story execution notes, investigation reports, checkpoint previews, code review outputs, course corrections, retrospectives, sprint plans, and sprint status when available.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Route only direct implementation children. Future implementation children should be added here.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
