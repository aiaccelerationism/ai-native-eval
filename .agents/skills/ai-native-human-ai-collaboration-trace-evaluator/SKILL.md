---
name: ai-native-human-ai-collaboration-trace-evaluator
description: Evaluate whether human decisions, AI actions, AI review, repairs, skipped gates, and merge decisions are traceable as one collaboration loop.
---

# AI Native Human-AI Collaboration Trace Evaluator

Evaluate one thing: whether humans and AI leave a reviewable collaboration trace.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-human-ai-collaboration-trace-evaluator",
  "label": "Human-AI collaboration trace evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-human-ai-collaboration-trace-evaluator.children" }]
}
```

## Evidence

Inspect issues, PRs, reviews, agent summaries, human decision notes, AI review findings, repair commits, skipped-gate rationale, merge records, and recent PR-equivalent changes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating collaboration trace.

```ai-native-deduction-groups
[
  {
    "id": "collaboration-trace-configuration",
    "label": "Collaboration trace configuration",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-collaboration-trace-configuration",
        "label": "Missing collaboration trace configuration",
        "points": 0.2,
        "appliesWhen": "The repository does not require human decisions, AI actions, AI review, repairs, and merge decisions to be traceable together.",
        "evidenceRequired": "Cite issue templates, PR templates, review docs, closeout docs, or missing collaboration trace rules.",
        "recommendation": "Add a collaboration trace section that separates human decisions, AI actions, review findings, repairs, and merge decisions."
      },
      {
        "id": "incomplete-collaboration-trace-configuration",
        "label": "Incomplete collaboration trace configuration",
        "points": 0.1,
        "appliesWhen": "Collaboration trace rules exist but omit AI review, human-only decisions, repair commits, skipped gates, or unresolved gaps.",
        "evidenceRequired": "Cite the partial collaboration trace rule.",
        "recommendation": "Expand collaboration trace fields to cover the full human-AI loop."
      }
    ]
  },
  {
    "id": "collaboration-trace-execution",
    "label": "Collaboration trace execution",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-collaboration-trace-execution",
        "label": "Missing collaboration trace execution",
        "points": 0.2,
        "appliesWhen": "Recent substantive work does not show the human-AI loop from request through review, repair, validation, and merge.",
        "evidenceRequired": "Cite recent issues, PRs, reviews, commits, agent summaries, or missing GitHub access.",
        "recommendation": "Require PRs to summarize the collaboration loop and link evidence for each stage."
      },
      {
        "id": "incomplete-collaboration-trace-execution",
        "label": "Incomplete collaboration trace execution",
        "points": 0.1,
        "appliesWhen": "The collaboration trace exists but misses a key stage such as human decision, AI review, repair, validation, or merge rationale.",
        "evidenceRequired": "Cite the partial collaboration trace evidence.",
        "recommendation": "Fill the missing collaboration stage before merge or record a human-owned exception."
      }
    ]
  },
  {
    "id": "collaboration-trace-reviewability",
    "label": "Collaboration trace reviewability",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-collaboration-trace-reviewability",
        "label": "Missing collaboration trace reviewability",
        "points": 0.1,
        "appliesWhen": "Reviewers cannot distinguish human input, AI output, AI review, and human-only approval decisions.",
        "evidenceRequired": "Cite PRs, reviews, comments, or missing collaboration trace evidence.",
        "recommendation": "Separate human input, AI execution, AI review, human decisions, and validation evidence."
      },
      {
        "id": "incomplete-collaboration-trace-reviewability",
        "label": "Incomplete collaboration trace reviewability",
        "points": 0.05,
        "appliesWhen": "The trace exists but is too narrative or buried for a reviewer or next agent to audit quickly.",
        "evidenceRequired": "Cite hard-to-audit collaboration trace evidence.",
        "recommendation": "Use structured collaboration trace fields in PRs and issue closeout."
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

Cite exact human decisions, AI actions, AI review findings, repairs, validation proof, skipped gates, and merge evidence. Penalize completed work when the collaboration trace is unreviewable.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-human-ai-collaboration-trace-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
