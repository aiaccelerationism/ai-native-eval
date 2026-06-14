---
name: ai-native-domain-boundary-evaluator
description: Evaluate domain boundary discipline for AI-native repo maturity. Use when scoring whether generic foundation, product shell, and product-domain work stay separated.
---

# AI Native Domain Boundary Evaluator

Evaluate one thing: whether agents can tell which layer a change belongs to.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-domain-boundary-evaluator",
  "label": "Domain boundary evaluator",
  "version": "0.1.0",
  "dimension": "architecture_boundaries",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-domain-boundary-evaluator.children" }]
}
```

## Evidence

Inspect domain boundary docs, product charters, generic foundation docs, package naming rules, and PRs that move or generalize behavior.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating separation between generic foundation, product shell, and product-domain work.

```ai-native-deduction-groups
[
  {
    "id": "boundary-definition",
    "label": "Boundary definition",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-boundary-definition",
        "label": "Missing boundary definition",
        "points": 0.4,
        "appliesWhen": "The repository does not define generic vs product-domain ownership boundaries.",
        "evidenceRequired": "Cite domain docs, architecture docs, package/module names, PR scope, and governance policies that show the missing domain boundary discipline requirement.",
        "recommendation": "Add explicit domain boundary discipline guidance for boundary definition."
      },
      {
        "id": "incomplete-boundary-definition",
        "label": "Incomplete boundary definition",
        "points": 0.2,
        "appliesWhen": "The repository defines boundaries but leaves naming or directory ownership ambiguous.",
        "evidenceRequired": "Cite the partial domain boundary discipline evidence and the specific gap.",
        "recommendation": "Tighten the boundary definition guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-boundary-definition",
        "label": "Unlinked boundary definition evidence",
        "points": 0.1,
        "appliesWhen": "Domain boundary discipline evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the domain boundary discipline evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "boundary-enforcement",
    "label": "Boundary enforcement",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-boundary-enforcement",
        "label": "Missing boundary enforcement",
        "points": 0.35,
        "appliesWhen": "The repository does not prevent product-specific logic from leaking into reusable foundations.",
        "evidenceRequired": "Cite domain docs, architecture docs, package/module names, PR scope, and governance policies that show the missing domain boundary discipline requirement.",
        "recommendation": "Add explicit domain boundary discipline guidance for boundary enforcement."
      },
      {
        "id": "incomplete-boundary-enforcement",
        "label": "Incomplete boundary enforcement",
        "points": 0.18,
        "appliesWhen": "The repository has drift or exceptions without review guidance.",
        "evidenceRequired": "Cite the partial domain boundary discipline evidence and the specific gap.",
        "recommendation": "Tighten the boundary enforcement guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-boundary-enforcement",
        "label": "Unlinked boundary enforcement evidence",
        "points": 0.09,
        "appliesWhen": "Domain boundary discipline evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the domain boundary discipline evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "boundary-change-control",
    "label": "Boundary change control",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-boundary-change-control",
        "label": "Missing boundary change control",
        "points": 0.25,
        "appliesWhen": "The repository does not require explicit review for boundary changes or genericization.",
        "evidenceRequired": "Cite domain docs, architecture docs, package/module names, PR scope, and governance policies that show the missing domain boundary discipline requirement.",
        "recommendation": "Add explicit domain boundary discipline guidance for boundary change control."
      },
      {
        "id": "incomplete-boundary-change-control",
        "label": "Incomplete boundary change control",
        "points": 0.13,
        "appliesWhen": "The repository change control exists but lacks human gate, PR checklist, or evidence expectations.",
        "evidenceRequired": "Cite the partial domain boundary discipline evidence and the specific gap.",
        "recommendation": "Tighten the boundary change control guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-boundary-change-control",
        "label": "Unlinked boundary change control evidence",
        "points": 0.06,
        "appliesWhen": "Domain boundary discipline evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the domain boundary discipline evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact boundary docs and identify drift, accidental branding, or broad rename risk.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-domain-boundary-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
