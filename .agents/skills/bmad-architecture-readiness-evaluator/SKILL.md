---
name: bmad-architecture-readiness-evaluator
description: Evaluate BMAD architecture readiness. Use when scoring whether architecture decisions and constraints are documented before implementation.
---

# BMAD Architecture Readiness Evaluator

Evaluate one thing: architecture readiness.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-architecture-readiness-evaluator",
  "label": "BMAD architecture readiness evaluator",
  "version": "0.1.0",
  "dimension": "bmad_solutioning",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-architecture-readiness-evaluator.children" }]
}
```

## Evidence

Inspect architecture docs, ADRs, platform charters, project context, epics, stories, and implementation plans.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating architecture readiness.

```ai-native-deduction-groups
[
  {
    "id": "architecture-existence",
    "label": "Architecture artifact existence",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-architecture-artifact",
        "label": "Missing architecture artifact",
        "points": 0.3,
        "appliesWhen": "No architecture, solution design, or technical decision artifact is present for the planned work.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Add architecture or solution design evidence before decomposing implementation work."
      },
      {
        "id": "incomplete-architecture-existence",
        "label": "Incomplete architecture artifact existence",
        "points": 0.15,
        "appliesWhen": "Architecture artifact existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Add architecture or solution design evidence before decomposing implementation work."
      }
    ]
  },
  {
    "id": "architecture-decisions",
    "label": "Architecture decision quality",
    "budget": 0.45,
    "deductions": [
      {
        "id": "incomplete-architecture-decisions",
        "label": "Incomplete architecture decisions",
        "points": 0.45,
        "appliesWhen": "Architecture evidence exists but omits key boundaries, tradeoffs, runtime paths, data ownership, or constraints.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Record the technical decisions and boundaries needed for consistent agent implementation."
      },
      {
        "id": "incomplete-architecture-decisions",
        "label": "Incomplete architecture decision quality",
        "points": 0.23,
        "appliesWhen": "Architecture decision quality evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Record the technical decisions and boundaries needed for consistent agent implementation."
      }
    ]
  },
  {
    "id": "architecture-readiness-linkage",
    "label": "Architecture readiness linkage",
    "budget": 0.25,
    "deductions": [
      {
        "id": "unlinked-architecture-readiness",
        "label": "Unlinked architecture readiness",
        "points": 0.25,
        "appliesWhen": "Architecture decisions are not linked to PRD, epics, stories, or implementation context.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Link architecture decisions into downstream epics and story context."
      },
      {
        "id": "incomplete-architecture-readiness-linkage",
        "label": "Incomplete architecture readiness linkage",
        "points": 0.13,
        "appliesWhen": "Architecture readiness linkage evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Link architecture decisions into downstream epics and story context."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact architecture evidence and explain whether the gap is missing, incomplete, or unlinked.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-architecture-readiness-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
