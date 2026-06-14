---
name: ai-native-local-environment-reproducibility-evaluator
description: Evaluate local environment reproducibility for AI-native repo maturity. Use when scoring workspace allocation, reset/down flows, database readiness, env composition, and machine-local state handling.
---

# AI Native Local Environment Reproducibility Evaluator

Evaluate one thing: whether agents can create, reset, and validate local environments without hidden machine state.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-local-environment-reproducibility-evaluator",
  "label": "Local environment reproducibility evaluator",
  "version": "0.1.0",
  "dimension": "repo_operability",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-local-environment-reproducibility-evaluator.children" }]
}
```

## Evidence

Inspect local environment docs, workspace allocator scripts, reset/down commands, migration readiness, env templates, ignored local state, and smoke checks.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating workspace allocation, reset/down flows, database readiness, env composition, and machine-local state.

```ai-native-deduction-groups
[
  {
    "id": "environment-setup",
    "label": "Environment setup",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-environment-setup",
        "label": "Missing environment setup",
        "points": 0.4,
        "appliesWhen": "The repository does not document enough setup for a fresh agent to reproduce the local environment.",
        "evidenceRequired": "Cite README, env examples, package scripts, docker/mise configs, reset docs, database docs, and E2E setup docs that show the missing local environment reproducibility requirement.",
        "recommendation": "Add explicit local environment reproducibility guidance for environment setup."
      },
      {
        "id": "incomplete-environment-setup",
        "label": "Incomplete environment setup",
        "points": 0.2,
        "appliesWhen": "The repository setup exists but omits env files, services, ports, or install details.",
        "evidenceRequired": "Cite the partial local environment reproducibility evidence and the specific gap.",
        "recommendation": "Tighten the environment setup guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-environment-setup",
        "label": "Unlinked environment setup evidence",
        "points": 0.1,
        "appliesWhen": "Local environment reproducibility evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local environment reproducibility evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "reset-and-recovery",
    "label": "Reset and recovery",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-reset-and-recovery",
        "label": "Missing reset and recovery",
        "points": 0.35,
        "appliesWhen": "The repository does not provide reset/down/recovery commands for stale local state.",
        "evidenceRequired": "Cite README, env examples, package scripts, docker/mise configs, reset docs, database docs, and E2E setup docs that show the missing local environment reproducibility requirement.",
        "recommendation": "Add explicit local environment reproducibility guidance for reset and recovery."
      },
      {
        "id": "incomplete-reset-and-recovery",
        "label": "Incomplete reset and recovery",
        "points": 0.18,
        "appliesWhen": "The repository recovery exists but omits common state such as DB, cache, services, or ports.",
        "evidenceRequired": "Cite the partial local environment reproducibility evidence and the specific gap.",
        "recommendation": "Tighten the reset and recovery guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-reset-and-recovery",
        "label": "Unlinked reset and recovery evidence",
        "points": 0.09,
        "appliesWhen": "Local environment reproducibility evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local environment reproducibility evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "machine-local-boundaries",
    "label": "Machine-local boundaries",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-machine-local-boundaries",
        "label": "Missing machine-local boundaries",
        "points": 0.25,
        "appliesWhen": "The repository does not distinguish repo-owned state from machine-local secrets or artifacts.",
        "evidenceRequired": "Cite README, env examples, package scripts, docker/mise configs, reset docs, database docs, and E2E setup docs that show the missing local environment reproducibility requirement.",
        "recommendation": "Add explicit local environment reproducibility guidance for machine-local boundaries."
      },
      {
        "id": "incomplete-machine-local-boundaries",
        "label": "Incomplete machine-local boundaries",
        "points": 0.13,
        "appliesWhen": "The repository boundaries exist but are not linked from setup/runtime docs.",
        "evidenceRequired": "Cite the partial local environment reproducibility evidence and the specific gap.",
        "recommendation": "Tighten the machine-local boundaries guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-machine-local-boundaries",
        "label": "Unlinked machine-local boundaries evidence",
        "points": 0.06,
        "appliesWhen": "Local environment reproducibility evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local environment reproducibility evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact environment scripts/docs and identify hidden machine assumptions, unowned ports, untracked DB state, or unsafe cleanup.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-local-environment-reproducibility-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
