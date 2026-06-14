---
name: ai-native-visual-evidence-evaluator
description: Evaluate visual evidence for AI-native repo maturity. Use when scoring whether screenshots, videos, traces, and browser verification prove visible behavior.
---

# AI Native Visual Evidence Evaluator

Evaluate one thing: whether visible behavior can be inspected through visual artifacts.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-visual-evidence-evaluator",
  "label": "Visual evidence evaluator",
  "version": "0.1.0",
  "dimension": "product_ux_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-visual-evidence-evaluator.children" }]
}
```

## Evidence

Inspect screenshots, videos, browser traces, visual QA reports, mock comparisons, PR evidence, and linked artifact paths.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating screenshots, videos, traces, and browser verification for visible behavior.

```ai-native-deduction-groups
[
  {
    "id": "visual-proof-presence",
    "label": "Visual proof presence",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-visual-proof-presence",
        "label": "Missing visual proof presence",
        "points": 0.4,
        "appliesWhen": "The repository visible changes lack screenshots, videos, traces, or browser verification.",
        "evidenceRequired": "Cite screenshots, videos, Playwright traces, browser reports, PR artifacts, and visual QA docs that show the missing visual evidence requirement.",
        "recommendation": "Add explicit visual evidence guidance for visual proof presence."
      },
      {
        "id": "incomplete-visual-proof-presence",
        "label": "Incomplete visual proof presence",
        "points": 0.2,
        "appliesWhen": "The repository visual proof exists only for some affected routes or states.",
        "evidenceRequired": "Cite the partial visual evidence evidence and the specific gap.",
        "recommendation": "Tighten the visual proof presence guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-visual-proof-presence",
        "label": "Unlinked visual proof presence evidence",
        "points": 0.1,
        "appliesWhen": "Visual evidence evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the visual evidence evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "visual-proof-quality",
    "label": "Visual proof quality",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-visual-proof-quality",
        "label": "Missing visual proof quality",
        "points": 0.35,
        "appliesWhen": "The repository visual artifacts are not inspectable enough to prove behavior or layout.",
        "evidenceRequired": "Cite screenshots, videos, Playwright traces, browser reports, PR artifacts, and visual QA docs that show the missing visual evidence requirement.",
        "recommendation": "Add explicit visual evidence guidance for visual proof quality."
      },
      {
        "id": "incomplete-visual-proof-quality",
        "label": "Incomplete visual proof quality",
        "points": 0.18,
        "appliesWhen": "The repository artifacts omit viewport, route, state, timestamp, or expected comparison.",
        "evidenceRequired": "Cite the partial visual evidence evidence and the specific gap.",
        "recommendation": "Tighten the visual proof quality guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-visual-proof-quality",
        "label": "Unlinked visual proof quality evidence",
        "points": 0.09,
        "appliesWhen": "Visual evidence evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the visual evidence evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "visual-proof-linkage",
    "label": "Visual proof linkage",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-visual-proof-linkage",
        "label": "Missing visual proof linkage",
        "points": 0.25,
        "appliesWhen": "The repository visual evidence is not linked to PRs, issues, reports, or acceptance criteria.",
        "evidenceRequired": "Cite screenshots, videos, Playwright traces, browser reports, PR artifacts, and visual QA docs that show the missing visual evidence requirement.",
        "recommendation": "Add explicit visual evidence guidance for visual proof linkage."
      },
      {
        "id": "incomplete-visual-proof-linkage",
        "label": "Incomplete visual proof linkage",
        "points": 0.13,
        "appliesWhen": "The repository links exist but are incomplete or hard to follow.",
        "evidenceRequired": "Cite the partial visual evidence evidence and the specific gap.",
        "recommendation": "Tighten the visual proof linkage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-visual-proof-linkage",
        "label": "Unlinked visual proof linkage evidence",
        "points": 0.06,
        "appliesWhen": "Visual evidence evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the visual evidence evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact visual artifacts and identify missing, stale, private, or unlinked evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-visual-evidence-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
