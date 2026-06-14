---
name: ai-native-readme-onboarding-evaluator
description: Evaluate README and first-run onboarding for AI-native repo maturity. Use when scoring whether a new agent can understand purpose, setup, commands, and next steps from the repository entry docs.
---

# AI Native README Onboarding Evaluator

Evaluate one thing: whether the repository entry documentation gives a new agent enough context to start safely.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-readme-onboarding-evaluator",
  "label": "README onboarding evaluator",
  "version": "0.1.0",
  "dimension": "documentation_onboarding",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-readme-onboarding-evaluator.children" }]
}
```

## Evidence

Inspect `README.md`, quickstart docs, repository purpose docs, setup links, and first-run command references.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating repository purpose, setup, commands, and next steps from entry docs.

```ai-native-deduction-groups
[
  {
    "id": "repo-purpose",
    "label": "Repository purpose",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-repo-purpose",
        "label": "Missing repository purpose",
        "points": 0.35,
        "appliesWhen": "The repository README does not explain what the repo is for and what state it is in.",
        "evidenceRequired": "Cite README, docs index, package scripts, AGENTS.md links, and first-run instructions that show the missing README onboarding requirement.",
        "recommendation": "Add explicit README onboarding guidance for repository purpose."
      },
      {
        "id": "incomplete-repo-purpose",
        "label": "Incomplete repository purpose",
        "points": 0.18,
        "appliesWhen": "The repository purpose exists but omits current phase, product boundary, or intended user.",
        "evidenceRequired": "Cite the partial README onboarding evidence and the specific gap.",
        "recommendation": "Tighten the repository purpose guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-repo-purpose",
        "label": "Unlinked repository purpose evidence",
        "points": 0.09,
        "appliesWhen": "README onboarding evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the README onboarding evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "first-run-path",
    "label": "First-run path",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-first-run-path",
        "label": "Missing first-run path",
        "points": 0.4,
        "appliesWhen": "The repository README does not provide a fresh-agent setup and run path.",
        "evidenceRequired": "Cite README, docs index, package scripts, AGENTS.md links, and first-run instructions that show the missing README onboarding requirement.",
        "recommendation": "Add explicit README onboarding guidance for first-run path."
      },
      {
        "id": "incomplete-first-run-path",
        "label": "Incomplete first-run path",
        "points": 0.2,
        "appliesWhen": "The repository first-run path exists but omits prerequisites, install, command, or expected output.",
        "evidenceRequired": "Cite the partial README onboarding evidence and the specific gap.",
        "recommendation": "Tighten the first-run path guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-first-run-path",
        "label": "Unlinked first-run path evidence",
        "points": 0.1,
        "appliesWhen": "README onboarding evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the README onboarding evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "next-step-routing",
    "label": "Next-step routing",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-next-step-routing",
        "label": "Missing next-step routing",
        "points": 0.25,
        "appliesWhen": "The repository README does not route agents to task, docs, skills, or contribution next steps.",
        "evidenceRequired": "Cite README, docs index, package scripts, AGENTS.md links, and first-run instructions that show the missing README onboarding requirement.",
        "recommendation": "Add explicit README onboarding guidance for next-step routing."
      },
      {
        "id": "incomplete-next-step-routing",
        "label": "Incomplete next-step routing",
        "points": 0.13,
        "appliesWhen": "The repository routing exists but is incomplete or stale.",
        "evidenceRequired": "Cite the partial README onboarding evidence and the specific gap.",
        "recommendation": "Tighten the next-step routing guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-next-step-routing",
        "label": "Unlinked next-step routing evidence",
        "points": 0.06,
        "appliesWhen": "README onboarding evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the README onboarding evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact docs and explain what an agent can or cannot do from the README alone.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-readme-onboarding-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
