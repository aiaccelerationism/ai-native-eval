---
name: ai-native-periodic-health-evaluator
description: Evaluate scheduled or ad hoc repository health signals, known issue awareness, recurrence prevention, evidence traceability, and broad maturity drift.
---

# AI Native Periodic Health Evaluator

Evaluate periodic or ad hoc health signals without requiring a specific issue, PR, thread, or user turn.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-periodic-health-evaluator",
  "label": "Periodic health evaluator",
  "version": "0.1.0",
  "dimension": "periodic_health",
  "directChildren": [
    { "pluginId": "ai-native-foundation-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-known-issue-awareness-evaluator", "weight": 0.6, "required": true },
    { "pluginId": "ai-native-recurrence-prevention-evaluator", "weight": 0.6, "required": true },
    { "pluginId": "ai-native-evidence-evaluator", "weight": 0.6, "required": true },
    { "pluginId": "ai-native-artifact-traceability-evaluator", "weight": 0.4, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-periodic-health-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it for scheduled checks, recurring health reviews, or drift sampling.

## Config Namespace

Configure this evaluator under `evaluators["ai-native-periodic-health-evaluator"]`.

Supported phases are `scheduled`, `ad_hoc`, and `follow_up`. If periodic target is clear but phase is absent, assume `ad_hoc`.

Supported trigger modes are `periodic`, `one_shot`, and `external_event`.
The default trigger mode is `periodic` when the target is scheduled or periodic
health. Use `one_shot` for ad hoc health scans requested by a user.
`external_event` may represent post-merge, release, incident, or project-specific
health triggers supplied by CI or another integration. Store periodic trigger
settings under
`evaluators["ai-native-periodic-health-evaluator"].settings.triggers`; this
evaluator does not own the scheduler itself.

## Evidence

Inspect recent repository evidence, stale findings, known issue cards, recurrence-prevention artifacts, persisted reports, and current foundation health signals.

## Scoring Rules

Aggregate direct child evaluator outputs. Periodic health may sample evidence, but it must not hide missing artifacts by averaging them into a broad narrative.

## Required Checks

State whether the run is scheduled or ad hoc. Do not treat periodic health as a PR, issue, thread, or turn review.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs.
