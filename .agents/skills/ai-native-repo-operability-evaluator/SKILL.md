---
name: ai-native-repo-operability-evaluator
description: Evaluate repository operability for AI-native work. Use when a level review needs scoring for local runtime commands, environment reproducibility, and project start/run/reset surfaces.
---

# AI Native Repo Operability Evaluator

Evaluate whether an agent can reliably start, inspect, reset, and operate the repository without inventing machine-local steps.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-repo-operability-evaluator",
  "label": "Repo operability evaluator",
  "version": "0.1.0",
  "dimension": "repo_operability",
  "directChildren": [
    { "pluginId": "ai-native-local-runtime-command-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-local-environment-reproducibility-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-repo-operability-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not score runtime details itself when child evaluators are installed.

## Evidence

Inspect runtime docs, package scripts, local environment scripts, workspace allocation docs, reset/down commands, and smoke validation docs.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node when an expected direct child evaluator is unavailable.

## Required Checks

For each child, cite the exact command surface or local environment evidence it evaluated.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
