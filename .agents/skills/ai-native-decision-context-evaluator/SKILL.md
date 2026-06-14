---
name: ai-native-decision-context-evaluator
description: Evaluate decision context documentation for AI-native repo maturity. Use when scoring ADRs, charters, task specs, phase boundaries, and source-of-truth docs.
---

# AI Native Decision Context Evaluator

Evaluate one thing: whether agents can find the decisions that explain why the repo is shaped this way.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-decision-context-evaluator",
  "label": "Decision context evaluator",
  "version": "0.1.0",
  "dimension": "documentation_onboarding",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-decision-context-evaluator.children" }]
}
```

## Evidence

Inspect architecture charters, ADRs, task specs, product/domain charters, phase docs, and non-goal docs.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating ADRs, charters, task specs, phase boundaries, and source-of-truth docs.

```ai-native-deduction-groups
[
  {
    "id": "source-of-truth-clarity",
    "label": "Source-of-truth clarity",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-source-of-truth-clarity",
        "label": "Missing source-of-truth clarity",
        "points": 0.4,
        "appliesWhen": "The repository does not identify current decision sources for agents.",
        "evidenceRequired": "Cite docs, ADRs, issues, PR descriptions, task specs, and planning notes that show the missing decision context requirement.",
        "recommendation": "Add explicit decision context guidance for source-of-truth clarity."
      },
      {
        "id": "incomplete-source-of-truth-clarity",
        "label": "Incomplete source-of-truth clarity",
        "points": 0.2,
        "appliesWhen": "The repository sources exist but conflict or are not prioritized.",
        "evidenceRequired": "Cite the partial decision context evidence and the specific gap.",
        "recommendation": "Tighten the source-of-truth clarity guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-source-of-truth-clarity",
        "label": "Unlinked source-of-truth clarity evidence",
        "points": 0.1,
        "appliesWhen": "Decision context evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the decision context evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "decision-rationale",
    "label": "Decision rationale",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-decision-rationale",
        "label": "Missing decision rationale",
        "points": 0.35,
        "appliesWhen": "The repository does not preserve rationale, alternatives, or non-goals for important decisions.",
        "evidenceRequired": "Cite docs, ADRs, issues, PR descriptions, task specs, and planning notes that show the missing decision context requirement.",
        "recommendation": "Add explicit decision context guidance for decision rationale."
      },
      {
        "id": "incomplete-decision-rationale",
        "label": "Incomplete decision rationale",
        "points": 0.18,
        "appliesWhen": "The repository rationale is present but too thin for future agents to apply.",
        "evidenceRequired": "Cite the partial decision context evidence and the specific gap.",
        "recommendation": "Tighten the decision rationale guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-decision-rationale",
        "label": "Unlinked decision rationale evidence",
        "points": 0.09,
        "appliesWhen": "Decision context evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the decision context evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "decision-linkage",
    "label": "Decision linkage",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-decision-linkage",
        "label": "Missing decision linkage",
        "points": 0.25,
        "appliesWhen": "The repository does not link decisions to issues, PRs, implementation scope, or review gates.",
        "evidenceRequired": "Cite docs, ADRs, issues, PR descriptions, task specs, and planning notes that show the missing decision context requirement.",
        "recommendation": "Add explicit decision context guidance for decision linkage."
      },
      {
        "id": "incomplete-decision-linkage",
        "label": "Incomplete decision linkage",
        "points": 0.13,
        "appliesWhen": "The repository links exist but are incomplete or one-way only.",
        "evidenceRequired": "Cite the partial decision context evidence and the specific gap.",
        "recommendation": "Tighten the decision linkage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-decision-linkage",
        "label": "Unlinked decision linkage evidence",
        "points": 0.06,
        "appliesWhen": "Decision context evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the decision context evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact decision docs and identify missing, stale, or ambiguous decision surfaces.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-decision-context-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
