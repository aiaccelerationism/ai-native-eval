---
name: ai-native-test-command-surface-evaluator
description: Evaluate test command surfaces for AI-native repo maturity. Use when scoring whether lint, typecheck, unit, integration, build, smoke, and E2E commands are scriptable and documented.
---

# AI Native Test Command Surface Evaluator

Evaluate one thing: whether test commands are clear enough for agents to run and cite.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-test-command-surface-evaluator",
  "label": "Test command surface evaluator",
  "version": "0.1.0",
  "dimension": "ci_test_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-test-command-surface-evaluator.children" }]
}
```

## Evidence

Inspect package scripts, test configs, docs, CI commands, smoke commands, and local production/E2E command owners.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating lint, typecheck, unit, integration, build, smoke, and E2E commands.

```ai-native-deduction-groups
[
  {
    "id": "test-command-coverage",
    "label": "Test command coverage",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-test-command-coverage",
        "label": "Missing test command coverage",
        "points": 0.4,
        "appliesWhen": "The repository does not expose project-owned commands for important validation surfaces.",
        "evidenceRequired": "Cite package scripts, CI workflows, test docs, E2E configs, and PR check output that show the missing test command surfaces requirement.",
        "recommendation": "Add explicit test command surfaces guidance for test command coverage."
      },
      {
        "id": "incomplete-test-command-coverage",
        "label": "Incomplete test command coverage",
        "points": 0.2,
        "appliesWhen": "The repository commands exist but miss a key surface such as typecheck, build, smoke, or E2E.",
        "evidenceRequired": "Cite the partial test command surfaces evidence and the specific gap.",
        "recommendation": "Tighten the test command coverage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-test-command-coverage",
        "label": "Unlinked test command coverage evidence",
        "points": 0.1,
        "appliesWhen": "Test command surfaces evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the test command surfaces evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "test-command-documentation",
    "label": "Test command documentation",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-test-command-documentation",
        "label": "Missing test command documentation",
        "points": 0.35,
        "appliesWhen": "The repository test commands are not documented with scope and expected use.",
        "evidenceRequired": "Cite package scripts, CI workflows, test docs, E2E configs, and PR check output that show the missing test command surfaces requirement.",
        "recommendation": "Add explicit test command surfaces guidance for test command documentation."
      },
      {
        "id": "incomplete-test-command-documentation",
        "label": "Incomplete test command documentation",
        "points": 0.18,
        "appliesWhen": "The repository documentation exists but does not explain when to run each command.",
        "evidenceRequired": "Cite the partial test command surfaces evidence and the specific gap.",
        "recommendation": "Tighten the test command documentation guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-test-command-documentation",
        "label": "Unlinked test command documentation evidence",
        "points": 0.09,
        "appliesWhen": "Test command surfaces evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the test command surfaces evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "test-result-actionability",
    "label": "Test result actionability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-test-result-actionability",
        "label": "Missing test result actionability",
        "points": 0.25,
        "appliesWhen": "The repository test commands do not produce actionable output or artifact paths for agents.",
        "evidenceRequired": "Cite package scripts, CI workflows, test docs, E2E configs, and PR check output that show the missing test command surfaces requirement.",
        "recommendation": "Add explicit test command surfaces guidance for test result actionability."
      },
      {
        "id": "incomplete-test-result-actionability",
        "label": "Incomplete test result actionability",
        "points": 0.13,
        "appliesWhen": "The repository output is actionable only for some commands or lacks failure guidance.",
        "evidenceRequired": "Cite the partial test command surfaces evidence and the specific gap.",
        "recommendation": "Tighten the test result actionability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-test-result-actionability",
        "label": "Unlinked test result actionability evidence",
        "points": 0.06,
        "appliesWhen": "Test command surfaces evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the test command surfaces evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact scripts and identify missing or ambiguous command ownership.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-test-command-surface-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
