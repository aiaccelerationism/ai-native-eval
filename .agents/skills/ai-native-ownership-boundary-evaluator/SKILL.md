---
name: ai-native-ownership-boundary-evaluator
description: Evaluate ownership boundaries for AI-native repo maturity. Use when scoring package ownership, public exports, component layers, service boundaries, and review ownership rules.
---

# AI Native Ownership Boundary Evaluator

Evaluate one thing: whether ownership boundaries keep agent changes bounded and reviewable.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-ownership-boundary-evaluator",
  "label": "Ownership boundary evaluator",
  "version": "0.1.0",
  "dimension": "architecture_boundaries",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-ownership-boundary-evaluator.children" }]
}
```

## Evidence

Inspect architecture docs, package boundaries, public export rules, component layer docs, reviewer ownership docs, and PRs touching shared packages.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating package ownership, public exports, component layers, service boundaries, and review ownership rules.

```ai-native-deduction-groups
[
  {
    "id": "ownership-definition",
    "label": "Ownership definition",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-ownership-definition",
        "label": "Missing ownership definition",
        "points": 0.4,
        "appliesWhen": "The repository does not define ownership boundaries for packages, components, services, or public exports.",
        "evidenceRequired": "Cite architecture docs, package exports, module boundaries, CODEOWNERS, PR docs, and source layout that show the missing ownership boundaries requirement.",
        "recommendation": "Add explicit ownership boundaries guidance for ownership definition."
      },
      {
        "id": "incomplete-ownership-definition",
        "label": "Incomplete ownership definition",
        "points": 0.2,
        "appliesWhen": "The repository boundaries exist but are incomplete or ambiguous.",
        "evidenceRequired": "Cite the partial ownership boundaries evidence and the specific gap.",
        "recommendation": "Tighten the ownership definition guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-ownership-definition",
        "label": "Unlinked ownership definition evidence",
        "points": 0.1,
        "appliesWhen": "Ownership boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the ownership boundaries evidence from the workflow where agents need it."
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
        "appliesWhen": "The repository code structure or exports bypass documented ownership boundaries.",
        "evidenceRequired": "Cite architecture docs, package exports, module boundaries, CODEOWNERS, PR docs, and source layout that show the missing ownership boundaries requirement.",
        "recommendation": "Add explicit ownership boundaries guidance for boundary enforcement."
      },
      {
        "id": "incomplete-boundary-enforcement",
        "label": "Incomplete boundary enforcement",
        "points": 0.18,
        "appliesWhen": "The repository enforcement exists but allows misleading shared abstractions or unused public APIs.",
        "evidenceRequired": "Cite the partial ownership boundaries evidence and the specific gap.",
        "recommendation": "Tighten the boundary enforcement guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-boundary-enforcement",
        "label": "Unlinked boundary enforcement evidence",
        "points": 0.09,
        "appliesWhen": "Ownership boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the ownership boundaries evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "review-ownership",
    "label": "Review ownership",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-review-ownership",
        "label": "Missing review ownership",
        "points": 0.25,
        "appliesWhen": "The repository does not define review expectations for ownership boundary changes.",
        "evidenceRequired": "Cite architecture docs, package exports, module boundaries, CODEOWNERS, PR docs, and source layout that show the missing ownership boundaries requirement.",
        "recommendation": "Add explicit ownership boundaries guidance for review ownership."
      },
      {
        "id": "incomplete-review-ownership",
        "label": "Incomplete review ownership",
        "points": 0.13,
        "appliesWhen": "The repository review rules exist but omit high-risk ownership changes.",
        "evidenceRequired": "Cite the partial ownership boundaries evidence and the specific gap.",
        "recommendation": "Tighten the review ownership guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-review-ownership",
        "label": "Unlinked review ownership evidence",
        "points": 0.06,
        "appliesWhen": "Ownership boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the ownership boundaries evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact docs or package paths and identify ambiguous or unenforced ownership.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-ownership-boundary-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
