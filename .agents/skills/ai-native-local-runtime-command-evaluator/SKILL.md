---
name: ai-native-local-runtime-command-evaluator
description: Evaluate local runtime command surfaces for AI-native repo maturity. Use when scoring whether agents can run dev, production, smoke, build, and E2E through documented project-owned commands.
---

# AI Native Local Runtime Command Evaluator

Evaluate one thing: whether local runtime commands are project-owned, documented, and reproducible.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-local-runtime-command-evaluator",
  "label": "Local runtime command evaluator",
  "version": "0.1.0",
  "dimension": "repo_operability",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-local-runtime-command-evaluator.children" }]
}
```

## Evidence

Inspect `package.json`, task runners, `mise.toml`, runtime docs, build/start scripts, smoke commands, and E2E launch commands.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating project-owned dev, production, smoke, build, and E2E runtime entrypoints.

```ai-native-deduction-groups
[
  {
    "id": "runtime-entrypoints",
    "label": "Runtime entrypoints",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-runtime-entrypoints",
        "label": "Missing runtime entrypoints",
        "points": 0.4,
        "appliesWhen": "The repository does not provide project-owned commands for the primary local runtime paths.",
        "evidenceRequired": "Cite package.json, task runners, mise.toml, runtime docs, build/start scripts, smoke commands, and E2E launch commands that show the missing local runtime commands requirement.",
        "recommendation": "Add explicit local runtime commands guidance for runtime entrypoints."
      },
      {
        "id": "incomplete-runtime-entrypoints",
        "label": "Incomplete runtime entrypoints",
        "points": 0.2,
        "appliesWhen": "The repository commands exist but the owner entrypoint is unclear or undocumented.",
        "evidenceRequired": "Cite the partial local runtime commands evidence and the specific gap.",
        "recommendation": "Tighten the runtime entrypoints guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-runtime-entrypoints",
        "label": "Unlinked runtime entrypoints evidence",
        "points": 0.1,
        "appliesWhen": "Local runtime commands evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local runtime commands evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "scriptability",
    "label": "Command scriptability",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-scriptability",
        "label": "Missing command scriptability",
        "points": 0.35,
        "appliesWhen": "The repository runtime requires ad hoc manual steps instead of scriptable commands.",
        "evidenceRequired": "Cite package.json, task runners, mise.toml, runtime docs, build/start scripts, smoke commands, and E2E launch commands that show the missing local runtime commands requirement.",
        "recommendation": "Add explicit local runtime commands guidance for command scriptability."
      },
      {
        "id": "incomplete-scriptability",
        "label": "Incomplete command scriptability",
        "points": 0.18,
        "appliesWhen": "The repository commands are scriptable but require undocumented setup or ordering.",
        "evidenceRequired": "Cite the partial local runtime commands evidence and the specific gap.",
        "recommendation": "Tighten the command scriptability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-scriptability",
        "label": "Unlinked command scriptability evidence",
        "points": 0.09,
        "appliesWhen": "Local runtime commands evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local runtime commands evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "runtime-command-validation",
    "label": "Runtime command validation",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-runtime-command-validation",
        "label": "Missing runtime command validation",
        "points": 0.25,
        "appliesWhen": "The repository does not document how to confirm commands succeeded.",
        "evidenceRequired": "Cite package.json, task runners, mise.toml, runtime docs, build/start scripts, smoke commands, and E2E launch commands that show the missing local runtime commands requirement.",
        "recommendation": "Add explicit local runtime commands guidance for runtime command validation."
      },
      {
        "id": "incomplete-runtime-command-validation",
        "label": "Incomplete runtime command validation",
        "points": 0.13,
        "appliesWhen": "The repository validation exists but omits expected output, URL, smoke command, or failure interpretation.",
        "evidenceRequired": "Cite the partial local runtime commands evidence and the specific gap.",
        "recommendation": "Tighten the runtime command validation guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-runtime-command-validation",
        "label": "Unlinked runtime command validation evidence",
        "points": 0.06,
        "appliesWhen": "Local runtime commands evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the local runtime commands evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact commands and explain whether they are entrypoints, package primitives, CI gates, or implementation details.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-local-runtime-command-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
