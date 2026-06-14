---
name: ai-native-deployment-boundary-evaluator
description: Evaluate deployment boundaries for AI-native repo maturity. Use when scoring local/cloud/self-hosted/Electron runtime mode decisions, deploy command ownership, and rollback or smoke validation paths.
---

# AI Native Deployment Boundary Evaluator

Evaluate one thing: whether deployment/runtime modes are explicit and reviewable.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-deployment-boundary-evaluator",
  "label": "Deployment boundary evaluator",
  "version": "0.1.0",
  "dimension": "architecture_boundaries",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-deployment-boundary-evaluator.children" }]
}
```

## Evidence

Inspect deployment docs, runtime architecture docs, Vercel/self-hosted/Electron decisions, deploy scripts, smoke validation, and rollback guidance.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating local, cloud, self-hosted, Electron, rollback, and smoke validation paths.

```ai-native-deduction-groups
[
  {
    "id": "deployment-mode-boundaries",
    "label": "Deployment mode boundaries",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-deployment-mode-boundaries",
        "label": "Missing deployment mode boundaries",
        "points": 0.4,
        "appliesWhen": "The repository does not define supported deployment/runtime modes and ownership boundaries.",
        "evidenceRequired": "Cite deployment docs, runtime scripts, architecture docs, CI workflows, and environment config that show the missing deployment boundaries requirement.",
        "recommendation": "Add explicit deployment boundaries guidance for deployment mode boundaries."
      },
      {
        "id": "incomplete-deployment-mode-boundaries",
        "label": "Incomplete deployment mode boundaries",
        "points": 0.2,
        "appliesWhen": "The repository defines modes but leaves local/cloud/self-hosted responsibilities unclear.",
        "evidenceRequired": "Cite the partial deployment boundaries evidence and the specific gap.",
        "recommendation": "Tighten the deployment mode boundaries guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-deployment-mode-boundaries",
        "label": "Unlinked deployment mode boundaries evidence",
        "points": 0.1,
        "appliesWhen": "Deployment boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the deployment boundaries evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "deploy-command-surface",
    "label": "Deploy command surface",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-deploy-command-surface",
        "label": "Missing deploy command surface",
        "points": 0.35,
        "appliesWhen": "The repository does not document scriptable deploy, build, smoke, or rollback entrypoints.",
        "evidenceRequired": "Cite deployment docs, runtime scripts, architecture docs, CI workflows, and environment config that show the missing deployment boundaries requirement.",
        "recommendation": "Add explicit deployment boundaries guidance for deploy command surface."
      },
      {
        "id": "incomplete-deploy-command-surface",
        "label": "Incomplete deploy command surface",
        "points": 0.18,
        "appliesWhen": "The repository entrypoints exist but are incomplete or not project-owned.",
        "evidenceRequired": "Cite the partial deployment boundaries evidence and the specific gap.",
        "recommendation": "Tighten the deploy command surface guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-deploy-command-surface",
        "label": "Unlinked deploy command surface evidence",
        "points": 0.09,
        "appliesWhen": "Deployment boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the deployment boundaries evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "deployment-validation",
    "label": "Deployment validation",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-deployment-validation",
        "label": "Missing deployment validation",
        "points": 0.25,
        "appliesWhen": "The repository does not explain how agents verify deployment readiness or recover from failure.",
        "evidenceRequired": "Cite deployment docs, runtime scripts, architecture docs, CI workflows, and environment config that show the missing deployment boundaries requirement.",
        "recommendation": "Add explicit deployment boundaries guidance for deployment validation."
      },
      {
        "id": "incomplete-deployment-validation",
        "label": "Incomplete deployment validation",
        "points": 0.13,
        "appliesWhen": "The repository validation exists but lacks expected output, artifact, or rollback guidance.",
        "evidenceRequired": "Cite the partial deployment boundaries evidence and the specific gap.",
        "recommendation": "Tighten the deployment validation guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-deployment-validation",
        "label": "Unlinked deployment validation evidence",
        "points": 0.06,
        "appliesWhen": "Deployment boundaries evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the deployment boundaries evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact deploy/runtime docs and identify hidden provider lock-in, missing smoke proof, or unclear runtime ownership.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-deployment-boundary-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
