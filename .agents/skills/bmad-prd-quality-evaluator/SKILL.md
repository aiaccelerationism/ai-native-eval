---
name: bmad-prd-quality-evaluator
description: Evaluate BMAD PRD quality. Use when scoring whether requirements are complete enough to plan and validate implementation work.
---

# BMAD PRD Quality Evaluator

Evaluate one thing: PRD quality.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-prd-quality-evaluator",
  "label": "BMAD PRD quality evaluator",
  "version": "0.1.0",
  "dimension": "bmad_planning",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-prd-quality-evaluator.children" }]
}
```

## Evidence

Inspect PRDs, requirements docs, issue specs, validation checklists, UX handoff docs, and planning artifacts.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating PRD quality.

```ai-native-deduction-groups
[
  {
    "id": "prd-existence",
    "label": "PRD existence",
    "budget": 0.125,
    "deductions": [
      {
        "id": "missing-prd",
        "label": "Missing PRD",
        "points": 0.125,
        "appliesWhen": "No PRD or equivalent requirements artifact is present.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Create a PRD or equivalent requirements document before implementation-heavy work."
      },
      {
        "id": "incomplete-prd-existence",
        "label": "Incomplete prd existence",
        "points": 0.065,
        "appliesWhen": "PRD existence evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Create a PRD or equivalent requirements document before implementation-heavy work."
      }
    ]
  },
  {
    "id": "prd-requirements",
    "label": "PRD requirements quality",
    "budget": 0.225,
    "deductions": [
      {
        "id": "incomplete-prd-requirements",
        "label": "Incomplete PRD requirements",
        "points": 0.225,
        "appliesWhen": "The PRD lacks clear goals, users, requirements, acceptance criteria, non-goals, dependencies, or risks.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Add requirements, acceptance criteria, non-goals, dependencies, and risks to the PRD."
      },
      {
        "id": "incomplete-prd-requirements",
        "label": "Incomplete prd requirements quality",
        "points": 0.115,
        "appliesWhen": "PRD requirements quality evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Add requirements, acceptance criteria, non-goals, dependencies, and risks to the PRD."
      }
    ]
  },
  {
    "id": "prd-validation",
    "label": "PRD validation",
    "budget": 0.15,
    "deductions": [
      {
        "id": "missing-prd-validation",
        "label": "Missing PRD validation",
        "points": 0.15,
        "appliesWhen": "There is no evidence that the PRD was validated before solutioning or implementation.",
        "evidenceRequired": "Cite repo artifacts that prove the PRD quality gap.",
        "recommendation": "Add a PRD validation pass or readiness checklist before implementation."
      },
      {
        "id": "incomplete-prd-validation",
        "label": "Incomplete prd validation",
        "points": 0.075,
        "appliesWhen": "PRD validation evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial PRD quality evidence and the specific gap.",
        "recommendation": "Add a PRD validation pass or readiness checklist before implementation."
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

Cite the PRD source and the concrete missing requirement or validation surface.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-prd-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
