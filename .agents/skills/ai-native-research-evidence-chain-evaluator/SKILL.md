---
name: ai-native-research-evidence-chain-evaluator
description: Evaluate whether research evidence can trace evaluator findings to repo repairs and observed development performance improvements.
---

# AI Native Research Evidence Chain Evaluator

Evaluate one thing: whether the project can trace eval findings through repairs to observed outcome changes while managing validity risks.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-research-evidence-chain-evaluator",
  "label": "Research evidence chain evaluator",
  "version": "0.1.0",
  "dimension": "research_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-research-evidence-chain-evaluator.children" }]
}
```

## Evidence

Inspect evaluator reports, repair issues/PRs, research plans, pilot artifacts, datasets, review sheets, command logs, screenshots/traces, validity notes, and evidence ledgers that connect evaluator findings to repo changes and measured outcomes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating research evidence-chain and validity readiness.

```ai-native-deduction-groups
[
  {
    "id": "finding-repair-outcome-trace",
    "label": "Finding repair outcome trace",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-finding-repair-outcome-trace",
        "label": "Missing finding repair outcome trace",
        "points": 0.2,
        "appliesWhen": "The project cannot trace evaluator findings to repo repairs and then to observed performance changes.",
        "evidenceRequired": "Cite missing links among evaluator outputs, repair work, and measured outcomes.",
        "recommendation": "Define an evidence ledger or artifact convention that records evaluator finding, repair action, validation command, and subsequent outcome."
      },
      {
        "id": "incomplete-finding-repair-outcome-trace",
        "label": "Incomplete finding repair outcome trace",
        "points": 0.1,
        "appliesWhen": "Some links exist but findings, repairs, or outcomes are not connected end to end.",
        "evidenceRequired": "Cite the partial trace and the missing link.",
        "recommendation": "Connect each high-priority evaluator deduction to a repair artifact and a later outcome measurement."
      },
      {
        "id": "unlinked-finding-repair-outcome-proof",
        "label": "Unlinked finding repair outcome proof",
        "points": 0.05,
        "appliesWhen": "Trace evidence exists but is not linked from the self-evaluation report, research plan, issue, or PR evidence.",
        "evidenceRequired": "Cite the evidence and the missing link path.",
        "recommendation": "Link finding-repair-outcome evidence from the artifacts reviewers use."
      }
    ]
  },
  {
    "id": "validity-risk-control",
    "label": "Validity risk control",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-validity-risk-control",
        "label": "Missing validity risk control",
        "points": 0.2,
        "appliesWhen": "The project does not identify or mitigate validity risks such as task leakage, agent variance, reviewer bias, selection bias, or process theater.",
        "evidenceRequired": "Cite missing threats-to-validity or mitigation artifacts.",
        "recommendation": "Add a validity-risk section that names concrete risks and mitigations for agent runs, tasks, reviewers, and evidence quality."
      },
      {
        "id": "incomplete-validity-risk-control",
        "label": "Incomplete validity risk control",
        "points": 0.1,
        "appliesWhen": "Validity risks are named but lack practical mitigations or checks.",
        "evidenceRequired": "Cite the partial risk list and missing controls.",
        "recommendation": "Add concrete controls such as matched tasks, fixed agent budgets, blind review, preregistered metrics, and artifact audits."
      },
      {
        "id": "unlinked-validity-risk-proof",
        "label": "Unlinked validity risk proof",
        "points": 0.05,
        "appliesWhen": "Validity controls exist but are not linked to study execution or review artifacts.",
        "evidenceRequired": "Cite controls and the missing execution linkage.",
        "recommendation": "Connect validity controls to the pilot protocol, task bank, reviewer rubric, and final report."
      }
    ]
  },
  {
    "id": "anti-process-theater-safeguard",
    "label": "Anti-process-theater safeguard",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-anti-process-theater-safeguard",
        "label": "Missing anti-process-theater safeguard",
        "points": 0.1,
        "appliesWhen": "The research plan can reward polished docs or eval scores without requiring observed development performance evidence.",
        "evidenceRequired": "Cite missing safeguards that separate documentation maturity from real outcome improvement.",
        "recommendation": "Require performance evidence and negative-result reporting before claiming eval-guided adoption improves outcomes."
      },
      {
        "id": "incomplete-anti-process-theater-safeguard",
        "label": "Incomplete anti-process-theater safeguard",
        "points": 0.05,
        "appliesWhen": "Safeguards exist but do not prevent cherry-picked artifacts or unsupported causal claims.",
        "evidenceRequired": "Cite partial safeguards and remaining process-theater risk.",
        "recommendation": "Add artifact sampling, preregistered metrics, and explicit rules for reporting null or negative pilot results."
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

Check whether the project can connect evaluator findings, repair actions, validation commands, later performance outcomes, validity controls, and negative-result safeguards.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-research-evidence-chain-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
