---
name: ai-native-issue-lifecycle-evaluator
description: Evaluate issue intake, planning readiness, follow-up quality, acceptance criteria, decision context, and issue-to-work handoff for AI-native development.
---

# AI Native Issue Lifecycle Evaluator

Evaluate one issue lifecycle context without running a full repository baseline by default.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-issue-lifecycle-evaluator",
  "label": "Issue lifecycle evaluator",
  "version": "0.1.0",
  "dimension": "issue_lifecycle",
  "directChildren": [
    { "pluginId": "ai-native-issue-readiness-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-decision-context-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-skill-activation-depth-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-acceptance-proof-evaluator", "weight": 0.8, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-issue-lifecycle-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it when the user asks to evaluate an issue, issue readiness, planning context, or follow-up work item.

## Config Namespace

Configure this evaluator under `evaluators["ai-native-issue-lifecycle-evaluator"]`.

Supported phases are `intake`, `planning`, `active`, `follow_up`, and `closeout`. If an issue target is clear but phase is absent, assume `intake`.

Supported trigger modes are `one_shot`, `external_event`, and
`self_iteration`. The default trigger mode is `one_shot` when a user asks to
evaluate an issue. `external_event` may represent issue creation, label changes,
assignment, linked PR updates, or project-specific issue workflow events.
`self_iteration` may emit repair guidance for issue readiness or planning gaps,
but an external wrapper owns reruns and enforcement. Store issue trigger
settings under
`evaluators["ai-native-issue-lifecycle-evaluator"].settings.triggers`.

## Evidence

Inspect issue body, acceptance criteria, non-goals, dependencies, labels, linked PRs, reviewer expectations, decision context, skill routing expectations, and follow-up artifacts.

## Scoring Rules

Aggregate direct child evaluator outputs. Do not score PR implementation evidence unless it is linked from the issue lifecycle context.

## Required Checks

State the detected issue phase and target reference. Do not ask whether the user meant issue evaluation when the prompt already names an issue.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs.
