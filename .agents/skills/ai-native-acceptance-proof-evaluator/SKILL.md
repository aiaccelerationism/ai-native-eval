---
name: ai-native-acceptance-proof-evaluator
description: Evaluate acceptance proof for AI-native repo maturity. Use when scoring whether completed work has evidence tied to acceptance criteria rather than only code changes.
---

# AI Native Acceptance Proof Evaluator

Evaluate one thing: whether claims of completion are backed by acceptance proof.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-acceptance-proof-evaluator",
  "label": "Acceptance proof evaluator",
  "version": "0.1.0",
  "dimension": "evidence_discipline",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-acceptance-proof-evaluator.children" }]
}
```

## Evidence

Inspect task specs, acceptance criteria, PR evidence sections, command outputs, screenshots, traces, videos, and report links.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating completed work evidence tied to acceptance criteria.

```ai-native-deduction-groups
[
  {
    "id": "acceptance-criteria-linkage",
    "label": "Acceptance criteria linkage",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-acceptance-criteria-linkage",
        "label": "Missing acceptance criteria linkage",
        "points": 0.4,
        "appliesWhen": "The repository does not link completed work to explicit acceptance criteria.",
        "evidenceRequired": "Cite task specs, PR descriptions, issue acceptance criteria, test output, screenshots, traces, and review notes that show the missing acceptance proof requirement.",
        "recommendation": "Add explicit acceptance proof guidance for acceptance criteria linkage."
      },
      {
        "id": "incomplete-acceptance-criteria-linkage",
        "label": "Incomplete acceptance criteria linkage",
        "points": 0.2,
        "appliesWhen": "The repository links only some completed work to acceptance criteria.",
        "evidenceRequired": "Cite the partial acceptance proof evidence and the specific gap.",
        "recommendation": "Tighten the acceptance criteria linkage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-acceptance-criteria-linkage",
        "label": "Unlinked acceptance criteria linkage evidence",
        "points": 0.1,
        "appliesWhen": "Acceptance proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the acceptance proof evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "proof-execution-quality",
    "label": "Proof execution quality",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-proof-execution-quality",
        "label": "Missing proof execution quality",
        "points": 0.35,
        "appliesWhen": "The repository does not provide executed proof such as tests, screenshots, traces, or logs.",
        "evidenceRequired": "Cite task specs, PR descriptions, issue acceptance criteria, test output, screenshots, traces, and review notes that show the missing acceptance proof requirement.",
        "recommendation": "Add explicit acceptance proof guidance for proof execution quality."
      },
      {
        "id": "incomplete-proof-execution-quality",
        "label": "Incomplete proof execution quality",
        "points": 0.18,
        "appliesWhen": "The repository provides proof but omits command output, artifact paths, or result interpretation.",
        "evidenceRequired": "Cite the partial acceptance proof evidence and the specific gap.",
        "recommendation": "Tighten the proof execution quality guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-proof-execution-quality",
        "label": "Unlinked proof execution quality evidence",
        "points": 0.09,
        "appliesWhen": "Acceptance proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the acceptance proof evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "proof-reviewability",
    "label": "Proof reviewability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-proof-reviewability",
        "label": "Missing proof reviewability",
        "points": 0.25,
        "appliesWhen": "The repository does not make the acceptance proof reviewable by another agent or human.",
        "evidenceRequired": "Cite task specs, PR descriptions, issue acceptance criteria, test output, screenshots, traces, and review notes that show the missing acceptance proof requirement.",
        "recommendation": "Add explicit acceptance proof guidance for proof reviewability."
      },
      {
        "id": "incomplete-proof-reviewability",
        "label": "Incomplete proof reviewability",
        "points": 0.13,
        "appliesWhen": "The repository stores proof in chat only or leaves artifacts hard to find.",
        "evidenceRequired": "Cite the partial acceptance proof evidence and the specific gap.",
        "recommendation": "Tighten the proof reviewability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-proof-reviewability",
        "label": "Unlinked proof reviewability evidence",
        "points": 0.06,
        "appliesWhen": "Acceptance proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the acceptance proof evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact criteria and proof artifacts, and separate not-run evidence from failed evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-acceptance-proof-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
