---
name: ai-native-review-contract-evaluator
description: Evaluate review contracts for AI-native repo maturity. Use when scoring whether reviewers know what evidence, gates, verdicts, and P0/P1/P2 findings mean.
---

# AI Native Review Contract Evaluator

Evaluate one thing: whether the repo has a clear review contract and applies it in review evidence.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-review-contract-evaluator",
  "label": "Review contract evaluator",
  "version": "0.1.0",
  "dimension": "github_workflow",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-review-contract-evaluator.children" }]
}
```

## Evidence

Inspect reviewer contract docs, review skill instructions, PR review comments, required statuses, severity definitions, and resolution records.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating review evidence, gates, verdicts, severity levels, and P0/P1/P2 expectations.

```ai-native-deduction-groups
[
  {
    "id": "review-surface",
    "label": "Review surface",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-review-surface",
        "label": "Missing review surface",
        "points": 0.2,
        "appliesWhen": "The repository reviewers are not told what evidence, artifacts, or scope they must inspect.",
        "evidenceRequired": "Cite reviewer contract docs, PR templates, AI reviewer docs, review comments, and merge policies that show the missing review contracts requirement.",
        "recommendation": "Add explicit review contracts guidance for review surface."
      },
      {
        "id": "incomplete-review-surface",
        "label": "Incomplete review surface",
        "points": 0.1,
        "appliesWhen": "The repository review surface exists but omits important work types.",
        "evidenceRequired": "Cite the partial review contracts evidence and the specific gap.",
        "recommendation": "Tighten the review surface guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-review-surface",
        "label": "Unlinked review surface evidence",
        "points": 0.05,
        "appliesWhen": "Review contracts evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the review contracts evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "severity-and-verdicts",
    "label": "Severity and verdicts",
    "budget": 0.175,
    "deductions": [
      {
        "id": "missing-severity-and-verdicts",
        "label": "Missing severity and verdicts",
        "points": 0.175,
        "appliesWhen": "The repository review docs do not define severity levels or merge-blocking verdicts.",
        "evidenceRequired": "Cite reviewer contract docs, PR templates, AI reviewer docs, review comments, and merge policies that show the missing review contracts requirement.",
        "recommendation": "Add explicit review contracts guidance for severity and verdicts."
      },
      {
        "id": "incomplete-severity-and-verdicts",
        "label": "Incomplete severity and verdicts",
        "points": 0.09,
        "appliesWhen": "The repository definitions exist but implications are ambiguous.",
        "evidenceRequired": "Cite the partial review contracts evidence and the specific gap.",
        "recommendation": "Tighten the severity and verdicts guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-severity-and-verdicts",
        "label": "Unlinked severity and verdicts evidence",
        "points": 0.045,
        "appliesWhen": "Review contracts evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the review contracts evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "review-followthrough",
    "label": "Review follow-through",
    "budget": 0.125,
    "deductions": [
      {
        "id": "missing-review-followthrough",
        "label": "Missing review follow-through",
        "points": 0.125,
        "appliesWhen": "The repository review findings do not have clear fix, exception, or escalation rules.",
        "evidenceRequired": "Cite reviewer contract docs, PR templates, AI reviewer docs, review comments, and merge policies that show the missing review contracts requirement.",
        "recommendation": "Add explicit review contracts guidance for review follow-through."
      },
      {
        "id": "incomplete-review-followthrough",
        "label": "Incomplete review follow-through",
        "points": 0.065,
        "appliesWhen": "The repository follow-through exists but lacks auditability or owner approval requirements.",
        "evidenceRequired": "Cite the partial review contracts evidence and the specific gap.",
        "recommendation": "Tighten the review follow-through guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-review-followthrough",
        "label": "Unlinked review follow-through evidence",
        "points": 0.03,
        "appliesWhen": "Review contracts evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the review contracts evidence from the workflow where agents need it."
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

Cite exact contract docs or review records and identify missing reviewer expectations.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-review-contract-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
