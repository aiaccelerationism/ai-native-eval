---
name: ai-native-known-issue-awareness-evaluator
description: Evaluate known-issue awareness for AI-native repo maturity. Use when scoring whether recurring failures have searchable cards and agents are instructed to consult them.
---

# AI Native Known Issue Awareness Evaluator

Evaluate one thing: whether recurring problem classes are discoverable before agents repeat failed work.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-known-issue-awareness-evaluator",
  "label": "Known issue awareness evaluator",
  "version": "0.1.0",
  "dimension": "evidence_discipline",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-known-issue-awareness-evaluator.children" }]
}
```

## Evidence

Inspect known issue indexes, issue cards, skill routing to known issues, PR references to known issues, and recurrence records.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating recurring failures, known-risk cards, searchable docs, and agent instructions to consult them.

```ai-native-deduction-groups
[
  {
    "id": "known-issue-capture",
    "label": "Known issue capture",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-known-issue-capture",
        "label": "Missing known issue capture",
        "points": 0.4,
        "appliesWhen": "The repository recurring failures are not captured in durable known-issue docs or skills.",
        "evidenceRequired": "Cite known issue docs, skills, troubleshooting docs, PR fixes, and repeated failure notes that show the missing known issue awareness requirement.",
        "recommendation": "Add explicit known issue awareness guidance for known issue capture."
      },
      {
        "id": "incomplete-known-issue-capture",
        "label": "Incomplete known issue capture",
        "points": 0.2,
        "appliesWhen": "The repository known issues are captured only partially or after-the-fact.",
        "evidenceRequired": "Cite the partial known issue awareness evidence and the specific gap.",
        "recommendation": "Tighten the known issue capture guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-known-issue-capture",
        "label": "Unlinked known issue capture evidence",
        "points": 0.1,
        "appliesWhen": "Known issue awareness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the known issue awareness evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "discoverability",
    "label": "Known issue discoverability",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-discoverability",
        "label": "Missing known issue discoverability",
        "points": 0.35,
        "appliesWhen": "The repository agents are not instructed where or when to check known issues.",
        "evidenceRequired": "Cite known issue docs, skills, troubleshooting docs, PR fixes, and repeated failure notes that show the missing known issue awareness requirement.",
        "recommendation": "Add explicit known issue awareness guidance for known issue discoverability."
      },
      {
        "id": "incomplete-discoverability",
        "label": "Incomplete known issue discoverability",
        "points": 0.18,
        "appliesWhen": "The repository known issue docs exist but are hard to find from relevant workflows.",
        "evidenceRequired": "Cite the partial known issue awareness evidence and the specific gap.",
        "recommendation": "Tighten the known issue discoverability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-discoverability",
        "label": "Unlinked known issue discoverability evidence",
        "points": 0.09,
        "appliesWhen": "Known issue awareness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the known issue awareness evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "prevention-linkage",
    "label": "Prevention linkage",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-prevention-linkage",
        "label": "Missing prevention linkage",
        "points": 0.25,
        "appliesWhen": "The repository known issues do not link to tests, fixes, or recurrence-prevention actions.",
        "evidenceRequired": "Cite known issue docs, skills, troubleshooting docs, PR fixes, and repeated failure notes that show the missing known issue awareness requirement.",
        "recommendation": "Add explicit known issue awareness guidance for prevention linkage."
      },
      {
        "id": "incomplete-prevention-linkage",
        "label": "Incomplete prevention linkage",
        "points": 0.13,
        "appliesWhen": "The repository linkage exists but is incomplete or stale.",
        "evidenceRequired": "Cite the partial known issue awareness evidence and the specific gap.",
        "recommendation": "Tighten the prevention linkage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-prevention-linkage",
        "label": "Unlinked prevention linkage evidence",
        "points": 0.06,
        "appliesWhen": "Known issue awareness evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the known issue awareness evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact known issue docs and identify recurring failures with no durable lookup surface.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-known-issue-awareness-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
