---
name: ai-native-source-control-ai-participation-evaluator
description: Evaluate whether issues, pull requests, reviews, checks, and merge records show real AI participation, AI review, and AI repair loops rather than only human-authored source control metadata.
---

# AI Native Source Control AI Participation Evaluator

Evaluate one thing: whether source control artifacts prove AI participation in planning, review, repair, and merge readiness.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-source-control-ai-participation-evaluator",
  "label": "Source control AI participation evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-source-control-ai-participation-evaluator.children" }]
}
```

## Evidence

Inspect issue templates, issue bodies, PR bodies, review comments, AI reviewer output, check runs, CI repair comments, merge records, and recent PR-equivalent changes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating AI participation in source control.

```ai-native-deduction-groups
[
  {
    "id": "source-control-ai-configuration",
    "label": "Source control AI configuration",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-source-control-ai-configuration",
        "label": "Missing source control AI configuration",
        "points": 0.2,
        "appliesWhen": "Issue and PR workflows do not require AI participation evidence, AI reviewer status, AI repair loops, or agent-readable review outcomes.",
        "evidenceRequired": "Cite issue templates, PR templates, review docs, branch rules, or missing source-control workflow docs.",
        "recommendation": "Add issue and PR fields for AI participation, AI reviewer status, repair loops, and evidence links."
      },
      {
        "id": "incomplete-source-control-ai-configuration",
        "label": "Incomplete source control AI configuration",
        "points": 0.1,
        "appliesWhen": "Source-control AI participation fields exist but omit AI reviewer, repair response, checks, artifacts, or merge decision evidence.",
        "evidenceRequired": "Cite the partial template or workflow rule.",
        "recommendation": "Make source-control templates require the missing AI participation field."
      }
    ]
  },
  {
    "id": "source-control-ai-execution",
    "label": "Source control AI execution",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-source-control-ai-execution",
        "label": "Missing source control AI execution",
        "points": 0.2,
        "appliesWhen": "Recent issues or PRs do not show AI-authored planning, AI review, AI repair, or AI-linked evidence.",
        "evidenceRequired": "Cite recent issues, PRs, reviews, check runs, comments, or missing GitHub access.",
        "recommendation": "Require recent PRs to record AI participation and AI review or explicitly state why none was applicable."
      },
      {
        "id": "incomplete-source-control-ai-execution",
        "label": "Incomplete source control AI execution",
        "points": 0.1,
        "appliesWhen": "AI participation is visible but does not cover planning, review, repair, and validation end to end.",
        "evidenceRequired": "Cite the partial issue/PR/review evidence.",
        "recommendation": "Link AI review, repair commits, check results, and artifact proof from the PR."
      }
    ]
  },
  {
    "id": "source-control-ai-reviewability",
    "label": "Source control AI reviewability",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-source-control-ai-reviewability",
        "label": "Missing source control AI reviewability",
        "points": 0.1,
        "appliesWhen": "Reviewers cannot tell whether AI participated, what it reviewed, or how AI findings were resolved.",
        "evidenceRequired": "Cite PR review surfaces, issue comments, or missing AI review records.",
        "recommendation": "Add an AI participation and AI review status section to the PR review surface."
      },
      {
        "id": "incomplete-source-control-ai-reviewability",
        "label": "Incomplete source control AI reviewability",
        "points": 0.05,
        "appliesWhen": "AI participation exists but is ambiguous, not linked, or not separated from human-only decisions.",
        "evidenceRequired": "Cite the ambiguous source-control evidence.",
        "recommendation": "Separate human decisions, AI findings, and AI repair proof in source-control artifacts."
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

Cite exact issues, PRs, AI reviewer comments, check runs, repair comments, and merge evidence. If GitHub access is unavailable, treat GitHub-hosted participation evidence as absent for recent-change scoring.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-source-control-ai-participation-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
