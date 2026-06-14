---
name: ai-native-research-performance-metrics-evaluator
description: Evaluate whether AI Native Eval research defines measurable performance outcomes for eval-guided AI-native adoption.
---

# AI Native Research Performance Metrics Evaluator

Evaluate one thing: whether the project defines objective performance metrics that can show whether eval-guided AI-native adoption improves development outcomes.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-research-performance-metrics-evaluator",
  "label": "Research performance metrics evaluator",
  "version": "0.1.0",
  "dimension": "research_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-research-performance-metrics-evaluator.children" }]
}
```

## Evidence

Inspect research plans, metric definitions, task rubrics, reviewer sheets, eval reports, command logs, CI artifacts, PR evidence, and datasets that measure agent task success, repair loops, reviewer time, evidence completeness, command failures, handoff resumability, rework, or recurrence.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating research performance metrics.

```ai-native-deduction-groups
[
  {
    "id": "outcome-metric-definition",
    "label": "Outcome metric definition",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-outcome-metric-definition",
        "label": "Missing outcome metric definition",
        "points": 0.2,
        "appliesWhen": "The project does not define measurable outcomes for agent-assisted development performance.",
        "evidenceRequired": "Cite research docs, task protocols, reviewer rubrics, or datasets showing the missing metric definitions.",
        "recommendation": "Define primary and secondary metrics such as task success, acceptance pass rate, repair loops, reviewer time, and missing evidence count."
      },
      {
        "id": "incomplete-outcome-metric-definition",
        "label": "Incomplete outcome metric definition",
        "points": 0.1,
        "appliesWhen": "Metrics are named but lack operational definitions, units, collection timing, or pass/fail thresholds.",
        "evidenceRequired": "Cite the partial metric definitions and missing operational detail.",
        "recommendation": "Make each metric collectable from a task run, PR review, CI artifact, or evaluator output without later interpretation."
      },
      {
        "id": "unlinked-outcome-metric-proof",
        "label": "Unlinked outcome metric proof",
        "points": 0.05,
        "appliesWhen": "Metric definitions exist but are not linked from task templates, review sheets, or eval artifacts.",
        "evidenceRequired": "Cite metric docs and the missing workflow linkage.",
        "recommendation": "Link metric definitions to the exact artifacts that collect them."
      }
    ]
  },
  {
    "id": "data-collection-operability",
    "label": "Data collection operability",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-data-collection-operability",
        "label": "Missing data collection operability",
        "points": 0.2,
        "appliesWhen": "The project lacks a dataset, run log, review sheet, or artifact schema for collecting research metrics.",
        "evidenceRequired": "Cite missing data templates, storage paths, schemas, or collection instructions.",
        "recommendation": "Create a minimal data collection artifact that records task, condition, agent run, reviewer assessment, commands, evidence, and outcomes."
      },
      {
        "id": "incomplete-data-collection-operability",
        "label": "Incomplete data collection operability",
        "points": 0.1,
        "appliesWhen": "Data collection exists but leaves important fields optional, unstructured, or hard to compare across conditions.",
        "evidenceRequired": "Cite the partial collection artifact and missing comparable fields.",
        "recommendation": "Standardize the metric collection fields across baseline, self-declared, and eval-guided conditions."
      },
      {
        "id": "unlinked-data-collection-proof",
        "label": "Unlinked data collection proof",
        "points": 0.05,
        "appliesWhen": "Collection artifacts exist but are not linked from the experiment protocol, task bank, or report.",
        "evidenceRequired": "Cite the artifact and missing link path.",
        "recommendation": "Connect data collection artifacts to the study protocol and eval report evidence."
      }
    ]
  },
  {
    "id": "metric-quality-control",
    "label": "Metric quality control",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-metric-quality-control",
        "label": "Missing metric quality control",
        "points": 0.1,
        "appliesWhen": "The project lacks reviewer calibration, blinded review rules, duplicate coding, or checks for subjective metrics.",
        "evidenceRequired": "Cite missing calibration or reliability controls for reviewer time, confidence, defect detection, or evidence quality.",
        "recommendation": "Define quality controls for subjective measurements, including reviewer rubric, calibration examples, and disagreement handling."
      },
      {
        "id": "incomplete-metric-quality-control",
        "label": "Incomplete metric quality control",
        "points": 0.05,
        "appliesWhen": "Quality controls exist but do not cover the most subjective or bias-prone metrics.",
        "evidenceRequired": "Cite the partial controls and uncovered subjective metrics.",
        "recommendation": "Add calibration and reliability checks for each subjective outcome used in the claim."
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

Check whether metrics are objective, comparable across conditions, collectable from durable artifacts, calibrated for reviewer judgment, and tied to the eval-guided adoption claim.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-research-performance-metrics-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
