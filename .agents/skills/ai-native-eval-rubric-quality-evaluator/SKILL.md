---
name: ai-native-eval-rubric-quality-evaluator
description: Evaluate whether AI Native Eval leaf evaluator rubrics are concrete, complete, non-overlapping, and repairable. Use only for evaluator-system self-evaluation.
---

# AI Native Eval Rubric Quality Evaluator

Evaluate one thing: whether evaluator rubrics are trustworthy scoring instruments rather than subjective review prose.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-rubric-quality-evaluator",
  "label": "Rubric quality evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-eval-rubric-quality-evaluator.children" }]
}
```

## Evidence

Inspect evaluator `SKILL.md` files, `ai-native-deduction-groups` fences, folder validation tests, report examples, self-evaluation outputs, and any docs explaining rubric design.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating whether evaluator rubrics are specific, complete, and repair-oriented.

```ai-native-deduction-groups
[
  {
    "id": "rubric-operability",
    "label": "Rubric operability",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-rubric-operability",
        "label": "Missing rubric operability",
        "points": 0.35,
        "appliesWhen": "Leaf evaluators lack structured deduction groups or rely on subjective scores.",
        "evidenceRequired": "Cite evaluator SKILL.md files or outputs showing missing deduction groups, direct scoring, or subjective score assignment.",
        "recommendation": "Convert leaf scoring into concrete deduction groups with evidence requirements and deterministic budgets."
      },
      {
        "id": "incomplete-rubric-operability",
        "label": "Incomplete rubric operability",
        "points": 0.18,
        "appliesWhen": "Deduction groups exist but some deductions are vague, hard to judge, or not tied to repairable evidence.",
        "evidenceRequired": "Cite specific deduction ids or rubric text that is too abstract or not actionable.",
        "recommendation": "Rewrite vague deductions so an evaluator can decide applies/not applies from cited evidence."
      },
      {
        "id": "unlinked-rubric-operability-proof",
        "label": "Unlinked rubric operability proof",
        "points": 0.09,
        "appliesWhen": "Rubrics exist but tests or self-evaluation artifacts do not prove they are used by actual folder outputs.",
        "evidenceRequired": "Cite the rubric and the missing or partial validation/report evidence.",
        "recommendation": "Add fixtures or self-eval outputs that exercise the rubric in a rendered report."
      }
    ]
  },
  {
    "id": "deduction-budget-completeness",
    "label": "Deduction budget completeness",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-budget-completeness",
        "label": "Missing budget completeness",
        "points": 0.35,
        "appliesWhen": "Rubric groups can leave fallback points when the required capability is entirely absent.",
        "evidenceRequired": "Cite deduction groups whose deductions cannot consume the full group budget.",
        "recommendation": "Add full-missing deductions that can consume the full group budget."
      },
      {
        "id": "incomplete-budget-completeness",
        "label": "Incomplete budget completeness",
        "points": 0.18,
        "appliesWhen": "Most groups can deduct the full group budget, but coverage is uneven or not enforced for every leaf.",
        "evidenceRequired": "Cite validation tests or specific rubric groups that only partially prove budget completeness.",
        "recommendation": "Extend validation and rubric review until every leaf group has full-missing coverage."
      },
      {
        "id": "overlapping-budget-risk",
        "label": "Overlapping budget risk",
        "points": 0.09,
        "appliesWhen": "Deductions can double-penalize the same failure without a clear group cap or boundary.",
        "evidenceRequired": "Cite overlapping deductions or missing guidance that could cause duplicate penalties.",
        "recommendation": "Clarify group boundaries and use capped groups for same-cause failures."
      }
    ]
  },
  {
    "id": "repair-guidance-quality",
    "label": "Repair guidance quality",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-repair-guidance",
        "label": "Missing repair guidance",
        "points": 0.3,
        "appliesWhen": "Applied deductions do not tell an agent what to fix or what evidence would close the gap.",
        "evidenceRequired": "Cite deduction outputs or reports with missing recommendations or unrepairable reasons.",
        "recommendation": "Require every applied deduction to include repair-oriented guidance."
      },
      {
        "id": "incomplete-repair-guidance",
        "label": "Incomplete repair guidance",
        "points": 0.15,
        "appliesWhen": "Recommendations exist but are too generic to guide the next concrete change.",
        "evidenceRequired": "Cite generic recommendations or missing evidence-to-action links.",
        "recommendation": "Make recommendations name the next durable artifact, test, doc, or rubric change."
      },
      {
        "id": "unlinked-repair-proof",
        "label": "Unlinked repair proof",
        "points": 0.08,
        "appliesWhen": "Reports provide guidance but do not link to prompts, evidence, or tests that help an agent repair the finding.",
        "evidenceRequired": "Cite report or renderer behavior showing incomplete repair linkage.",
        "recommendation": "Connect report deductions to copy prompts or targeted repair workflows."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Check rubric specificity, group budget completeness, full-missing deductions, overlap risk, and whether recommendations are directly repairable.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-eval-rubric-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
