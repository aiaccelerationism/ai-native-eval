---
name: ai-native-agent-readiness-evaluator
description: Evaluate AGENTS.md, project skills, agent routing, handoff instructions, review contracts, and agent-safe workflow rules for AI-native repo maturity. Use when an AI-native eval review needs agent-readiness scoring.
---

# AI Native Agent Readiness Evaluator

Evaluate whether agents can enter the repo, choose the right skills, respect boundaries, and hand work off safely.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-agent-readiness-evaluator",
  "label": "Agent readiness evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [
    { "pluginId": "ai-native-repo-thread-bootstrap-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-worktree-isolation-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-parallel-agent-capacity-evaluator", "weight": 0.8, "required": false },
    { "pluginId": "ai-native-thread-closeout-evaluator", "weight": 0.8, "required": false },
    { "pluginId": "ai-native-skill-routing-quality-evaluator", "weight": 1.2, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-agent-readiness-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only the direct child evaluator list above and should not score those concerns itself when a child evaluator is installed.

## Evidence

Inspect:

- `AGENTS.md`, agent instructions, project skill folders, routing/interface skills, and skill metadata.
- Required reading rules, trigger descriptions, local workflow rules, and mutation boundaries.
- Git, issue, PR, review, runtime, and human approval instructions written for agents.
- Handoff/closeout guidance and durable memory conventions.
- Skill evals or no-eval rationale when skill changes are meant to prevent repeated misses.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: instructions are discoverable, task-routed, specific, and enforce safe agent behavior.
- `partial`: instructions exist but are broad, stale, overloaded, or missing important trigger/routing detail.
- `missing`: required agent-facing guidance or skill entrypoints are absent.
- `stale`: skill/docs conflict with current repo workflow.
- `fail`: instructions encourage unsafe edits, hidden approvals, secret exposure, or bypassed review gates.

## Required Checks

For each scored node:

- Cite exact skill or instruction files.
- Identify whether the problem is missing guidance, unclear routing, stale guidance, or unsafe guidance.
- Recommend a skill update, protocol extraction, eval case, or decision doc when durable behavior should change.
- Do not give credit for chat-only preferences that are not captured in repo skills or docs.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not evaluate code architecture except where it affects agent instructions or skill routing.
