---
name: bmad-planning-evaluator
description: Evaluate BMAD planning-stage artifacts. Use when scoring PRD and UX planning evidence for BMAD Method maturity.
---

# BMAD Planning Evaluator

Evaluate BMAD planning-stage artifacts.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-planning-evaluator",
  "label": "BMAD planning evaluator",
  "version": "0.1.0",
  "dimension": "bmad_planning",
  "directChildren": [
    { "pluginId": "bmad-prd-quality-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "bmad-planning-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect PRDs, UX specs, validation notes, acceptance criteria, non-goals, risks, and dependencies.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Route only direct planning children. Future UX spec and PRD validation children should be added here.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
