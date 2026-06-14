---
name: bmad-architecture-readiness-evaluator
description: Evaluate BMAD architecture readiness. Use when scoring whether architecture decisions and constraints are documented before implementation.
---

# BMAD Architecture Readiness Evaluator

Evaluate one thing: architecture readiness.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-architecture-readiness-evaluator",
  "label": "BMAD architecture readiness evaluator",
  "version": "0.1.0",
  "dimension": "bmad_solutioning",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-architecture-readiness-evaluator.children" }]
}
```

## Evidence

Inspect architecture docs, ADRs, platform charters, project context, epics, stories, and implementation plans.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating architecture readiness.

```ai-native-deduction-groups
[
  {
    "id": "architecture-existence",
    "label": "Architecture artifact existence",
    "budget": 0.15,
    "deductions": [
      {
        "id": "missing-architecture-artifact",
        "label": "Missing architecture artifact",
        "points": 0.15,
        "appliesWhen": "No architecture, solution design, or technical decision artifact is present for the planned work.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Add architecture or solution design evidence before decomposing implementation work."
      },
      {
        "id": "incomplete-architecture-existence",
        "label": "Incomplete architecture artifact existence",
        "points": 0.075,
        "appliesWhen": "Architecture artifact existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Add architecture or solution design evidence before decomposing implementation work."
      }
    ]
  },
  {
    "id": "architecture-decisions",
    "label": "Architecture decision quality",
    "budget": 0.225,
    "deductions": [
      {
        "id": "incomplete-architecture-decisions",
        "label": "Incomplete architecture decisions",
        "points": 0.225,
        "appliesWhen": "Architecture evidence exists but omits key boundaries, tradeoffs, runtime paths, data ownership, or constraints.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Record the technical decisions and boundaries needed for consistent agent implementation."
      },
      {
        "id": "incomplete-architecture-decisions",
        "label": "Incomplete architecture decision quality",
        "points": 0.115,
        "appliesWhen": "Architecture decision quality evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Record the technical decisions and boundaries needed for consistent agent implementation."
      }
    ]
  },
  {
    "id": "architecture-readiness-linkage",
    "label": "Architecture readiness linkage",
    "budget": 0.125,
    "deductions": [
      {
        "id": "unlinked-architecture-readiness",
        "label": "Unlinked architecture readiness",
        "points": 0.125,
        "appliesWhen": "Architecture decisions are not linked to PRD, epics, stories, or implementation context.",
        "evidenceRequired": "Cite repo artifacts that prove the architecture readiness gap.",
        "recommendation": "Link architecture decisions into downstream epics and story context."
      },
      {
        "id": "incomplete-architecture-readiness-linkage",
        "label": "Incomplete architecture readiness linkage",
        "points": 0.065,
        "appliesWhen": "Architecture readiness linkage evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial architecture readiness evidence and the specific gap.",
        "recommendation": "Link architecture decisions into downstream epics and story context."
      }
    ]
  },
  {
    "id": "recent-change-follow-through",
    "label": "Recent change follow-through",
    "budget": 0.5,
    "deductions": [
      {
        "id": "no-recent-change-evidence",
        "label": "No recent change evidence",
        "points": 0.5,
        "appliesWhen": "The evaluator cannot identify a usable sample of the last five PR-equivalent substantive changes from GitHub PRs, merge commits, issue-linked task branches, release notes, or grouped commits, and the review scope expects current workflow practice rather than documentation-only readiness.",
        "evidenceRequired": "Cite the attempted recent-change sources, such as GitHub PR lists, merge commits, issue links, release notes, grouped commit ranges, or missing-access notes.",
        "recommendation": "Preserve enough PR-equivalent change history for this evaluator to verify whether the documented practice is actually used."
      },
      {
        "id": "recent-changes-bypass-practice",
        "label": "Recent changes bypass the practice",
        "points": 0.5,
        "appliesWhen": "Configuration, templates, or documentation for this evaluator exist, but most of the last five PR-equivalent substantive changes bypass the expected issue, PR, review, test, artifact, human-gate, or agent workflow practice.",
        "evidenceRequired": "Cite the sampled recent changes and show which expected practice was skipped or contradicted.",
        "recommendation": "Make the configured practice mandatory in real change flow and repair the recent-change path that allowed it to be skipped."
      },
      {
        "id": "inconsistent-recent-change-follow-through",
        "label": "Inconsistent recent change follow-through",
        "points": 0.25,
        "appliesWhen": "The sampled recent changes show partial adoption, but at least two of the last five PR-equivalent substantive changes miss or weaken the evaluator-specific practice.",
        "evidenceRequired": "Cite the sampled changes, distinguishing examples that followed the practice from examples that did not.",
        "recommendation": "Tighten templates, checks, reviewer expectations, or agent instructions so the practice is followed consistently across substantive changes."
      },
      {
        "id": "missing-human-agent-follow-through",
        "label": "Missing human/agent follow-through",
        "points": 0.25,
        "appliesWhen": "The repository claims human or agent responsibilities for this practice, but recent substantive changes do not show the human and agent roles actually carrying those responsibilities through to review or merge.",
        "evidenceRequired": "Cite recent PRs, reviews, comments, commits, or artifacts that show the missing human/agent follow-through.",
        "recommendation": "Record human and agent responsibilities in the change artifacts reviewers actually use, not only in static policy docs."
      }
    ]
  }
]
```

Group budgets sum to `1.0`: half covers configured capability and half covers recent change follow-through, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact architecture evidence and explain whether the gap is missing, incomplete, or unlinked.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-architecture-readiness-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
