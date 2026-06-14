---
name: ai-native-runtime-docs-evaluator
description: Evaluate runtime command documentation for AI-native repo maturity. Use when scoring whether dev, production, test, E2E, reset, and smoke commands are documented clearly.
---

# AI Native Runtime Docs Evaluator

Evaluate one thing: whether runtime commands are documented enough for repeatable agent execution.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-runtime-docs-evaluator",
  "label": "Runtime docs evaluator",
  "version": "0.1.0",
  "dimension": "documentation_onboarding",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-runtime-docs-evaluator.children" }]
}
```

## Evidence

Inspect runtime docs, package scripts, mise/task docs, E2E docs, reset/down docs, expected outputs, and failure handling notes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating the main runtime documentation leaf.

```ai-native-deduction-groups
[
  {
    "id": "runtime-command-coverage",
    "label": "Runtime command coverage",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-project-owned-runtime-entrypoints",
        "label": "Missing project-owned runtime entrypoints",
        "points": 0.4,
        "appliesWhen": "The repo does not document project-owned commands for the primary local runtime path.",
        "evidenceRequired": "Cite README/docs/package scripts showing the missing or absent command surface.",
        "recommendation": "Add documented project-owned commands for the primary dev and/or local production runtime."
      },
      {
        "id": "missing-important-runtime-mode",
        "label": "Missing important runtime mode",
        "points": 0.2,
        "appliesWhen": "Some runtime modes that agents are expected to use are undocumented, such as production start, smoke, reset/down, or E2E launch.",
        "evidenceRequired": "Cite the documented modes and the expected-but-missing mode.",
        "recommendation": "Document each expected runtime mode with a stable command and scope."
      },
      {
        "id": "commands-exist-but-entrypoint-is-unclear",
        "label": "Commands exist but entrypoint is unclear",
        "points": 0.15,
        "appliesWhen": "Scripts or commands exist, but docs do not identify which one an agent should run first.",
        "evidenceRequired": "Cite package scripts and the docs section that fails to name the owner entrypoint.",
        "recommendation": "Mark the owner entrypoint and distinguish it from lower-level helper scripts."
      }
    ]
  },
  {
    "id": "runtime-reproducibility",
    "label": "Runtime reproducibility",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-prerequisites",
        "label": "Missing prerequisites",
        "points": 0.2,
        "appliesWhen": "Docs omit required prerequisites such as package manager, Node version, env files, services, ports, or install steps.",
        "evidenceRequired": "Cite docs and package/runtime config showing required setup that is not documented.",
        "recommendation": "Document prerequisites before the command list."
      },
      {
        "id": "missing-expected-output-or-health-check",
        "label": "Missing expected output or health check",
        "points": 0.15,
        "appliesWhen": "Docs tell agents to run commands but do not say how to know the app is ready or healthy.",
        "evidenceRequired": "Cite the runtime command docs and the absence of ready-state, URL, or health-check guidance.",
        "recommendation": "Add expected terminal output, local URL, smoke check, or readiness condition."
      },
      {
        "id": "runtime-docs-not-machine-repeatable",
        "label": "Runtime docs are not machine-repeatable",
        "points": 0.35,
        "appliesWhen": "Runtime guidance depends on ad hoc prose, manual guessing, or one-off local steps that an agent cannot repeat reliably.",
        "evidenceRequired": "Cite the ambiguous docs or missing command surface.",
        "recommendation": "Convert runtime setup into scriptable commands with deterministic inputs and outputs."
      }
    ]
  },
  {
    "id": "runtime-failure-handling",
    "label": "Runtime failure handling",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-failure-handling",
        "label": "Missing failure handling",
        "points": 0.25,
        "appliesWhen": "Docs do not explain common runtime failures, reset/down recovery, port conflicts, stale state, or where to inspect logs.",
        "evidenceRequired": "Cite runtime docs and any scripts/config that imply failure cases without documented recovery.",
        "recommendation": "Add a short troubleshooting section covering the expected failures and recovery commands."
      },
      {
        "id": "failure-handling-is-present-but-incomplete",
        "label": "Failure handling is present but incomplete",
        "points": 0.15,
        "appliesWhen": "Some failure handling exists, but it omits important local recovery paths agents commonly need.",
        "evidenceRequired": "Cite the existing failure-handling docs and the missing recovery path.",
        "recommendation": "Expand failure handling to cover reset/down, dependency reinstall, port conflicts, and service readiness."
      },
      {
        "id": "failure-handling-not-linked-from-runtime-docs",
        "label": "Failure handling is not linked from runtime docs",
        "points": 0.1,
        "appliesWhen": "Failure handling exists elsewhere but runtime command docs do not link to it.",
        "evidenceRequired": "Cite both the runtime docs and the separate troubleshooting material.",
        "recommendation": "Link troubleshooting and reset guidance directly from the runtime command section."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group also includes at least one deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact command docs and separate missing docs from commands that exist but are undocumented.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-runtime-docs-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
