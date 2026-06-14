---
name: ai-native-skill-activation-depth-evaluator
description: Evaluate whether substantive work consistently triggers relevant skills early, records skill use in issues and PRs, and updates skills or skill evals when misses recur.
---

# AI Native Skill Activation Depth Evaluator

Evaluate one thing: whether AI work is skill-backed in practice rather than manually improvised.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-skill-activation-depth-evaluator",
  "label": "Skill activation depth evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-skill-activation-depth-evaluator.children" }]
}
```

## Evidence

Inspect issue skill hints, agent thread notes, PR skill lists, skill eval evidence, review comments, recurrence-prevention updates, and recent PR-equivalent changes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating skill activation depth.

```ai-native-deduction-groups
[
  {
    "id": "skill-activation-configuration",
    "label": "Skill activation configuration",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-skill-activation-configuration",
        "label": "Missing skill activation configuration",
        "points": 0.2,
        "appliesWhen": "The repository does not require issues, PRs, or agent threads to name relevant skills or explain why no skill was needed.",
        "evidenceRequired": "Cite issue templates, PR templates, agent docs, skill routing docs, or missing workflow rules.",
        "recommendation": "Add required skill activation fields to issue, PR, and thread evidence surfaces."
      },
      {
        "id": "incomplete-skill-activation-configuration",
        "label": "Incomplete skill activation configuration",
        "points": 0.1,
        "appliesWhen": "Skill activation rules exist but do not require early activation, no-skill-needed justification, or skill eval updates for repeated misses.",
        "evidenceRequired": "Cite the partial skill routing rule.",
        "recommendation": "Require early skill selection, explicit no-skill-needed cases, and durable skill updates for repeated misses."
      }
    ]
  },
  {
    "id": "skill-activation-execution",
    "label": "Skill activation execution",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-skill-activation-execution",
        "label": "Missing skill activation execution",
        "points": 0.2,
        "appliesWhen": "Recent substantive work does not show relevant skills being selected, read, or applied before implementation/review.",
        "evidenceRequired": "Cite recent issues, PRs, thread notes, or missing skill activation evidence.",
        "recommendation": "Record skill activation and skill-read evidence in every substantive PR."
      },
      {
        "id": "incomplete-skill-activation-execution",
        "label": "Incomplete skill activation execution",
        "points": 0.1,
        "appliesWhen": "Skills are mentioned but used late, only after human prompting, or without evidence that the skill instructions shaped the work.",
        "evidenceRequired": "Cite the partial skill activation evidence and user prompting burden.",
        "recommendation": "Move skill routing to issue/thread bootstrap and record when human prompts had to trigger missed skills."
      }
    ]
  },
  {
    "id": "skill-activation-learning",
    "label": "Skill activation learning",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-skill-activation-learning",
        "label": "Missing skill activation learning",
        "points": 0.1,
        "appliesWhen": "Missed or late skill activation does not lead to updated skills, skill evals, known issues, or routing docs.",
        "evidenceRequired": "Cite repeated misses, review comments, or missing durable learning artifacts.",
        "recommendation": "Turn repeated skill activation misses into skill evals, routing docs, or known issue guidance."
      },
      {
        "id": "incomplete-skill-activation-learning",
        "label": "Incomplete skill activation learning",
        "points": 0.05,
        "appliesWhen": "Learning artifacts exist but are not linked from the issue/PR/thread where the miss happened.",
        "evidenceRequired": "Cite the partial learning evidence and missing linkage.",
        "recommendation": "Link skill updates back to the PR or issue that exposed the miss."
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

Cite exact issue, PR, thread, skill, skill eval, or known-issue evidence. Penalize workflows where humans must repeatedly remind the agent to use the relevant skill.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-skill-activation-depth-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
