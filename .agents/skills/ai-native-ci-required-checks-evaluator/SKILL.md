---
name: ai-native-ci-required-checks-evaluator
description: Evaluate CI required checks for AI-native repo maturity. Use when scoring whether branch protection and GitHub Actions enforce meaningful build, lint, typecheck, test, and policy gates.
---

# AI Native CI Required Checks Evaluator

Evaluate one thing: whether CI checks are meaningful, required, and connected to merge safety.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-ci-required-checks-evaluator",
  "label": "CI required checks evaluator",
  "version": "0.1.0",
  "dimension": "ci_test_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-ci-required-checks-evaluator.children" }]
}
```

## Evidence

Inspect `.github/workflows/**`, branch protection docs, required check names, check runs, and policy status workflows.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating branch protection and GitHub Actions gates.

```ai-native-deduction-groups
[
  {
    "id": "required-check-coverage",
    "label": "Required check coverage",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-required-check-coverage",
        "label": "Missing required check coverage",
        "points": 0.4,
        "appliesWhen": "The repository does not define required CI checks for build, lint, typecheck, tests, or policy gates.",
        "evidenceRequired": "Cite GitHub Actions workflows, branch protection docs, PR requirements, package scripts, and policy gates that show the missing CI required checks requirement.",
        "recommendation": "Add explicit CI required checks guidance for required check coverage."
      },
      {
        "id": "incomplete-required-check-coverage",
        "label": "Incomplete required check coverage",
        "points": 0.2,
        "appliesWhen": "The repository defines checks but misses an important required surface.",
        "evidenceRequired": "Cite the partial CI required checks evidence and the specific gap.",
        "recommendation": "Tighten the required check coverage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-required-check-coverage",
        "label": "Unlinked required check coverage evidence",
        "points": 0.1,
        "appliesWhen": "CI required checks evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the CI required checks evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "check-enforcement",
    "label": "Check enforcement",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-check-enforcement",
        "label": "Missing check enforcement",
        "points": 0.35,
        "appliesWhen": "The repository checks exist but are not documented or enforced as merge requirements.",
        "evidenceRequired": "Cite GitHub Actions workflows, branch protection docs, PR requirements, package scripts, and policy gates that show the missing CI required checks requirement.",
        "recommendation": "Add explicit CI required checks guidance for check enforcement."
      },
      {
        "id": "incomplete-check-enforcement",
        "label": "Incomplete check enforcement",
        "points": 0.18,
        "appliesWhen": "The repository enforcement is partial or depends on manual convention.",
        "evidenceRequired": "Cite the partial CI required checks evidence and the specific gap.",
        "recommendation": "Tighten the check enforcement guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-check-enforcement",
        "label": "Unlinked check enforcement evidence",
        "points": 0.09,
        "appliesWhen": "CI required checks evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the CI required checks evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "check-signal-quality",
    "label": "Check signal quality",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-check-signal-quality",
        "label": "Missing check signal quality",
        "points": 0.25,
        "appliesWhen": "The repository required checks do not provide actionable pass/fail signal for agents.",
        "evidenceRequired": "Cite GitHub Actions workflows, branch protection docs, PR requirements, package scripts, and policy gates that show the missing CI required checks requirement.",
        "recommendation": "Add explicit CI required checks guidance for check signal quality."
      },
      {
        "id": "incomplete-check-signal-quality",
        "label": "Incomplete check signal quality",
        "points": 0.13,
        "appliesWhen": "The repository checks pass without proving the intended risk surface.",
        "evidenceRequired": "Cite the partial CI required checks evidence and the specific gap.",
        "recommendation": "Tighten the check signal quality guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-check-signal-quality",
        "label": "Unlinked check signal quality evidence",
        "points": 0.06,
        "appliesWhen": "CI required checks evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the CI required checks evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite workflow files or check records and separate missing live access from missing committed CI config.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-ci-required-checks-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
