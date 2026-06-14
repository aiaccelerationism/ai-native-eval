---
name: ai-native-e2e-artifact-proof-evaluator
description: Evaluate E2E artifact proof for AI-native repo maturity. Use when scoring whether visible behavior has screenshots, traces, videos, reports, and reproducible E2E evidence.
---

# AI Native E2E Artifact Proof Evaluator

Evaluate one thing: whether behavior claims are backed by inspectable E2E artifacts.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-e2e-artifact-proof-evaluator",
  "label": "E2E artifact proof evaluator",
  "version": "0.1.0",
  "dimension": "ci_test_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-e2e-artifact-proof-evaluator.children" }]
}
```

## Evidence

Inspect Playwright/Cypress config, E2E reports, screenshots, traces, videos, workflow artifacts, and PR evidence links.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating screenshots, traces, videos, reports, and reproducible end-to-end evidence.

```ai-native-deduction-groups
[
  {
    "id": "e2e-proof-presence",
    "label": "E2E proof presence",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-e2e-proof-presence",
        "label": "Missing e2e proof presence",
        "points": 0.4,
        "appliesWhen": "The repository does not preserve E2E proof for visible or workflow-critical behavior.",
        "evidenceRequired": "Cite E2E configs, Playwright reports, screenshots, traces, videos, PR artifacts, and docs that show the missing E2E artifact proof requirement.",
        "recommendation": "Add explicit E2E artifact proof guidance for e2e proof presence."
      },
      {
        "id": "incomplete-e2e-proof-presence",
        "label": "Incomplete e2e proof presence",
        "points": 0.2,
        "appliesWhen": "The repository proof exists only for some required flows.",
        "evidenceRequired": "Cite the partial E2E artifact proof evidence and the specific gap.",
        "recommendation": "Tighten the e2e proof presence guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-e2e-proof-presence",
        "label": "Unlinked e2e proof presence evidence",
        "points": 0.1,
        "appliesWhen": "E2E artifact proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the E2E artifact proof evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "artifact-quality",
    "label": "Artifact quality",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-artifact-quality",
        "label": "Missing artifact quality",
        "points": 0.35,
        "appliesWhen": "The repository does not include inspectable screenshots, traces, videos, or reports.",
        "evidenceRequired": "Cite E2E configs, Playwright reports, screenshots, traces, videos, PR artifacts, and docs that show the missing E2E artifact proof requirement.",
        "recommendation": "Add explicit E2E artifact proof guidance for artifact quality."
      },
      {
        "id": "incomplete-artifact-quality",
        "label": "Incomplete artifact quality",
        "points": 0.18,
        "appliesWhen": "The repository artifacts exist but omit route, viewport, command, or result context.",
        "evidenceRequired": "Cite the partial E2E artifact proof evidence and the specific gap.",
        "recommendation": "Tighten the artifact quality guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-artifact-quality",
        "label": "Unlinked artifact quality evidence",
        "points": 0.09,
        "appliesWhen": "E2E artifact proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the E2E artifact proof evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "proof-reproducibility",
    "label": "Proof reproducibility",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-proof-reproducibility",
        "label": "Missing proof reproducibility",
        "points": 0.25,
        "appliesWhen": "The repository does not document how to rerun or regenerate the E2E proof.",
        "evidenceRequired": "Cite E2E configs, Playwright reports, screenshots, traces, videos, PR artifacts, and docs that show the missing E2E artifact proof requirement.",
        "recommendation": "Add explicit E2E artifact proof guidance for proof reproducibility."
      },
      {
        "id": "incomplete-proof-reproducibility",
        "label": "Incomplete proof reproducibility",
        "points": 0.13,
        "appliesWhen": "The repository rerun instructions exist but are incomplete or disconnected from PR evidence.",
        "evidenceRequired": "Cite the partial E2E artifact proof evidence and the specific gap.",
        "recommendation": "Tighten the proof reproducibility guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-proof-reproducibility",
        "label": "Unlinked proof reproducibility evidence",
        "points": 0.06,
        "appliesWhen": "E2E artifact proof evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the E2E artifact proof evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact artifacts and identify claims that lack inspectable proof.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-e2e-artifact-proof-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
