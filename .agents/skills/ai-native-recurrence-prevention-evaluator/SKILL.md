---
name: ai-native-recurrence-prevention-evaluator
description: Evaluate recurrence-prevention discipline for AI-native repo maturity. Use when scoring whether AI misses, review misses, and repeated failures become durable tests, skills, docs, or known issues.
---

# AI Native Recurrence Prevention Evaluator

Evaluate one thing: whether repeated mistakes create durable prevention mechanisms.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-recurrence-prevention-evaluator",
  "label": "Recurrence prevention evaluator",
  "version": "0.1.0",
  "dimension": "evidence_discipline",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-recurrence-prevention-evaluator.children" }]
}
```

## Evidence

Inspect issue comments, PR retrospectives, skill updates, known issue cards, eval cases, tests, and decision docs created after misses.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating turning AI misses, review misses, and repeated failures into durable tests, skills, docs, or known issues.

```ai-native-deduction-groups
[
  {
    "id": "miss-capture",
    "label": "Miss capture",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-miss-capture",
        "label": "Missing miss capture",
        "points": 0.4,
        "appliesWhen": "The repository repeated failures or review misses are not captured after correction.",
        "evidenceRequired": "Cite skills, known issue docs, tests, PR retrospectives, review findings, and issue follow-ups that show the missing recurrence prevention requirement.",
        "recommendation": "Add explicit recurrence prevention guidance for miss capture."
      },
      {
        "id": "incomplete-miss-capture",
        "label": "Incomplete miss capture",
        "points": 0.2,
        "appliesWhen": "The repository capture exists but does not describe trigger, impact, and prevention.",
        "evidenceRequired": "Cite the partial recurrence prevention evidence and the specific gap.",
        "recommendation": "Tighten the miss capture guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-miss-capture",
        "label": "Unlinked miss capture evidence",
        "points": 0.1,
        "appliesWhen": "Recurrence prevention evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the recurrence prevention evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "durable-prevention",
    "label": "Durable prevention",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-durable-prevention",
        "label": "Missing durable prevention",
        "points": 0.35,
        "appliesWhen": "The repository fixes do not become tests, skills, docs, lint rules, or known issue guidance.",
        "evidenceRequired": "Cite skills, known issue docs, tests, PR retrospectives, review findings, and issue follow-ups that show the missing recurrence prevention requirement.",
        "recommendation": "Add explicit recurrence prevention guidance for durable prevention."
      },
      {
        "id": "incomplete-durable-prevention",
        "label": "Incomplete durable prevention",
        "points": 0.18,
        "appliesWhen": "The repository prevention exists but is too weak or disconnected from the failure mode.",
        "evidenceRequired": "Cite the partial recurrence prevention evidence and the specific gap.",
        "recommendation": "Tighten the durable prevention guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-durable-prevention",
        "label": "Unlinked durable prevention evidence",
        "points": 0.09,
        "appliesWhen": "Recurrence prevention evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the recurrence prevention evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "feedback-loop",
    "label": "Feedback loop",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-feedback-loop",
        "label": "Missing feedback loop",
        "points": 0.25,
        "appliesWhen": "The repository agents are not instructed to consult or update prevention artifacts during similar work.",
        "evidenceRequired": "Cite skills, known issue docs, tests, PR retrospectives, review findings, and issue follow-ups that show the missing recurrence prevention requirement.",
        "recommendation": "Add explicit recurrence prevention guidance for feedback loop."
      },
      {
        "id": "incomplete-feedback-loop",
        "label": "Incomplete feedback loop",
        "points": 0.13,
        "appliesWhen": "The repository loop exists but lacks clear ownership or update criteria.",
        "evidenceRequired": "Cite the partial recurrence prevention evidence and the specific gap.",
        "recommendation": "Tighten the feedback loop guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-feedback-loop",
        "label": "Unlinked feedback loop evidence",
        "points": 0.06,
        "appliesWhen": "Recurrence prevention evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the recurrence prevention evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact prevention artifacts or explain which repeated class has no durable owner.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-recurrence-prevention-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
