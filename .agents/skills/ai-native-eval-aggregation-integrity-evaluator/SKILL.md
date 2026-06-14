---
name: ai-native-eval-aggregation-integrity-evaluator
description: Evaluate whether AI Native Eval scoring is deterministic, validated, config-auditable, and protected from subjective final score assignment. Use only for evaluator-system self-evaluation.
---

# AI Native Eval Aggregation Integrity Evaluator

Evaluate one thing: whether evaluation outputs are aggregated deterministically from validated leaf judgments.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-aggregation-integrity-evaluator",
  "label": "Aggregation integrity evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-eval-aggregation-integrity-evaluator.children" }]
}
```

## Evidence

Inspect aggregation source, folder validation source, config resolution source, CLI behavior, deterministic tests, fixture reports, and self-evaluation run snapshots.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating scoring determinism, validation gates, and config auditability.

```ai-native-deduction-groups
[
  {
    "id": "deterministic-score-path",
    "label": "Deterministic score path",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-deterministic-score-path",
        "label": "Missing deterministic score path",
        "points": 0.4,
        "appliesWhen": "Final scores are assigned directly by AI or hand-authored reports rather than calculated from normalized evaluator nodes.",
        "evidenceRequired": "Cite source, tests, or evaluator outputs showing direct score assignment or missing aggregation.",
        "recommendation": "Route all final scoring through deterministic aggregation of validated nodes."
      },
      {
        "id": "incomplete-deterministic-score-path",
        "label": "Incomplete deterministic score path",
        "points": 0.2,
        "appliesWhen": "Aggregation exists but legacy/manual score paths remain available without sufficient guardrails or tests.",
        "evidenceRequired": "Cite legacy scoring paths, tests, or docs showing the partial guardrail.",
        "recommendation": "Constrain legacy scoring to explicit backward-compatible fixtures and prefer rubric judgments for new outputs."
      },
      {
        "id": "unproven-deterministic-repeatability",
        "label": "Unproven deterministic repeatability",
        "points": 0.1,
        "appliesWhen": "The same input is not tested for stable score/render output across repeated runs.",
        "evidenceRequired": "Cite missing or partial deterministic tests.",
        "recommendation": "Add repeatability tests for score and render output from the same folder input."
      }
    ]
  },
  {
    "id": "validation-gate-integrity",
    "label": "Validation gate integrity",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-validation-gate-integrity",
        "label": "Missing validation gate integrity",
        "points": 0.35,
        "appliesWhen": "Invalid evaluator outputs can be rendered or scored without failing validation.",
        "evidenceRequired": "Cite renderer, CLI, tests, or fixtures showing invalid folders are accepted.",
        "recommendation": "Block render and score operations when folder validation reports errors."
      },
      {
        "id": "incomplete-validation-gate-integrity",
        "label": "Incomplete validation gate integrity",
        "points": 0.18,
        "appliesWhen": "Validation exists but does not cover an important class such as disabled outputs, unreachable outputs, wrong filenames, unknown deduction ids, or missing enabled leaves.",
        "evidenceRequired": "Cite missing validation cases or tests.",
        "recommendation": "Add validation coverage for the missing output-contract class."
      },
      {
        "id": "unclear-validation-error-repair",
        "label": "Unclear validation error repair",
        "points": 0.09,
        "appliesWhen": "Validation errors exist but are not actionable enough for an agent to repair only the failing leaf outputs.",
        "evidenceRequired": "Cite validation output or docs showing unclear repair guidance.",
        "recommendation": "Report all validation errors with exact file, plugin id, and expected contract."
      }
    ]
  },
  {
    "id": "config-auditability",
    "label": "Config auditability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-config-auditability",
        "label": "Missing config auditability",
        "points": 0.25,
        "appliesWhen": "Run snapshots do not record effective roots, disabled plugins, config sources, or config hash.",
        "evidenceRequired": "Cite run.json, config source, or report output showing missing audit data.",
        "recommendation": "Persist effective config and config hash in every run snapshot."
      },
      {
        "id": "incomplete-config-auditability",
        "label": "Incomplete config auditability",
        "points": 0.13,
        "appliesWhen": "Effective config is recorded but source-controlled project config, explicit overrides, or disabled subtree rationale is incomplete.",
        "evidenceRequired": "Cite partial config snapshot or missing rationale.",
        "recommendation": "Record project config sources and disable reasons in the run snapshot and report."
      },
      {
        "id": "unlinked-config-auditability",
        "label": "Unlinked config auditability",
        "points": 0.06,
        "appliesWhen": "Config audit data exists but is not visible in the report or committed evidence.",
        "evidenceRequired": "Cite run snapshot and report evidence showing the visibility gap.",
        "recommendation": "Expose run configuration in reports and committed self-evaluation artifacts."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Check deterministic aggregation, validation failure behavior, legacy score fallback usage, config snapshots, disabled subtree handling, and confidence separation from points.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-eval-aggregation-integrity-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
