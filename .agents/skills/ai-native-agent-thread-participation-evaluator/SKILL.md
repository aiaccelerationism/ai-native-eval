---
name: ai-native-agent-thread-participation-evaluator
description: Evaluate whether agent threads such as Codex are first-class execution records with bootstrap, skill use, command evidence, repair loops, and closeout rather than invisible chat memory.
---

# AI Native Agent Thread Participation Evaluator

Evaluate one thing: whether substantive work preserves agent-thread participation evidence.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-agent-thread-participation-evaluator",
  "label": "Agent thread participation evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-agent-thread-participation-evaluator.children" }]
}
```

## Evidence

Inspect agent thread summaries, issue comments, PR bodies, handoff notes, command evidence, repair loops, closeout summaries, and recent PR-equivalent changes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating agent-thread participation.

```ai-native-deduction-groups
[
  {
    "id": "agent-thread-configuration",
    "label": "Agent thread configuration",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-agent-thread-configuration",
        "label": "Missing agent thread configuration",
        "points": 0.2,
        "appliesWhen": "The repository does not require agent threads to record bootstrap context, selected skills, commands, repair loops, and closeout.",
        "evidenceRequired": "Cite agent instructions, issue templates, PR templates, thread docs, or missing workflow docs.",
        "recommendation": "Add agent-thread participation fields to issue/PR templates and agent closeout instructions."
      },
      {
        "id": "incomplete-agent-thread-configuration",
        "label": "Incomplete agent thread configuration",
        "points": 0.1,
        "appliesWhen": "Agent-thread expectations exist but omit important surfaces such as skill routing, command proof, repair loops, or handoff state.",
        "evidenceRequired": "Cite the partial agent-thread guidance and the missing field.",
        "recommendation": "Tighten thread templates until another agent can continue from persisted evidence."
      }
    ]
  },
  {
    "id": "agent-thread-execution",
    "label": "Agent thread execution",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-agent-thread-execution",
        "label": "Missing agent thread execution",
        "points": 0.2,
        "appliesWhen": "Recent substantive work does not preserve agent-thread execution evidence even when an agent participated.",
        "evidenceRequired": "Cite recent issues, PRs, comments, commits, or missing thread summaries.",
        "recommendation": "Require every substantive PR to link or summarize the agent thread that executed the work."
      },
      {
        "id": "incomplete-agent-thread-execution",
        "label": "Incomplete agent thread execution",
        "points": 0.1,
        "appliesWhen": "Agent-thread evidence exists but omits command results, repair iterations, user prompting burden, or remaining work.",
        "evidenceRequired": "Cite the partial execution evidence and the missing proof.",
        "recommendation": "Make agent thread closeout include commands, repair loops, and continuation state."
      }
    ]
  },
  {
    "id": "agent-thread-reviewability",
    "label": "Agent thread reviewability",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-agent-thread-reviewability",
        "label": "Missing agent thread reviewability",
        "points": 0.1,
        "appliesWhen": "Reviewers cannot tell what the agent did, what the human decided, or what evidence came from the agent thread.",
        "evidenceRequired": "Cite PRs, thread summaries, review comments, or missing handoff artifacts.",
        "recommendation": "Separate agent actions, human decisions, and proof artifacts in PR evidence."
      },
      {
        "id": "incomplete-agent-thread-reviewability",
        "label": "Incomplete agent thread reviewability",
        "points": 0.05,
        "appliesWhen": "Agent work is visible but hard to review because evidence is buried in prose or not linked to the PR.",
        "evidenceRequired": "Cite the hard-to-review evidence surface.",
        "recommendation": "Link thread evidence from the PR review surface."
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

Cite exact issue, PR, thread, comment, command, or handoff evidence. Distinguish missing agent-thread configuration from recent work that bypassed the configured thread process.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-agent-thread-participation-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
