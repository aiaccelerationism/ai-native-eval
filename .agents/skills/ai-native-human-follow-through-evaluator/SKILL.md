---
name: ai-native-human-follow-through-evaluator
description: Evaluate whether humans follow the repository's AI-native issue, PR, review, gate, and evidence rules, and whether agents push back when humans skip required process.
---

# AI Native Human Follow-Through Evaluator

Evaluate one thing: whether human collaborators actually follow the AI-native workflow and whether agents enforce it when they do not.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-human-follow-through-evaluator",
  "label": "Human follow-through evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-human-follow-through-evaluator.children" }]
}
```

## Evidence

Inspect issue bodies, human comments, PR descriptions, review decisions, skip-gate notes, agent pushback, human-only decisions, and recent PR-equivalent changes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating human follow-through.

```ai-native-deduction-groups
[
  {
    "id": "human-follow-through-configuration",
    "label": "Human follow-through configuration",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-human-follow-through-configuration",
        "label": "Missing human follow-through configuration",
        "points": 0.2,
        "appliesWhen": "The repository does not define human responsibilities for issue readiness, review verdicts, skip gates, evidence requests, or human-only decisions.",
        "evidenceRequired": "Cite contributor docs, issue/PR templates, reviewer contracts, or missing human responsibility rules.",
        "recommendation": "Define human responsibilities and required evidence in issue, PR, and review workflows."
      },
      {
        "id": "incomplete-human-follow-through-configuration",
        "label": "Incomplete human follow-through configuration",
        "points": 0.1,
        "appliesWhen": "Human responsibilities exist but omit agent-ready issue context, PASS/WARN/BLOCK review, skip gate rationale, or evidence requirements.",
        "evidenceRequired": "Cite the partial human workflow rule.",
        "recommendation": "Tighten human workflow rules until agents can enforce missing fields without guessing."
      }
    ]
  },
  {
    "id": "human-follow-through-execution",
    "label": "Human follow-through execution",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-human-follow-through-execution",
        "label": "Missing human follow-through execution",
        "points": 0.2,
        "appliesWhen": "Recent substantive work shows humans bypassing required issue, PR, review, gate, or evidence practices.",
        "evidenceRequired": "Cite recent issues, PRs, reviews, comments, or missing access evidence.",
        "recommendation": "Make human-required fields blocking or explicitly document owner-approved skips."
      },
      {
        "id": "incomplete-human-follow-through-execution",
        "label": "Incomplete human follow-through execution",
        "points": 0.1,
        "appliesWhen": "Humans follow some workflow rules but repeatedly omit context, evidence, review verdicts, or gate rationale.",
        "evidenceRequired": "Cite the partial human follow-through evidence.",
        "recommendation": "Add review or template checks that catch recurring human omissions."
      }
    ]
  },
  {
    "id": "agent-enforcement-of-human-follow-through",
    "label": "Agent enforcement of human follow-through",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-agent-enforcement-of-human-follow-through",
        "label": "Missing agent enforcement of human follow-through",
        "points": 0.1,
        "appliesWhen": "Humans skip required workflow steps and agents continue without asking for missing context, evidence, or owner decisions.",
        "evidenceRequired": "Cite agent thread, PR, or review evidence showing missing pushback.",
        "recommendation": "Instruct agents to stop or mark low-confidence when humans skip required workflow evidence."
      },
      {
        "id": "incomplete-agent-enforcement-of-human-follow-through",
        "label": "Incomplete agent enforcement of human follow-through",
        "points": 0.05,
        "appliesWhen": "Agents sometimes request missing human follow-through but do not consistently record or enforce it.",
        "evidenceRequired": "Cite inconsistent agent pushback.",
        "recommendation": "Make agent pushback and unresolved human gaps visible in PR evidence."
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

Cite exact human issue/PR/review behavior, skipped gates, human-only decisions, and agent pushback evidence. If work is completed but humans skipped required AI-native process and the agent did not enforce it, score the process poorly.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-human-follow-through-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
