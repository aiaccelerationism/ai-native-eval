---
name: bmad-story-context-quality-evaluator
description: Evaluate BMAD story context quality. Use when scoring whether implementation stories contain enough context for an agent to execute safely.
---

# BMAD Story Context Quality Evaluator

Evaluate one thing: story context quality.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-story-context-quality-evaluator",
  "label": "BMAD story context quality evaluator",
  "version": "0.1.0",
  "dimension": "bmad_implementation",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-story-context-quality-evaluator.children" }]
}
```

## Evidence

Inspect story files, issue specs, implementation prompts, PR bodies, acceptance criteria, test commands, and proof artifacts.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating story context quality.

```ai-native-deduction-groups
[
  {
    "id": "story-context-existence",
    "label": "Story context existence",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-story-context",
        "label": "Missing story context",
        "points": 0.25,
        "appliesWhen": "Implementation work lacks a story file, issue spec, or equivalent execution context.",
        "evidenceRequired": "Cite repo artifacts that prove the story context quality gap.",
        "recommendation": "Create a story context artifact before implementation."
      },
      {
        "id": "incomplete-story-context-existence",
        "label": "Incomplete story context existence",
        "points": 0.13,
        "appliesWhen": "Story context existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial story context quality evidence and the specific gap.",
        "recommendation": "Create a story context artifact before implementation."
      }
    ]
  },
  {
    "id": "implementation-context",
    "label": "Implementation context completeness",
    "budget": 0.45,
    "deductions": [
      {
        "id": "incomplete-implementation-context",
        "label": "Incomplete implementation context",
        "points": 0.45,
        "appliesWhen": "Story context lacks files, constraints, architecture notes, UX requirements, tests, or known pitfalls.",
        "evidenceRequired": "Cite repo artifacts that prove the story context quality gap.",
        "recommendation": "Add enough implementation context that an agent can work without guessing."
      },
      {
        "id": "incomplete-implementation-context",
        "label": "Incomplete implementation context completeness",
        "points": 0.23,
        "appliesWhen": "Implementation context completeness evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial story context quality evidence and the specific gap.",
        "recommendation": "Add enough implementation context that an agent can work without guessing."
      }
    ]
  },
  {
    "id": "story-done-proof",
    "label": "Story done proof",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-story-done-proof",
        "label": "Missing story done proof",
        "points": 0.3,
        "appliesWhen": "Story context lacks clear done criteria, validation commands, or proof artifacts.",
        "evidenceRequired": "Cite repo artifacts that prove the story context quality gap.",
        "recommendation": "Add done criteria, validation commands, and expected proof artifacts to the story."
      },
      {
        "id": "incomplete-story-done-proof",
        "label": "Incomplete story done proof",
        "points": 0.15,
        "appliesWhen": "Story done proof evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial story context quality evidence and the specific gap.",
        "recommendation": "Add done criteria, validation commands, and expected proof artifacts to the story."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact story context and distinguish context gaps from done-proof gaps.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-story-context-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
