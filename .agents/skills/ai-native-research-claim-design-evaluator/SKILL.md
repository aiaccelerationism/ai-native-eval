---
name: ai-native-research-claim-design-evaluator
description: Evaluate research claim clarity, comparison groups, intervention design, and pilot feasibility for proving eval-guided AI-native adoption.
---

# AI Native Research Claim Design Evaluator

Evaluate one thing: whether the project states a testable research claim and study design for eval-guided AI-native adoption.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-research-claim-design-evaluator",
  "label": "Research claim and design evaluator",
  "version": "0.1.0",
  "dimension": "research_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-research-claim-design-evaluator.children" }]
}
```

## Evidence

Inspect research plans, experiment protocols, task specs, issue/PR plans, evaluator reports, pilot notes, and docs that define baseline, self-declared AI-native, and eval-guided AI-native conditions.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating research claim and study design readiness.

```ai-native-deduction-groups
[
  {
    "id": "claim-and-comparison-clarity",
    "label": "Claim and comparison clarity",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-claim-and-comparison-clarity",
        "label": "Missing claim and comparison clarity",
        "points": 0.2,
        "appliesWhen": "The project does not state a testable claim comparing baseline, self-declared AI-native, and eval-guided AI-native adoption.",
        "evidenceRequired": "Cite research plans, docs, issues, or evaluator artifacts showing the missing or untestable claim.",
        "recommendation": "Write a research claim that distinguishes informal AI-native intent from eval-guided adoption and names expected outcomes."
      },
      {
        "id": "incomplete-claim-and-comparison-clarity",
        "label": "Incomplete claim and comparison clarity",
        "points": 0.1,
        "appliesWhen": "The claim exists but comparison groups, intervention boundaries, or expected direction of effect are ambiguous.",
        "evidenceRequired": "Cite the partial claim and the missing comparison detail.",
        "recommendation": "Tighten the claim until another reviewer can tell what would count as a positive or negative result."
      },
      {
        "id": "unlinked-claim-and-comparison-proof",
        "label": "Unlinked claim and comparison proof",
        "points": 0.05,
        "appliesWhen": "The claim exists but is not linked from the evaluator, research plan, issue, PR, or self-evaluation workflow where agents need it.",
        "evidenceRequired": "Cite both the claim artifact and the missing link path.",
        "recommendation": "Link the research claim from the research evaluator and project planning workflow."
      }
    ]
  },
  {
    "id": "study-design-operability",
    "label": "Study design operability",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-study-design-operability",
        "label": "Missing study design operability",
        "points": 0.2,
        "appliesWhen": "The project lacks an experimental, before/after, or ablation design that can be executed by humans and agents.",
        "evidenceRequired": "Cite missing protocols, task sets, assignment rules, or intervention descriptions.",
        "recommendation": "Define the minimum executable study design, including conditions, task selection, agent budget, and reviewer role."
      },
      {
        "id": "incomplete-study-design-operability",
        "label": "Incomplete study design operability",
        "points": 0.1,
        "appliesWhen": "A study design exists but leaves high-impact choices to future judgment, such as task matching, agent model, or review rubric.",
        "evidenceRequired": "Cite the design and unresolved execution choices.",
        "recommendation": "Make the study protocol decision complete enough for another agent to run without inventing methodology."
      },
      {
        "id": "unlinked-study-design-proof",
        "label": "Unlinked study design proof",
        "points": 0.05,
        "appliesWhen": "Study design notes exist but are not connected to eval reports, tasks, or review artifacts.",
        "evidenceRequired": "Cite existing notes and the missing execution linkage.",
        "recommendation": "Connect study design artifacts to the eval run, task bank, and review workflow."
      }
    ]
  },
  {
    "id": "pilot-feasibility",
    "label": "Pilot feasibility",
    "budget": 0.1,
    "deductions": [
      {
        "id": "missing-pilot-feasibility",
        "label": "Missing pilot feasibility",
        "points": 0.1,
        "appliesWhen": "The project does not define a small pilot that can fail usefully before a full paper-scale study.",
        "evidenceRequired": "Cite the absence of pilot repo, task count, run budget, or review plan.",
        "recommendation": "Define a pilot with a small repo/task set, strict success criteria, and explicit learning goals."
      },
      {
        "id": "incomplete-pilot-feasibility",
        "label": "Incomplete pilot feasibility",
        "points": 0.05,
        "appliesWhen": "A pilot is proposed but lacks enough constraints to estimate effort or interpret failure.",
        "evidenceRequired": "Cite the partial pilot and missing feasibility constraints.",
        "recommendation": "Add pilot scope, task count, run budget, and stop/go criteria."
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

Check whether the project defines the eval-guided adoption claim, comparison conditions, executable study design, pilot scope, and decision-complete protocol boundaries.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-research-claim-design-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
