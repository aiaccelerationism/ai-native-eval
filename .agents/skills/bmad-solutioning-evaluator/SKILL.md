---
name: bmad-solutioning-evaluator
description: Evaluate BMAD solutioning-stage artifacts. Use when scoring architecture readiness and epic/story breakdown evidence.
---

# BMAD Solutioning Evaluator

Evaluate BMAD solutioning-stage artifacts.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-solutioning-evaluator",
  "label": "BMAD solutioning evaluator",
  "version": "0.1.0",
  "dimension": "bmad_solutioning",
  "directChildren": [
    { "pluginId": "bmad-architecture-readiness-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-epic-story-breakdown-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "bmad-solutioning-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect architecture decisions, implementation readiness notes, project context, epics, and story breakdown artifacts.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Route only direct solutioning children.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
