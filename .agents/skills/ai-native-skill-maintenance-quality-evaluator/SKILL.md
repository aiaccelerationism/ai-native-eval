---
name: ai-native-skill-maintenance-quality-evaluator
description: Evaluate skill maintenance quality for AI-native repo maturity. Use when scoring whether durable lessons become skill updates, eval cases, or decision docs instead of staying in chat.
---

# AI Native Skill Maintenance Quality Evaluator

Evaluate one thing: whether project skills stay current and capture durable workflow lessons.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-skill-maintenance-quality-evaluator",
  "label": "Skill maintenance quality evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-skill-maintenance-quality-evaluator.children" }]
}
```

## Evidence

Inspect skill changes, known issue links, recurrence-prevention notes, eval cases, decision docs, and repeated AI failure records.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating durable lessons becoming skill updates, eval cases, or decision docs.

```ai-native-deduction-groups
[
  {
    "id": "skill-update-discipline",
    "label": "Skill update discipline",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-skill-update-discipline",
        "label": "Missing skill update discipline",
        "points": 0.4,
        "appliesWhen": "The repository durable preferences or lessons are not captured in skills or decision docs.",
        "evidenceRequired": "Cite skill directories, eval cases, changelogs, known issues, PRs, and decision docs that show the missing skill maintenance quality requirement.",
        "recommendation": "Add explicit skill maintenance quality guidance for skill update discipline."
      },
      {
        "id": "incomplete-skill-update-discipline",
        "label": "Incomplete skill update discipline",
        "points": 0.2,
        "appliesWhen": "The repository updates exist but are incomplete or buried in chat/PR prose.",
        "evidenceRequired": "Cite the partial skill maintenance quality evidence and the specific gap.",
        "recommendation": "Tighten the skill update discipline guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-skill-update-discipline",
        "label": "Unlinked skill update discipline evidence",
        "points": 0.1,
        "appliesWhen": "Skill maintenance quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill maintenance quality evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "skill-eval-coverage",
    "label": "Skill eval coverage",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-skill-eval-coverage",
        "label": "Missing skill eval coverage",
        "points": 0.35,
        "appliesWhen": "The repository skills lack eval cases or examples for important behaviors.",
        "evidenceRequired": "Cite skill directories, eval cases, changelogs, known issues, PRs, and decision docs that show the missing skill maintenance quality requirement.",
        "recommendation": "Add explicit skill maintenance quality guidance for skill eval coverage."
      },
      {
        "id": "incomplete-skill-eval-coverage",
        "label": "Incomplete skill eval coverage",
        "points": 0.18,
        "appliesWhen": "The repository evals exist but do not cover recent misses or core routing.",
        "evidenceRequired": "Cite the partial skill maintenance quality evidence and the specific gap.",
        "recommendation": "Tighten the skill eval coverage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-skill-eval-coverage",
        "label": "Unlinked skill eval coverage evidence",
        "points": 0.09,
        "appliesWhen": "Skill maintenance quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill maintenance quality evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "maintenance-ownership",
    "label": "Maintenance ownership",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-maintenance-ownership",
        "label": "Missing maintenance ownership",
        "points": 0.25,
        "appliesWhen": "The repository skill maintenance ownership, trigger, or update criteria are unclear.",
        "evidenceRequired": "Cite skill directories, eval cases, changelogs, known issues, PRs, and decision docs that show the missing skill maintenance quality requirement.",
        "recommendation": "Add explicit skill maintenance quality guidance for maintenance ownership."
      },
      {
        "id": "incomplete-maintenance-ownership",
        "label": "Incomplete maintenance ownership",
        "points": 0.13,
        "appliesWhen": "The repository ownership exists but does not define when to revise skills.",
        "evidenceRequired": "Cite the partial skill maintenance quality evidence and the specific gap.",
        "recommendation": "Tighten the maintenance ownership guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-maintenance-ownership",
        "label": "Unlinked maintenance ownership evidence",
        "points": 0.06,
        "appliesWhen": "Skill maintenance quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill maintenance quality evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact skill/doc updates or explain which repeated lesson has no durable owner.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-skill-maintenance-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
