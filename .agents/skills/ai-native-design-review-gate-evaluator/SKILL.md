---
name: ai-native-design-review-gate-evaluator
description: Evaluate design review gates for AI-native repo maturity. Use when scoring whether product/UX work receives PASS/WARN/BLOCK review before implementation or merge.
---

# AI Native Design Review Gate Evaluator

Evaluate one thing: whether design review acts as a real gate for visible work.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-design-review-gate-evaluator",
  "label": "Design review gate evaluator",
  "version": "0.1.0",
  "dimension": "product_ux_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-design-review-gate-evaluator.children" }]
}
```

## Evidence

Inspect design reviewer skill instructions, review comments, verdict markers, blocker handling, and PR/task evidence for design approval.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating PASS/WARN/BLOCK review before visible product implementation or merge.

```ai-native-deduction-groups
[
  {
    "id": "review-gate-presence",
    "label": "Design review gate presence",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-review-gate-presence",
        "label": "Missing design review gate presence",
        "points": 0.4,
        "appliesWhen": "The repository does not require design review for visible product or UX changes.",
        "evidenceRequired": "Cite design review docs, PR templates, issue specs, mock routes, review comments, and screenshots that show the missing design review gates requirement.",
        "recommendation": "Add explicit design review gates guidance for design review gate presence."
      },
      {
        "id": "incomplete-review-gate-presence",
        "label": "Incomplete design review gate presence",
        "points": 0.2,
        "appliesWhen": "The repository requires review only for some visible change types.",
        "evidenceRequired": "Cite the partial design review gates evidence and the specific gap.",
        "recommendation": "Tighten the design review gate presence guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-review-gate-presence",
        "label": "Unlinked design review gate presence evidence",
        "points": 0.1,
        "appliesWhen": "Design review gates evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the design review gates evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "verdict-contract",
    "label": "Verdict contract",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-verdict-contract",
        "label": "Missing verdict contract",
        "points": 0.35,
        "appliesWhen": "The repository does not define PASS/WARN/BLOCK or equivalent design review outcomes.",
        "evidenceRequired": "Cite design review docs, PR templates, issue specs, mock routes, review comments, and screenshots that show the missing design review gates requirement.",
        "recommendation": "Add explicit design review gates guidance for verdict contract."
      },
      {
        "id": "incomplete-verdict-contract",
        "label": "Incomplete verdict contract",
        "points": 0.18,
        "appliesWhen": "The repository verdicts exist but merge implications are unclear.",
        "evidenceRequired": "Cite the partial design review gates evidence and the specific gap.",
        "recommendation": "Tighten the verdict contract guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-verdict-contract",
        "label": "Unlinked verdict contract evidence",
        "points": 0.09,
        "appliesWhen": "Design review gates evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the design review gates evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "review-evidence",
    "label": "Review evidence",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-review-evidence",
        "label": "Missing review evidence",
        "points": 0.25,
        "appliesWhen": "The repository does not preserve design review artifacts or link them to PR/issue scope.",
        "evidenceRequired": "Cite design review docs, PR templates, issue specs, mock routes, review comments, and screenshots that show the missing design review gates requirement.",
        "recommendation": "Add explicit design review gates guidance for review evidence."
      },
      {
        "id": "incomplete-review-evidence",
        "label": "Incomplete review evidence",
        "points": 0.13,
        "appliesWhen": "The repository review artifacts exist but are not easy to inspect or reproduce.",
        "evidenceRequired": "Cite the partial design review gates evidence and the specific gap.",
        "recommendation": "Tighten the review evidence guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-review-evidence",
        "label": "Unlinked review evidence evidence",
        "points": 0.06,
        "appliesWhen": "Design review gates evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the design review gates evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact review evidence and identify missing or bypassed design gates.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-design-review-gate-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
