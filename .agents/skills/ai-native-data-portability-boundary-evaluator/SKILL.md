---
name: ai-native-data-portability-boundary-evaluator
description: Evaluate data portability boundaries for AI-native repo maturity. Use when scoring SQLite/PostgreSQL decisions, repository/service boundaries, migrations, and database validation paths.
---

# AI Native Data Portability Boundary Evaluator

Evaluate one thing: whether data boundaries support the repo's approved local/cloud deployment paths.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-data-portability-boundary-evaluator",
  "label": "Data portability boundary evaluator",
  "version": "0.1.0",
  "dimension": "architecture_boundaries",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-data-portability-boundary-evaluator.children" }]
}
```

## Evidence

Inspect data persistence docs, migration policy, repository/service boundaries, database scripts, schema review artifacts, and PostgreSQL/SQLite validation paths.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating SQLite/PostgreSQL decisions, repository/service boundaries, migrations, and database validation paths.

```ai-native-deduction-groups
[
  {
    "id": "data-boundary-definition",
    "label": "Data boundary definition",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-data-boundary-definition",
        "label": "Missing data boundary definition",
        "points": 0.4,
        "appliesWhen": "The repository does not define database ownership, repository/service boundaries, or portable data access contracts.",
        "evidenceRequired": "Cite architecture docs, data access modules, migration docs, deployment docs, and package boundaries that show the missing data portability boundaries requirement.",
        "recommendation": "Add explicit data portability boundaries guidance for data boundary definition."
      },
      {
        "id": "incomplete-data-boundary-definition",
        "label": "Incomplete data boundary definition",
        "points": 0.2,
        "appliesWhen": "The repository defines boundaries but leaves local/cloud differences unclear.",
        "evidenceRequired": "Cite the partial data portability boundaries evidence and the specific gap.",
        "recommendation": "Tighten the data boundary definition guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-data-boundary-definition",
        "label": "Unlinked data boundary definition evidence",
        "points": 0.1,
        "appliesWhen": "Data portability boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the data portability boundaries evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "portability-path",
    "label": "Portability path",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-portability-path",
        "label": "Missing portability path",
        "points": 0.35,
        "appliesWhen": "The repository does not preserve a credible path between local and hosted relational persistence.",
        "evidenceRequired": "Cite architecture docs, data access modules, migration docs, deployment docs, and package boundaries that show the missing data portability boundaries requirement.",
        "recommendation": "Add explicit data portability boundaries guidance for portability path."
      },
      {
        "id": "incomplete-portability-path",
        "label": "Incomplete portability path",
        "points": 0.18,
        "appliesWhen": "The repository mentions portability but omits migrations, validation, or provider-specific constraints.",
        "evidenceRequired": "Cite the partial data portability boundaries evidence and the specific gap.",
        "recommendation": "Tighten the portability path guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-portability-path",
        "label": "Unlinked portability path evidence",
        "points": 0.09,
        "appliesWhen": "Data portability boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the data portability boundaries evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "data-validation-proof",
    "label": "Data validation proof",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-data-validation-proof",
        "label": "Missing data validation proof",
        "points": 0.25,
        "appliesWhen": "The repository does not document how agents validate data behavior after changes.",
        "evidenceRequired": "Cite architecture docs, data access modules, migration docs, deployment docs, and package boundaries that show the missing data portability boundaries requirement.",
        "recommendation": "Add explicit data portability boundaries guidance for data validation proof."
      },
      {
        "id": "incomplete-data-validation-proof",
        "label": "Incomplete data validation proof",
        "points": 0.13,
        "appliesWhen": "The repository validation exists but is not linked to runtime, CI, or migration workflows.",
        "evidenceRequired": "Cite the partial data portability boundaries evidence and the specific gap.",
        "recommendation": "Tighten the data validation proof guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-data-validation-proof",
        "label": "Unlinked data validation proof evidence",
        "points": 0.06,
        "appliesWhen": "Data portability boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the data portability boundaries evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact docs, scripts, or package paths and identify missing boundaries or unsafe migration commands.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-data-portability-boundary-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
