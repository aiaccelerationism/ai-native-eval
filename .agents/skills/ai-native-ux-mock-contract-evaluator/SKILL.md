---
name: ai-native-ux-mock-contract-evaluator
description: Evaluate UX mock contract discipline for AI-native repo maturity. Use when scoring whether visible work has approved mock routes, states, component traceability, and parity expectations.
---

# AI Native UX Mock Contract Evaluator

Evaluate one thing: whether UX mocks are treated as reviewable contracts for visible product work.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-ux-mock-contract-evaluator",
  "label": "UX mock contract evaluator",
  "version": "0.1.0",
  "dimension": "product_ux_evidence",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-ux-mock-contract-evaluator.children" }]
}
```

## Evidence

Inspect UX mock policy, mock routes, approved mock artifacts, route/state references, component trace layers, and parity notes.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.


## Recent Change Follow-Through

Score current practice, not only configured intent. For this evaluator, inspect the last five PR-equivalent substantive changes when available: GitHub PRs are preferred; otherwise use merge commits, issue-linked task branches, release notes, or grouped commits that represent reviewable work. Treat trivial typo/version-only commits as non-substantive and move farther back until the sample has up to five real changes. If fewer than five exist, inspect all available substantive changes and lower confidence.

At least half of this leaf score is reserved for whether those recent changes actually followed the evaluator-specific practice. A repository with polished docs, templates, or configuration but no evidence that humans and agents followed them in recent substantive work must lose at least the full recent-change budget. If GitHub access is unavailable for a repository whose issue, PR, review, check, or human-gate practice lives in GitHub, treat that evidence as absent and apply the recent-change deduction; do not infer compliance from local git history alone. Local git, release notes, or grouped commits can only substitute when they preserve equivalent issue, review, check, artifact, and human/agent follow-through evidence.

## Deduction Groups

Use these groups when evaluating approved mock routes, states, component traceability, and parity expectations.

```ai-native-deduction-groups
[
  {
    "id": "mock-before-implementation",
    "label": "Mock before implementation",
    "budget": 0.2,
    "deductions": [
      {
        "id": "missing-mock-before-implementation",
        "label": "Missing mock before implementation",
        "points": 0.2,
        "appliesWhen": "The repository visible work does not require an approved mock before implementation.",
        "evidenceRequired": "Cite mock routes, screenshots, UX policy docs, issue specs, PR evidence, and design review notes that show the missing UX mock contract requirement.",
        "recommendation": "Add explicit UX mock contract guidance for mock before implementation."
      },
      {
        "id": "incomplete-mock-before-implementation",
        "label": "Incomplete mock before implementation",
        "points": 0.1,
        "appliesWhen": "The repository mock requirement exists but has unclear exceptions or promotion path.",
        "evidenceRequired": "Cite the partial UX mock contract evidence and the specific gap.",
        "recommendation": "Tighten the mock before implementation guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-mock-before-implementation",
        "label": "Unlinked mock before implementation evidence",
        "points": 0.05,
        "appliesWhen": "UX mock contract evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the UX mock contract evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "state-and-parity-contract",
    "label": "State and parity contract",
    "budget": 0.175,
    "deductions": [
      {
        "id": "missing-state-and-parity-contract",
        "label": "Missing state and parity contract",
        "points": 0.175,
        "appliesWhen": "The repository mock contract does not define states, routes, layout, controls, or parity expectations.",
        "evidenceRequired": "Cite mock routes, screenshots, UX policy docs, issue specs, PR evidence, and design review notes that show the missing UX mock contract requirement.",
        "recommendation": "Add explicit UX mock contract guidance for state and parity contract."
      },
      {
        "id": "incomplete-state-and-parity-contract",
        "label": "Incomplete state and parity contract",
        "points": 0.09,
        "appliesWhen": "The repository contract exists but omits important states or responsive behavior.",
        "evidenceRequired": "Cite the partial UX mock contract evidence and the specific gap.",
        "recommendation": "Tighten the state and parity contract guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-state-and-parity-contract",
        "label": "Unlinked state and parity contract evidence",
        "points": 0.045,
        "appliesWhen": "UX mock contract evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the UX mock contract evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "mock-traceability",
    "label": "Mock traceability",
    "budget": 0.125,
    "deductions": [
      {
        "id": "missing-mock-traceability",
        "label": "Missing mock traceability",
        "points": 0.125,
        "appliesWhen": "The repository implementation cannot be traced back to mock routes or approved artifacts.",
        "evidenceRequired": "Cite mock routes, screenshots, UX policy docs, issue specs, PR evidence, and design review notes that show the missing UX mock contract requirement.",
        "recommendation": "Add explicit UX mock contract guidance for mock traceability."
      },
      {
        "id": "incomplete-mock-traceability",
        "label": "Incomplete mock traceability",
        "points": 0.065,
        "appliesWhen": "The repository traceability exists but is incomplete or not linked from PRs.",
        "evidenceRequired": "Cite the partial UX mock contract evidence and the specific gap.",
        "recommendation": "Tighten the mock traceability guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-mock-traceability",
        "label": "Unlinked mock traceability evidence",
        "points": 0.03,
        "appliesWhen": "UX mock contract evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the UX mock contract evidence from the workflow where agents need it."
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

Cite exact mock artifacts or policy docs and identify missing approval, route state, traceability, or parity evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-ux-mock-contract-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
