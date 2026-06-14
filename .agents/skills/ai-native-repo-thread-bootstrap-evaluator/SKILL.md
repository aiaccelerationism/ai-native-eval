---
name: ai-native-repo-thread-bootstrap-evaluator
description: Evaluate repository thread bootstrap readiness for AI-native repo maturity. Use when scoring whether new agent threads can establish repo state, scope, branch, issue, PR, and approval context.
---

# AI Native Repo Thread Bootstrap Evaluator

Evaluate one thing: whether an agent can start or resume a repo thread without missing essential workflow context.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-repo-thread-bootstrap-evaluator",
  "label": "Repo thread bootstrap evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-repo-thread-bootstrap-evaluator.children" }]
}
```

## Evidence

Inspect `AGENTS.md`, thread bootstrap skills, project workflow docs, required reading, branch/worktree rules, and issue/PR context rules.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating new agent thread setup for repo state, scope, branch, issue, PR, and approval context.

```ai-native-deduction-groups
[
  {
    "id": "bootstrap-context",
    "label": "Bootstrap context",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-bootstrap-context",
        "label": "Missing bootstrap context",
        "points": 0.4,
        "appliesWhen": "The repository new threads cannot reliably establish repo state, scope, branch, or task context.",
        "evidenceRequired": "Cite AGENTS.md, repo bootstrap skills, workflow docs, git status conventions, issue/PR docs, and thread-start instructions that show the missing repo thread bootstrap requirement.",
        "recommendation": "Add explicit repo thread bootstrap guidance for bootstrap context."
      },
      {
        "id": "incomplete-bootstrap-context",
        "label": "Incomplete bootstrap context",
        "points": 0.2,
        "appliesWhen": "The repository bootstrap guidance exists but omits issue/PR/approval context.",
        "evidenceRequired": "Cite the partial repo thread bootstrap evidence and the specific gap.",
        "recommendation": "Tighten the bootstrap context guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-bootstrap-context",
        "label": "Unlinked bootstrap context evidence",
        "points": 0.1,
        "appliesWhen": "Repo thread bootstrap evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the repo thread bootstrap evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "required-reading-routing",
    "label": "Required reading routing",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-required-reading-routing",
        "label": "Missing required reading routing",
        "points": 0.35,
        "appliesWhen": "The repository bootstrap does not route agents to required docs or skills before work.",
        "evidenceRequired": "Cite AGENTS.md, repo bootstrap skills, workflow docs, git status conventions, issue/PR docs, and thread-start instructions that show the missing repo thread bootstrap requirement.",
        "recommendation": "Add explicit repo thread bootstrap guidance for required reading routing."
      },
      {
        "id": "incomplete-required-reading-routing",
        "label": "Incomplete required reading routing",
        "points": 0.18,
        "appliesWhen": "The repository routing exists but is too broad, stale, or not task-sensitive.",
        "evidenceRequired": "Cite the partial repo thread bootstrap evidence and the specific gap.",
        "recommendation": "Tighten the required reading routing guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-required-reading-routing",
        "label": "Unlinked required reading routing evidence",
        "points": 0.09,
        "appliesWhen": "Repo thread bootstrap evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the repo thread bootstrap evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "thread-safety",
    "label": "Thread safety",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-thread-safety",
        "label": "Missing thread safety",
        "points": 0.25,
        "appliesWhen": "The repository bootstrap does not protect against dirty worktree, wrong branch, or missing human approval.",
        "evidenceRequired": "Cite AGENTS.md, repo bootstrap skills, workflow docs, git status conventions, issue/PR docs, and thread-start instructions that show the missing repo thread bootstrap requirement.",
        "recommendation": "Add explicit repo thread bootstrap guidance for thread safety."
      },
      {
        "id": "incomplete-thread-safety",
        "label": "Incomplete thread safety",
        "points": 0.13,
        "appliesWhen": "The repository safety checks exist but are incomplete or not required.",
        "evidenceRequired": "Cite the partial repo thread bootstrap evidence and the specific gap.",
        "recommendation": "Tighten the thread safety guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-thread-safety",
        "label": "Unlinked thread safety evidence",
        "points": 0.06,
        "appliesWhen": "Repo thread bootstrap evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the repo thread bootstrap evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact bootstrap instructions and identify missing start/resume gates.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-repo-thread-bootstrap-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
