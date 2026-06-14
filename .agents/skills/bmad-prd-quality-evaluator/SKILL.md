---
name: bmad-prd-quality-evaluator
description: Evaluate BMAD PRD quality. Use when scoring whether requirements are complete enough to plan and validate implementation work.
---

# BMAD PRD Quality Evaluator

Evaluate one thing: PRD quality.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-prd-quality-evaluator",
  "label": "BMAD PRD quality evaluator",
  "version": "0.1.0",
  "dimension": "bmad_planning",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-prd-quality-evaluator.children" }]
}
```

## Evidence

Inspect PRDs, requirements docs, issue specs, validation checklists, UX handoff docs, and planning artifacts.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating PRD quality.

```ai-native-deduction-groups
[
  {
    "id": "prd-existence",
    "label": "PRD existence",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-prd",
        "label": "Missing PRD",
        "points": 0.25,
        "appliesWhen": "No PRD or equivalent requirements artifact is present.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Create a PRD or equivalent requirements document before implementation-heavy work."
      },
      {
        "id": "incomplete-prd-existence",
        "label": "Incomplete prd existence",
        "points": 0.13,
        "appliesWhen": "PRD existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Create a PRD or equivalent requirements document before implementation-heavy work."
      }
    ]
  },
  {
    "id": "prd-requirements",
    "label": "PRD requirements quality",
    "budget": 0.45,
    "deductions": [
      {
        "id": "incomplete-prd-requirements",
        "label": "Incomplete PRD requirements",
        "points": 0.45,
        "appliesWhen": "The PRD lacks clear goals, users, requirements, acceptance criteria, non-goals, dependencies, or risks.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Add requirements, acceptance criteria, non-goals, dependencies, and risks to the PRD."
      },
      {
        "id": "incomplete-prd-requirements",
        "label": "Incomplete prd requirements quality",
        "points": 0.23,
        "appliesWhen": "PRD requirements quality evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Add requirements, acceptance criteria, non-goals, dependencies, and risks to the PRD."
      }
    ]
  },
  {
    "id": "prd-validation",
    "label": "PRD validation",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-prd-validation",
        "label": "Missing PRD validation",
        "points": 0.3,
        "appliesWhen": "There is no evidence that the PRD was validated before solutioning or implementation.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Add a PRD validation pass or readiness checklist before implementation."
      },
      {
        "id": "incomplete-prd-validation",
        "label": "Incomplete prd validation",
        "points": 0.15,
        "appliesWhen": "PRD validation evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Add a PRD validation pass or readiness checklist before implementation."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite the PRD source and the concrete missing requirement or validation surface.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-prd-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
