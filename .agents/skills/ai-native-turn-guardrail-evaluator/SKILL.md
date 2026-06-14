---
name: ai-native-turn-guardrail-evaluator
description: Evaluate a single user turn or agent response for workflow enforcement, skill activation, known issue awareness, and whether the agent should ask, push back, or record evidence.
---

# AI Native Turn Guardrail Evaluator

Evaluate one user request or agent response as a lightweight guardrail check.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-turn-guardrail-evaluator",
  "label": "Turn guardrail evaluator",
  "version": "0.1.0",
  "dimension": "turn_guardrail",
  "directChildren": [
    { "pluginId": "ai-native-skill-activation-depth-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-human-follow-through-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-known-issue-awareness-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-repo-thread-bootstrap-evaluator", "weight": 0.6, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-turn-guardrail-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it when the user asks whether a single request, response, or immediate next step is following AI-native workflow expectations.

## Config Namespace

Configure this evaluator under `evaluators["ai-native-turn-guardrail-evaluator"]`.

Supported phases are `before_response`, `after_user_query`, and `after_response`. If a turn target is clear but phase is absent, assume `after_user_query`.

Supported trigger modes are `one_shot`, `turn_inline`, and `self_iteration`.
The default trigger mode is `one_shot` when a user asks for a single-turn
guardrail check. `turn_inline` is appropriate when an external agent runtime
checks each user/agent exchange. `self_iteration` may emit threshold metadata
and repair recommendations for the current response, but an external wrapper
owns the loop and reruns. Store turn trigger settings under
`evaluators["ai-native-turn-guardrail-evaluator"].settings.triggers`.

## Evidence

Inspect the immediate user request, current agent response plan, active skill trigger, known issue awareness, required repo workflow, and whether the agent should ask a clarifying question or enforce a process rule before continuing.

## Scoring Rules

Aggregate direct child evaluator outputs. This evaluator should be advisory by default and should not update overall repository maturity unless explicitly configured.

## Required Checks

State the turn phase and whether the result is advisory or blocking. Do not escalate to full repo maturity when the request is a single-turn guardrail check.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs.
