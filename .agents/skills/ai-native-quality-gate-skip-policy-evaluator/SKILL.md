---
name: ai-native-quality-gate-skip-policy-evaluator
description: Evaluate quality gate skip policy for AI-native repo maturity. Use when scoring whether docs-only, instruction-only, expensive E2E, and policy-skip cases are explicit and safe.
---

# AI Native Quality Gate Skip Policy Evaluator

Evaluate one thing: whether quality gate skips are explicit, narrow, and auditable.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-quality-gate-skip-policy-evaluator",
  "label": "Quality gate skip policy evaluator",
  "version": "0.1.0",
  "dimension": "ci_test_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-quality-gate-skip-policy-evaluator.children" }]
}
```

## Evidence

Inspect workflow skip policies, docs-only rules, agent-instruction-only policies, manual E2E requirements, and PR evidence for skips.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating docs-only, instruction-only, expensive E2E, and policy-skip cases.

```ai-native-deduction-groups
[
  {
    "id": "skip-policy-definition",
    "label": "Skip policy definition",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-skip-policy-definition",
        "label": "Missing skip policy definition",
        "points": 0.4,
        "appliesWhen": "The repository does not define when quality gates may be skipped or policy-skipped.",
        "evidenceRequired": "Cite quality gate docs, CI workflows, PR templates, labels, skip markers, and recent PRs that show the missing quality gate skip policy requirement.",
        "recommendation": "Add explicit quality gate skip policy guidance for skip policy definition."
      },
      {
        "id": "incomplete-skip-policy-definition",
        "label": "Incomplete skip policy definition",
        "points": 0.2,
        "appliesWhen": "The repository policy exists but omits important change classes.",
        "evidenceRequired": "Cite the partial quality gate skip policy evidence and the specific gap.",
        "recommendation": "Tighten the skip policy definition guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-skip-policy-definition",
        "label": "Unlinked skip policy definition evidence",
        "points": 0.1,
        "appliesWhen": "Quality gate skip policy evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the quality gate skip policy evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "skip-safety",
    "label": "Skip safety",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-skip-safety",
        "label": "Missing skip safety",
        "points": 0.35,
        "appliesWhen": "The repository skip paths can bypass meaningful risk without compensating review or evidence.",
        "evidenceRequired": "Cite quality gate docs, CI workflows, PR templates, labels, skip markers, and recent PRs that show the missing quality gate skip policy requirement.",
        "recommendation": "Add explicit quality gate skip policy guidance for skip safety."
      },
      {
        "id": "incomplete-skip-safety",
        "label": "Incomplete skip safety",
        "points": 0.18,
        "appliesWhen": "The repository skip policy has vague approval or verification requirements.",
        "evidenceRequired": "Cite the partial quality gate skip policy evidence and the specific gap.",
        "recommendation": "Tighten the skip safety guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-skip-safety",
        "label": "Unlinked skip safety evidence",
        "points": 0.09,
        "appliesWhen": "Quality gate skip policy evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the quality gate skip policy evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "skip-auditability",
    "label": "Skip auditability",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-skip-auditability",
        "label": "Missing skip auditability",
        "points": 0.25,
        "appliesWhen": "The repository skip decisions are not recorded in PRs, checks, labels, or artifacts.",
        "evidenceRequired": "Cite quality gate docs, CI workflows, PR templates, labels, skip markers, and recent PRs that show the missing quality gate skip policy requirement.",
        "recommendation": "Add explicit quality gate skip policy guidance for skip auditability."
      },
      {
        "id": "incomplete-skip-auditability",
        "label": "Incomplete skip auditability",
        "points": 0.13,
        "appliesWhen": "The repository audit record exists but is hard to connect to the skipped gate.",
        "evidenceRequired": "Cite the partial quality gate skip policy evidence and the specific gap.",
        "recommendation": "Tighten the skip auditability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-skip-auditability",
        "label": "Unlinked skip auditability evidence",
        "points": 0.06,
        "appliesWhen": "Quality gate skip policy evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the quality gate skip policy evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact policy docs or workflow logic and identify unsafe or ambiguous skips.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-quality-gate-skip-policy-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
