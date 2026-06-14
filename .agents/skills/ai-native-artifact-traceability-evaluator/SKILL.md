---
name: ai-native-artifact-traceability-evaluator
description: Evaluate artifact traceability for AI-native repo maturity. Use when scoring whether reports, screenshots, traces, logs, and review artifacts are linked and findable.
---

# AI Native Artifact Traceability Evaluator

Evaluate one thing: whether evidence artifacts can be found from the claim they support.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-artifact-traceability-evaluator",
  "label": "Artifact traceability evaluator",
  "version": "0.1.0",
  "dimension": "evidence_discipline",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-artifact-traceability-evaluator.children" }]
}
```

## Evidence

Inspect PR links, issue links, report paths, CI artifacts, local report paths, screenshots, traces, videos, and evidence ledger entries.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating reports, screenshots, traces, logs, videos, and review artifacts.

```ai-native-deduction-groups
[
  {
    "id": "artifact-presence",
    "label": "Artifact presence",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-artifact-presence",
        "label": "Missing artifact presence",
        "points": 0.4,
        "appliesWhen": "The repository does not preserve the expected review artifacts.",
        "evidenceRequired": "Cite artifact directories, PR bodies, issue links, report metadata, screenshot/trace paths, and docs that show the missing artifact traceability requirement.",
        "recommendation": "Add explicit artifact traceability guidance for artifact presence."
      },
      {
        "id": "incomplete-artifact-presence",
        "label": "Incomplete artifact presence",
        "points": 0.2,
        "appliesWhen": "The repository preserves only partial artifacts for important workflows.",
        "evidenceRequired": "Cite the partial artifact traceability evidence and the specific gap.",
        "recommendation": "Tighten the artifact presence guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-artifact-presence",
        "label": "Unlinked artifact presence evidence",
        "points": 0.1,
        "appliesWhen": "Artifact traceability evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the artifact traceability evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "artifact-linkage",
    "label": "Artifact linkage",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-artifact-linkage",
        "label": "Missing artifact linkage",
        "points": 0.35,
        "appliesWhen": "The repository does not link artifacts from the issue, PR, report, or evaluation node.",
        "evidenceRequired": "Cite artifact directories, PR bodies, issue links, report metadata, screenshot/trace paths, and docs that show the missing artifact traceability requirement.",
        "recommendation": "Add explicit artifact traceability guidance for artifact linkage."
      },
      {
        "id": "incomplete-artifact-linkage",
        "label": "Incomplete artifact linkage",
        "points": 0.18,
        "appliesWhen": "The repository links artifacts but leaves ambiguous ownership or scope.",
        "evidenceRequired": "Cite the partial artifact traceability evidence and the specific gap.",
        "recommendation": "Tighten the artifact linkage guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-artifact-linkage",
        "label": "Unlinked artifact linkage evidence",
        "points": 0.09,
        "appliesWhen": "Artifact traceability evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the artifact traceability evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "artifact-reproducibility",
    "label": "Artifact reproducibility",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-artifact-reproducibility",
        "label": "Missing artifact reproducibility",
        "points": 0.25,
        "appliesWhen": "The repository does not explain how artifacts were generated or refreshed.",
        "evidenceRequired": "Cite artifact directories, PR bodies, issue links, report metadata, screenshot/trace paths, and docs that show the missing artifact traceability requirement.",
        "recommendation": "Add explicit artifact traceability guidance for artifact reproducibility."
      },
      {
        "id": "incomplete-artifact-reproducibility",
        "label": "Incomplete artifact reproducibility",
        "points": 0.13,
        "appliesWhen": "The repository omits command, timestamp, route, viewport, or environment metadata.",
        "evidenceRequired": "Cite the partial artifact traceability evidence and the specific gap.",
        "recommendation": "Tighten the artifact reproducibility guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-artifact-reproducibility",
        "label": "Unlinked artifact reproducibility evidence",
        "points": 0.06,
        "appliesWhen": "Artifact traceability evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the artifact traceability evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact artifact links/paths and identify broken, private, stale, or unlinked evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-artifact-traceability-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
