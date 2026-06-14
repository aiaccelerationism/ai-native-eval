---
name: ai-native-product-design-readiness-evaluator
description: Evaluate product design readiness for AI-native repo maturity. Use when scoring whether visible product work has goal, audience, user jobs, objects, states, non-goals, and checkpoint evidence.
---

# AI Native Product Design Readiness Evaluator

Evaluate one thing: whether product work is defined before UX mock or implementation.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-product-design-readiness-evaluator",
  "label": "Product design readiness evaluator",
  "version": "0.1.0",
  "dimension": "product_ux_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-product-design-readiness-evaluator.children" }]
}
```

## Evidence

Inspect product briefs, task specs, product design docs, object/state definitions, non-goals, flow diagrams, and human checkpoint records.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating goal, audience, user jobs, object model, states, non-goals, and checkpoints before visible work.

```ai-native-deduction-groups
[
  {
    "id": "product-intent",
    "label": "Product intent",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-product-intent",
        "label": "Missing product intent",
        "points": 0.4,
        "appliesWhen": "The repository visible work lacks goal, audience, user jobs, or product object model.",
        "evidenceRequired": "Cite product docs, issue specs, mock briefs, UX plans, screenshots, and review notes that show the missing product design readiness requirement.",
        "recommendation": "Add explicit product design readiness guidance for product intent."
      },
      {
        "id": "incomplete-product-intent",
        "label": "Incomplete product intent",
        "points": 0.2,
        "appliesWhen": "The repository intent exists but leaves important user or object assumptions unclear.",
        "evidenceRequired": "Cite the partial product design readiness evidence and the specific gap.",
        "recommendation": "Tighten the product intent guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-product-intent",
        "label": "Unlinked product intent evidence",
        "points": 0.1,
        "appliesWhen": "Product design readiness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the product design readiness evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "state-and-flow-coverage",
    "label": "State and flow coverage",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-state-and-flow-coverage",
        "label": "Missing state and flow coverage",
        "points": 0.35,
        "appliesWhen": "The repository design input does not cover critical states, workflows, or edge cases.",
        "evidenceRequired": "Cite product docs, issue specs, mock briefs, UX plans, screenshots, and review notes that show the missing product design readiness requirement.",
        "recommendation": "Add explicit product design readiness guidance for state and flow coverage."
      },
      {
        "id": "incomplete-state-and-flow-coverage",
        "label": "Incomplete state and flow coverage",
        "points": 0.18,
        "appliesWhen": "The repository state coverage exists but omits empty/error/loading/permission states.",
        "evidenceRequired": "Cite the partial product design readiness evidence and the specific gap.",
        "recommendation": "Tighten the state and flow coverage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-state-and-flow-coverage",
        "label": "Unlinked state and flow coverage evidence",
        "points": 0.09,
        "appliesWhen": "Product design readiness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the product design readiness evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "checkpoint-readiness",
    "label": "Checkpoint readiness",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-checkpoint-readiness",
        "label": "Missing checkpoint readiness",
        "points": 0.25,
        "appliesWhen": "The repository does not define review checkpoints or non-goals before implementation.",
        "evidenceRequired": "Cite product docs, issue specs, mock briefs, UX plans, screenshots, and review notes that show the missing product design readiness requirement.",
        "recommendation": "Add explicit product design readiness guidance for checkpoint readiness."
      },
      {
        "id": "incomplete-checkpoint-readiness",
        "label": "Incomplete checkpoint readiness",
        "points": 0.13,
        "appliesWhen": "The repository checkpoints exist but are not linked to issue/PR evidence.",
        "evidenceRequired": "Cite the partial product design readiness evidence and the specific gap.",
        "recommendation": "Tighten the checkpoint readiness guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-checkpoint-readiness",
        "label": "Unlinked checkpoint readiness evidence",
        "points": 0.06,
        "appliesWhen": "Product design readiness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the product design readiness evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact product design artifacts and identify missing audience, jobs, objects, states, non-goals, or checkpoints.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-product-design-readiness-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
