---
name: ai-native-thread-checkpoint-evaluator
description: Evaluate agent thread checkpoints, collaboration trace, human follow-through, AI self-assessment, handoff quality, and thread closeout.
---

# AI Native Thread Checkpoint Evaluator

Evaluate the current agent thread or a thread checkpoint as first-class AI-native workflow evidence.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-thread-checkpoint-evaluator",
  "label": "Thread checkpoint evaluator",
  "version": "0.1.0",
  "dimension": "thread_checkpoint",
  "directChildren": [
    { "pluginId": "ai-native-agent-thread-participation-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-human-ai-collaboration-trace-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-human-follow-through-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-ai-self-assessment-loop-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-thread-closeout-evaluator", "weight": 0.8, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-thread-checkpoint-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it when the user asks about the current thread, handoff quality, closeout, or collaboration state.

## Config Namespace

Configure this evaluator under `evaluators["ai-native-thread-checkpoint-evaluator"]`.

Supported phases are `checkpoint`, `handoff`, and `closeout`. If a thread target is clear but phase is absent, assume `checkpoint`.

Supported trigger modes are `one_shot`, `turn_inline`, and `self_iteration`.
The default trigger mode is `one_shot` when a user asks to evaluate a thread.
`turn_inline` evaluates the current user/agent interaction as thread evidence
without escalating to a full repository review. `self_iteration` may emit
threshold metadata and repair guidance for thread quality, but an external
wrapper owns repeated reruns and stop conditions. Store thread trigger settings
under
`evaluators["ai-native-thread-checkpoint-evaluator"].settings.triggers`.

## Evidence

Inspect the agent thread summary, user decisions, tool evidence, skill activation, AI self-assessment, human follow-through, closeout notes, and links to issue/PR artifacts.

## Scoring Rules

Aggregate direct child evaluator outputs. Do not replace missing thread evidence with repository-level documentation evidence.

## Required Checks

State whether this is a checkpoint, handoff, or closeout evaluation. Do not ask whether the user meant thread evaluation when the prompt already names the current thread or thread status.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs.
