---
name: bmad-epic-story-breakdown-evaluator
description: Evaluate BMAD epic and story breakdown quality. Use when scoring whether requirements are decomposed into implementable, reviewable work units.
---

# BMAD Epic Story Breakdown Evaluator

Evaluate one thing: epic and story breakdown quality.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-epic-story-breakdown-evaluator",
  "label": "BMAD epic story breakdown evaluator",
  "version": "0.1.0",
  "dimension": "bmad_solutioning",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-epic-story-breakdown-evaluator.children" }]
}
```

## Evidence

Inspect epics, stories, issues, task specs, sprint plans, PRDs, architecture docs, and acceptance criteria.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating epic and story breakdown quality.

```ai-native-deduction-groups
[
  {
    "id": "breakdown-existence",
    "label": "Epic/story breakdown existence",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-epic-story-breakdown",
        "label": "Missing epic/story breakdown",
        "points": 0.3,
        "appliesWhen": "No epic, story, task, or equivalent work breakdown artifact is present.",
        "evidenceRequired": "Cite repo artifacts that prove the epic and story breakdown quality gap.",
        "recommendation": "Break requirements into epics and stories before assigning implementation work."
      },
      {
        "id": "incomplete-breakdown-existence",
        "label": "Incomplete epic/story breakdown existence",
        "points": 0.15,
        "appliesWhen": "Epic/story breakdown existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial epic and story breakdown quality evidence and the specific gap.",
        "recommendation": "Break requirements into epics and stories before assigning implementation work."
      }
    ]
  },
  {
    "id": "story-slice-quality",
    "label": "Story slice quality",
    "budget": 0.45,
    "deductions": [
      {
        "id": "incomplete-story-slices",
        "label": "Incomplete story slices",
        "points": 0.45,
        "appliesWhen": "Stories exist but are too broad, not independently reviewable, or missing acceptance criteria.",
        "evidenceRequired": "Cite repo artifacts that prove the epic and story breakdown quality gap.",
        "recommendation": "Refine stories into reviewable slices with concrete acceptance criteria."
      },
      {
        "id": "incomplete-story-slice-quality",
        "label": "Incomplete story slice quality",
        "points": 0.23,
        "appliesWhen": "Story slice quality evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial epic and story breakdown quality evidence and the specific gap.",
        "recommendation": "Refine stories into reviewable slices with concrete acceptance criteria."
      }
    ]
  },
  {
    "id": "breakdown-traceability",
    "label": "Breakdown traceability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "unlinked-breakdown",
        "label": "Unlinked breakdown",
        "points": 0.25,
        "appliesWhen": "Epics/stories are not traceable to PRD, architecture, UX, or evidence requirements.",
        "evidenceRequired": "Cite repo artifacts that prove the epic and story breakdown quality gap.",
        "recommendation": "Link each story to upstream requirement and downstream proof expectations."
      },
      {
        "id": "incomplete-breakdown-traceability",
        "label": "Incomplete breakdown traceability",
        "points": 0.13,
        "appliesWhen": "Breakdown traceability evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial epic and story breakdown quality evidence and the specific gap.",
        "recommendation": "Link each story to upstream requirement and downstream proof expectations."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite the breakdown artifact and identify whether the gap is missing decomposition, weak slices, or missing traceability.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-epic-story-breakdown-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
