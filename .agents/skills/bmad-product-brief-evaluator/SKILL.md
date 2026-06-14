---
name: bmad-product-brief-evaluator
description: Evaluate BMAD product brief evidence. Use when scoring whether early product intent is captured with problem, audience, value, scope, non-goals, and decision context.
---

# BMAD Product Brief Evaluator

Evaluate one thing: product brief quality.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-product-brief-evaluator",
  "label": "BMAD product brief evaluator",
  "version": "0.1.0",
  "dimension": "bmad_analysis",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-product-brief-evaluator.children" }]
}
```

## Evidence

Inspect product briefs, PRFAQ-style documents, project charters, README product sections, decision docs, and issue specs.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating product brief quality.

```ai-native-deduction-groups
[
  {
    "id": "brief-existence",
    "label": "Product brief existence",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-product-brief",
        "label": "Missing product brief",
        "points": 0.3,
        "appliesWhen": "No product brief or equivalent product intent artifact is present.",
        "evidenceRequired": "Cite repo artifacts that prove the product brief quality gap.",
        "recommendation": "Add a product brief that captures problem, audience, value, and scope."
      },
      {
        "id": "incomplete-brief-existence",
        "label": "Incomplete product brief existence",
        "points": 0.15,
        "appliesWhen": "Product brief existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial product brief quality evidence and the specific gap.",
        "recommendation": "Add a product brief that captures problem, audience, value, and scope."
      }
    ]
  },
  {
    "id": "brief-content",
    "label": "Product brief content",
    "budget": 0.45,
    "deductions": [
      {
        "id": "incomplete-product-brief",
        "label": "Incomplete product brief",
        "points": 0.45,
        "appliesWhen": "A product brief exists but omits important problem, audience, value, scope, non-goal, or risk context.",
        "evidenceRequired": "Cite repo artifacts that prove the product brief quality gap.",
        "recommendation": "Tighten the product brief until a later PRD or story can preserve the product intent."
      },
      {
        "id": "incomplete-brief-content",
        "label": "Incomplete product brief content",
        "points": 0.23,
        "appliesWhen": "Product brief content evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial product brief quality evidence and the specific gap.",
        "recommendation": "Tighten the product brief until a later PRD or story can preserve the product intent."
      }
    ]
  },
  {
    "id": "brief-traceability",
    "label": "Product brief traceability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "unlinked-product-brief",
        "label": "Unlinked product brief",
        "points": 0.25,
        "appliesWhen": "The product brief is not linked from planning, PRD, issue, or decision artifacts.",
        "evidenceRequired": "Cite repo artifacts that prove the product brief quality gap.",
        "recommendation": "Link the product brief from downstream planning and implementation artifacts."
      },
      {
        "id": "incomplete-brief-traceability",
        "label": "Incomplete product brief traceability",
        "points": 0.13,
        "appliesWhen": "Product brief traceability evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial product brief quality evidence and the specific gap.",
        "recommendation": "Link the product brief from downstream planning and implementation artifacts."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact artifact paths and distinguish missing brief evidence from incomplete brief content.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-product-brief-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
