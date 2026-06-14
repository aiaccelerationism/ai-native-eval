---
name: ai-native-eval-aggregation-integrity-evaluator
description: Evaluate whether AI Native Eval scoring is deterministic, validated, config-auditable, and protected from subjective final score assignment. Use only for evaluator-system self-evaluation.
---

# AI Native Eval Aggregation Integrity Evaluator

Evaluate one thing: whether evaluation outputs are aggregated deterministically from validated leaf judgments.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-aggregation-integrity-evaluator",
  "label": "Aggregation integrity evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-eval-aggregation-integrity-evaluator.children" }]
}
```

## Evidence

Inspect aggregation source, folder validation source, config resolution source, CLI behavior, deterministic tests, fixture reports, and self-evaluation run snapshots. For this evaluator-system project, specifically verify that folder validation requires explicit judgments for every rubric group so recent-change follow-through cannot be silently omitted from leaf outputs.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating scoring determinism, validation gates, and config auditability.

```ai-native-deduction-groups
[
  {
    "id": "deterministic-score-path",
    "label": "Deterministic score path",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-deterministic-score-path",
        "label": "Missing deterministic score path",
        "points": 0.2,
        "appliesWhen": "Final scores are assigned directly by AI or hand-authored reports rather than calculated from normalized evaluator nodes.",
        "evidenceRequired": "Cite source, tests, or evaluator outputs showing direct score assignment or missing aggregation.",
        "recommendation": "Route all final scoring through deterministic aggregation of validated nodes."
      },
      {
        "id": "incomplete-deterministic-score-path",
        "label": "Incomplete deterministic score path",
        "points": 0.1,
        "appliesWhen": "Aggregation exists but legacy/manual score paths remain available without sufficient guardrails or tests.",
        "evidenceRequired": "Cite legacy scoring paths, tests, or docs showing the partial guardrail.",
        "recommendation": "Constrain legacy scoring to explicit backward-compatible fixtures and prefer rubric judgments for new outputs."
      },
      {
        "id": "unproven-deterministic-repeatability",
        "label": "Unproven deterministic repeatability",
        "points": 0.05,
        "appliesWhen": "The same input is not tested for stable score/render output across repeated runs.",
        "evidenceRequired": "Cite missing or partial deterministic tests.",
        "recommendation": "Add repeatability tests for score and render output from the same folder input."
      }
    ]
  },
  {
    "id": "validation-gate-integrity",
    "label": "Validation gate integrity",
    "budget": 0.175,
    "deductions": [
      {
        "id": "missing-validation-gate-integrity",
        "label": "Missing validation gate integrity",
        "points": 0.175,
        "appliesWhen": "Invalid evaluator outputs can be rendered or scored without failing validation.",
        "evidenceRequired": "Cite renderer, CLI, tests, or fixtures showing invalid folders are accepted.",
        "recommendation": "Block render and score operations when folder validation reports errors."
      },
      {
        "id": "incomplete-validation-gate-integrity",
        "label": "Incomplete validation gate integrity",
        "points": 0.09,
        "appliesWhen": "Validation exists but does not cover an important class such as disabled outputs, unreachable outputs, wrong filenames, unknown deduction ids, or missing enabled leaves.",
        "evidenceRequired": "Cite missing validation cases or tests.",
        "recommendation": "Add validation coverage for the missing output-contract class."
      },
      {
        "id": "unclear-validation-error-repair",
        "label": "Unclear validation error repair",
        "points": 0.045,
        "appliesWhen": "Validation errors exist but are not actionable enough for an agent to repair only the failing leaf outputs.",
        "evidenceRequired": "Cite validation output or docs showing unclear repair guidance.",
        "recommendation": "Report all validation errors with exact file, plugin id, and expected contract."
      },
      {
        "id": "missing-required-group-judgment-validation",
        "label": "Missing required group judgment validation",
        "points": 0.175,
        "appliesWhen": "Folder validation allows a leaf evaluator output to omit an entire rubric group, which would let recent-change follow-through or another required scoring group default to no deduction.",
        "evidenceRequired": "Cite folder validation source, fixtures, or tests showing missing enforcement for explicit group judgments.",
        "recommendation": "Require each leaf output to include at least one judgment for every rubric group and test the missing-group failure path."
      }
    ]
  },
  {
    "id": "config-auditability",
    "label": "Config auditability",
    "budget": 0.125,
    "deductions": [
      {
        "id": "missing-config-auditability",
        "label": "Missing config auditability",
        "points": 0.125,
        "appliesWhen": "Run snapshots do not record effective roots, disabled plugins, config sources, or config hash.",
        "evidenceRequired": "Cite run.json, config source, or report output showing missing audit data.",
        "recommendation": "Persist effective config and config hash in every run snapshot."
      },
      {
        "id": "incomplete-config-auditability",
        "label": "Incomplete config auditability",
        "points": 0.065,
        "appliesWhen": "Effective config is recorded but source-controlled project config, explicit overrides, or disabled subtree rationale is incomplete.",
        "evidenceRequired": "Cite partial config snapshot or missing rationale.",
        "recommendation": "Record project config sources and disable reasons in the run snapshot and report."
      },
      {
        "id": "unlinked-config-auditability",
        "label": "Unlinked config auditability",
        "points": 0.03,
        "appliesWhen": "Config audit data exists but is not visible in the report or committed evidence.",
        "evidenceRequired": "Cite run snapshot and report evidence showing the visibility gap.",
        "recommendation": "Expose run configuration in reports and committed self-evaluation artifacts."
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

Check deterministic aggregation, validation failure behavior, required judgment coverage for every rubric group, legacy score fallback usage, config snapshots, disabled subtree handling, and confidence separation from points.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-eval-aggregation-integrity-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
