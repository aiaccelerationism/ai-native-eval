---
name: ai-native-github-evaluator
description: Evaluate GitHub issues, pull requests, reviews, labels, and linked artifacts for AI-native repo maturity. Use when an AI-native eval review needs issue readiness, PR evidence, review contract, or GitHub workflow scoring.
---

# AI Native GitHub Evaluator

Evaluate whether GitHub workflow evidence lets agents plan, implement, review, and merge work without hidden human labor.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-github-evaluator",
  "label": "GitHub workflow evaluator",
  "version": "0.1.0",
  "dimension": "github_workflow",
  "directChildren": [
    { "pluginId": "ai-native-issue-readiness-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-pr-readiness-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-review-contract-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-auto-merge-safety-evaluator", "weight": 0.8, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-github-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only direct GitHub workflow child evaluators.

## Evidence

When GitHub access is available, inspect:

- Issue bodies, labels, milestones, linked tasks, and issue comments.
- Issue readiness markers, acceptance criteria, non-goals, dependencies, reviewer expectations, and skill coverage.
- PR bodies, changed/not-done sections, issue closing keywords, command evidence, artifact links, and human gate notes.
- Review comments, requested changes, inline findings, unresolved threads, external reviewer comments, and resolution ledgers.
- Linked screenshots, traces, videos, reports, and Actions run links.

If GitHub access is unavailable, emit `missing` nodes for inaccessible GitHub surfaces and lower confidence. Do not score absent access as a failed workflow.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: evidence is present, specific, current, and sufficient for another agent to act.
- `partial`: evidence exists but omits acceptance criteria, closure mapping, review expectations, commands, artifacts, or resolution details.
- `missing`: the surface cannot be found or cannot be accessed.
- `stale`: issue/PR/review metadata contradicts current branch, commit, or artifact state.
- `fail`: evidence shows the workflow bypassed required issue, review, human gate, or merge rules.

## Required Checks

For each scored node:

- Link exact issue, PR, review, check, or artifact evidence when possible.
- Separate missing access from negative findings.
- Recommend the smallest GitHub workflow improvement that would raise the score.
- Do not infer high maturity from labels alone.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not run CI or inspect local tests; only evaluate GitHub workflow evidence and linked artifacts.
