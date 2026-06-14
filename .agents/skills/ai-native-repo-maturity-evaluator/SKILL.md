---
name: ai-native-repo-maturity-evaluator
description: Evaluate full repository AI-native maturity or incremental repository state by routing through broad repository evaluator packs rather than event-specific lifecycle packs.
---

# AI Native Repo Maturity Evaluator

Evaluate full repository AI-native maturity, including baseline and incremental repository reviews.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-repo-maturity-evaluator",
  "label": "Repository maturity evaluator",
  "version": "0.1.0",
  "dimension": "repo_maturity",
  "directChildren": [
    { "pluginId": "ai-native-foundation-evaluator", "weight": 1, "required": true },
    { "pluginId": "bmad-method-evaluator", "weight": 0.5, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-repo-maturity-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it when the user clearly asks for the whole repository, a baseline, or an incremental repository-level review.

## Config Namespace

Configure this evaluator under:

```json
{
  "evaluators": {
    "ai-native-repo-maturity-evaluator": {
      "enabled": true,
      "additionalChildren": [],
      "disabledChildren": [],
      "settings": {
        "defaultPhase": "baseline"
      }
    }
  }
}
```

Supported phases are `baseline` and `incremental`. If the user asks for the whole repo without a phase, assume `baseline`.

Supported trigger modes are `one_shot`, `self_iteration`, and `external_event`.
The default trigger mode is `one_shot` for user-initiated repo evaluation.
`self_iteration` may emit threshold and repair recommendations, but an external
wrapper owns reruns and stop conditions. `external_event` may represent release,
merge, or custom repository events supplied by CI or another integration. This
evaluator owns any repo-specific trigger settings under
`evaluators["ai-native-repo-maturity-evaluator"].settings.triggers`; the core
tool should persist those settings without interpreting them.

## Evidence

Inspect broad repository evidence through direct child evaluator outputs: foundation maturity, optional BMAD maturity, repository docs, runtime commands, CI/test gates, GitHub workflow, agent readiness, evidence discipline, and recent PR-equivalent follow-through.

## Scoring Rules

Aggregate direct child evaluator outputs. Do not replace child evaluator judgments with broad scoring here.

## Required Checks

Confirm the user asked for repo-level evaluation before using this pack. If the user only invoked `ai-native-eval` without saying repo, PR, issue, thread, turn, or periodic, route back to the orchestrator selection prompt instead of assuming repo maturity.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
