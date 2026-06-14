---
name: ai-native-worktree-isolation-evaluator
description: Evaluate git worktree and branch isolation rules for AI-native repo maturity. Use when scoring whether parallel agents can avoid dirty-state, branch, and ownership conflicts.
---

# AI Native Worktree Isolation Evaluator

Evaluate one thing: whether the repo has safe worktree, branch, and dirty-state rules for parallel agent work.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-worktree-isolation-evaluator",
  "label": "Worktree isolation evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-worktree-isolation-evaluator.children" }]
}
```

## Evidence

Inspect worktree tracking docs, active worktree state conventions, branch naming rules, dirty-state rules, and guidance for concurrent Codex threads.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating parallel agent branch/worktree rules, dirty-state checks, ownership conflicts, and cleanup.

```ai-native-deduction-groups
[
  {
    "id": "worktree-policy",
    "label": "Worktree policy",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-worktree-policy",
        "label": "Missing worktree policy",
        "points": 0.4,
        "appliesWhen": "The repository does not define branch/worktree isolation rules for parallel agent work.",
        "evidenceRequired": "Cite AGENTS.md, worktree docs, branch policy, task plans, git status conventions, and PR workflow docs that show the missing worktree isolation requirement.",
        "recommendation": "Add explicit worktree isolation guidance for worktree policy."
      },
      {
        "id": "incomplete-worktree-policy",
        "label": "Incomplete worktree policy",
        "points": 0.2,
        "appliesWhen": "The repository policy exists but omits ownership, naming, or when to allocate worktrees.",
        "evidenceRequired": "Cite the partial worktree isolation evidence and the specific gap.",
        "recommendation": "Tighten the worktree policy guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-worktree-policy",
        "label": "Unlinked worktree policy evidence",
        "points": 0.1,
        "appliesWhen": "Worktree isolation evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the worktree isolation evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "dirty-state-protection",
    "label": "Dirty-state protection",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-dirty-state-protection",
        "label": "Missing dirty-state protection",
        "points": 0.35,
        "appliesWhen": "The repository does not require agents to inspect and protect existing dirty work before editing.",
        "evidenceRequired": "Cite AGENTS.md, worktree docs, branch policy, task plans, git status conventions, and PR workflow docs that show the missing worktree isolation requirement.",
        "recommendation": "Add explicit worktree isolation guidance for dirty-state protection."
      },
      {
        "id": "incomplete-dirty-state-protection",
        "label": "Incomplete dirty-state protection",
        "points": 0.18,
        "appliesWhen": "The repository dirty-state guidance exists but lacks conflict or user-change handling.",
        "evidenceRequired": "Cite the partial worktree isolation evidence and the specific gap.",
        "recommendation": "Tighten the dirty-state protection guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-dirty-state-protection",
        "label": "Unlinked dirty-state protection evidence",
        "points": 0.09,
        "appliesWhen": "Worktree isolation evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the worktree isolation evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "parallel-cleanup-and-handoff",
    "label": "Parallel cleanup and handoff",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-parallel-cleanup-and-handoff",
        "label": "Missing parallel cleanup and handoff",
        "points": 0.25,
        "appliesWhen": "The repository does not document cleanup, handoff, or conflict resolution after parallel work.",
        "evidenceRequired": "Cite AGENTS.md, worktree docs, branch policy, task plans, git status conventions, and PR workflow docs that show the missing worktree isolation requirement.",
        "recommendation": "Add explicit worktree isolation guidance for parallel cleanup and handoff."
      },
      {
        "id": "incomplete-parallel-cleanup-and-handoff",
        "label": "Incomplete parallel cleanup and handoff",
        "points": 0.13,
        "appliesWhen": "The repository cleanup guidance exists but is not linked to PR/thread closeout.",
        "evidenceRequired": "Cite the partial worktree isolation evidence and the specific gap.",
        "recommendation": "Tighten the parallel cleanup and handoff guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-parallel-cleanup-and-handoff",
        "label": "Unlinked parallel cleanup and handoff evidence",
        "points": 0.06,
        "appliesWhen": "Worktree isolation evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the worktree isolation evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact worktree rules and identify whether the repo supports safe parallel implementation.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-worktree-isolation-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
