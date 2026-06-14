---
name: bmad-analysis-evaluator
description: Evaluate BMAD analysis-stage artifacts. Use when scoring product brief and early discovery evidence for BMAD Method maturity.
---

# BMAD Analysis Evaluator

Evaluate BMAD analysis-stage artifacts.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-analysis-evaluator",
  "label": "BMAD analysis evaluator",
  "version": "0.1.0",
  "dimension": "bmad_analysis",
  "directChildren": [
    { "pluginId": "bmad-product-brief-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "bmad-analysis-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect product briefs, PRFAQs, discovery notes, research artifacts, and brownfield documentation when available.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

## Required Checks

Route only direct analysis children. Future research and PRFAQ children should be added here.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
