---
name: ai-native-eval-rubric-quality-evaluator
description: Evaluate whether AI Native Eval leaf evaluator rubrics are concrete, complete, non-overlapping, and repairable. Use only for evaluator-system self-evaluation.
---

# AI Native Eval Rubric Quality Evaluator

Evaluate one thing: whether evaluator rubrics are trustworthy scoring instruments rather than subjective review prose.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-rubric-quality-evaluator",
  "label": "Rubric quality evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-eval-rubric-quality-evaluator.children" }]
}
```

## Evidence

Inspect evaluator `SKILL.md` files, `ai-native-deduction-groups` fences, folder validation tests, report examples, self-evaluation outputs, and any docs explaining rubric design. For this evaluator-system project, specifically verify that leaf rubrics reserve half the score for recent-change follow-through and that missing GitHub access is treated as absent evidence for GitHub-hosted workflows.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating whether evaluator rubrics are specific, complete, and repair-oriented.

```ai-native-deduction-groups
[
  {
    "id": "rubric-operability",
    "label": "Rubric operability",
    "budget": 0.175,
    "deductions": [
      {
        "id": "missing-rubric-operability",
        "label": "Missing rubric operability",
        "points": 0.175,
        "appliesWhen": "Leaf evaluators lack structured deduction groups or rely on subjective scores.",
        "evidenceRequired": "Cite evaluator SKILL.md files or outputs showing missing deduction groups, direct scoring, or subjective score assignment.",
        "recommendation": "Convert leaf scoring into concrete deduction groups with evidence requirements and deterministic budgets."
      },
      {
        "id": "incomplete-rubric-operability",
        "label": "Incomplete rubric operability",
        "points": 0.09,
        "appliesWhen": "Deduction groups exist but some deductions are vague, hard to judge, or not tied to repairable evidence.",
        "evidenceRequired": "Cite specific deduction ids or rubric text that is too abstract or not actionable.",
        "recommendation": "Rewrite vague deductions so an evaluator can decide applies/not applies from cited evidence."
      },
      {
        "id": "unlinked-rubric-operability-proof",
        "label": "Unlinked rubric operability proof",
        "points": 0.045,
        "appliesWhen": "Rubrics exist but tests or self-evaluation artifacts do not prove they are used by actual folder outputs.",
        "evidenceRequired": "Cite the rubric and the missing or partial validation/report evidence.",
        "recommendation": "Add fixtures or self-eval outputs that exercise the rubric in a rendered report."
      },
      {
        "id": "missing-recent-change-rubric-rule",
        "label": "Missing recent-change rubric rule",
        "points": 0.175,
        "appliesWhen": "Leaf evaluator rubrics do not reserve half of each leaf score for recent PR-equivalent change follow-through, or they allow missing GitHub access to be treated as neutral for GitHub-hosted issue, PR, review, check, artifact, or human-gate workflows.",
        "evidenceRequired": "Cite leaf evaluator SKILL.md files, packaging tests, or self-evaluation outputs showing the missing 0.5 recent-change budget, missing GitHub-access rule, or missing recent-change deduction.",
        "recommendation": "Require every leaf rubric to include a 0.5 recent-change follow-through group and to treat unavailable GitHub evidence as absent when GitHub is the workflow source."
      }
    ]
  },
  {
    "id": "deduction-budget-completeness",
    "label": "Deduction budget completeness",
    "budget": 0.175,
    "deductions": [
      {
        "id": "missing-budget-completeness",
        "label": "Missing budget completeness",
        "points": 0.175,
        "appliesWhen": "Rubric groups can leave fallback points when the required capability is entirely absent.",
        "evidenceRequired": "Cite deduction groups whose deductions cannot consume the full group budget.",
        "recommendation": "Add full-missing deductions that can consume the full group budget."
      },
      {
        "id": "incomplete-budget-completeness",
        "label": "Incomplete budget completeness",
        "points": 0.09,
        "appliesWhen": "Most groups can deduct the full group budget, but coverage is uneven or not enforced for every leaf.",
        "evidenceRequired": "Cite validation tests or specific rubric groups that only partially prove budget completeness.",
        "recommendation": "Extend validation and rubric review until every leaf group has full-missing coverage."
      },
      {
        "id": "overlapping-budget-risk",
        "label": "Overlapping budget risk",
        "points": 0.045,
        "appliesWhen": "Deductions can double-penalize the same failure without a clear group cap or boundary.",
        "evidenceRequired": "Cite overlapping deductions or missing guidance that could cause duplicate penalties.",
        "recommendation": "Clarify group boundaries and use capped groups for same-cause failures."
      }
    ]
  },
  {
    "id": "repair-guidance-quality",
    "label": "Repair guidance quality",
    "budget": 0.15,
    "deductions": [
      {
        "id": "missing-repair-guidance",
        "label": "Missing repair guidance",
        "points": 0.15,
        "appliesWhen": "Applied deductions do not tell an agent what to fix or what evidence would close the gap.",
        "evidenceRequired": "Cite deduction outputs or reports with missing recommendations or unrepairable reasons.",
        "recommendation": "Require every applied deduction to include repair-oriented guidance."
      },
      {
        "id": "incomplete-repair-guidance",
        "label": "Incomplete repair guidance",
        "points": 0.075,
        "appliesWhen": "Recommendations exist but are too generic to guide the next concrete change.",
        "evidenceRequired": "Cite generic recommendations or missing evidence-to-action links.",
        "recommendation": "Make recommendations name the next durable artifact, test, doc, or rubric change."
      },
      {
        "id": "unlinked-repair-proof",
        "label": "Unlinked repair proof",
        "points": 0.04,
        "appliesWhen": "Reports provide guidance but do not link to prompts, evidence, or tests that help an agent repair the finding.",
        "evidenceRequired": "Cite report or renderer behavior showing incomplete repair linkage.",
        "recommendation": "Connect report deductions to copy prompts or targeted repair workflows."
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

Check rubric specificity, group budget completeness, full-missing deductions, overlap risk, whether recommendations are directly repairable, and whether every leaf rubric preserves the 0.5 recent-change follow-through budget with missing GitHub access treated as absent evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-eval-rubric-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
