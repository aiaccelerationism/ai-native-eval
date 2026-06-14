---
name: ai-native-parallel-agent-capacity-evaluator
description: Evaluate parallel agent capacity planning for AI-native repo maturity. Use when scoring whether the repo can plan fan-out work, subagent budgets, review workers, and repair loops.
---

# AI Native Parallel Agent Capacity Evaluator

Evaluate one thing: whether the repo can reason about agent fan-out capacity without over-spawning or losing review boundaries.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-parallel-agent-capacity-evaluator",
  "label": "Parallel agent capacity evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-parallel-agent-capacity-evaluator.children" }]
}
```

## Evidence

Inspect subagent capacity docs, task graph planning rules, reviewer fan-out guidance, execution batch records, and local Codex configuration recommendations.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating fan-out planning, subagent budgets, reviewer workers, repair loops, and max thread constraints.

```ai-native-deduction-groups
[
  {
    "id": "capacity-policy",
    "label": "Capacity policy",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-capacity-policy",
        "label": "Missing capacity policy",
        "points": 0.4,
        "appliesWhen": "The repository does not document local agent capacity or fan-out limits.",
        "evidenceRequired": "Cite AGENTS.md, planning docs, subagent guidance, task plans, and workflow docs that show the missing parallel agent capacity requirement.",
        "recommendation": "Add explicit parallel agent capacity guidance for capacity policy."
      },
      {
        "id": "incomplete-capacity-policy",
        "label": "Incomplete capacity policy",
        "points": 0.2,
        "appliesWhen": "The repository policy exists but omits how to handle oversized task graphs.",
        "evidenceRequired": "Cite the partial parallel agent capacity evidence and the specific gap.",
        "recommendation": "Tighten the capacity policy guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-capacity-policy",
        "label": "Unlinked capacity policy evidence",
        "points": 0.1,
        "appliesWhen": "Parallel agent capacity evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the parallel agent capacity evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "batch-planning",
    "label": "Batch planning",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-batch-planning",
        "label": "Missing batch planning",
        "points": 0.35,
        "appliesWhen": "The repository does not require task plans to account for worker/reviewer/repair parallelism.",
        "evidenceRequired": "Cite AGENTS.md, planning docs, subagent guidance, task plans, and workflow docs that show the missing parallel agent capacity requirement.",
        "recommendation": "Add explicit parallel agent capacity guidance for batch planning."
      },
      {
        "id": "incomplete-batch-planning",
        "label": "Incomplete batch planning",
        "points": 0.18,
        "appliesWhen": "The repository planning guidance exists but lacks durable capacity records.",
        "evidenceRequired": "Cite the partial parallel agent capacity evidence and the specific gap.",
        "recommendation": "Tighten the batch planning guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-batch-planning",
        "label": "Unlinked batch planning evidence",
        "points": 0.09,
        "appliesWhen": "Parallel agent capacity evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the parallel agent capacity evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "over-fanout-recovery",
    "label": "Over-fanout recovery",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-over-fanout-recovery",
        "label": "Missing over-fanout recovery",
        "points": 0.25,
        "appliesWhen": "The repository does not explain what to do when planned parallelism exceeds capacity.",
        "evidenceRequired": "Cite AGENTS.md, planning docs, subagent guidance, task plans, and workflow docs that show the missing parallel agent capacity requirement.",
        "recommendation": "Add explicit parallel agent capacity guidance for over-fanout recovery."
      },
      {
        "id": "incomplete-over-fanout-recovery",
        "label": "Incomplete over-fanout recovery",
        "points": 0.13,
        "appliesWhen": "The repository recovery guidance exists but is not tied to planning or user approval.",
        "evidenceRequired": "Cite the partial parallel agent capacity evidence and the specific gap.",
        "recommendation": "Tighten the over-fanout recovery guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-over-fanout-recovery",
        "label": "Unlinked over-fanout recovery evidence",
        "points": 0.06,
        "appliesWhen": "Parallel agent capacity evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the parallel agent capacity evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact fan-out rules and identify whether capacity checks happen before parallel work.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-parallel-agent-capacity-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
