---
name: ai-native-pr-lifecycle-evaluator
description: Evaluate pull request lifecycle readiness, evidence, review gates, pre-merge safety, post-merge closeout, and PR-specific AI-native workflow quality.
---

# AI Native PR Lifecycle Evaluator

Evaluate one pull request lifecycle context without running a full repository baseline by default.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-pr-lifecycle-evaluator",
  "label": "PR lifecycle evaluator",
  "version": "0.1.0",
  "dimension": "pr_lifecycle",
  "directChildren": [
    { "pluginId": "ai-native-pr-readiness-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-ci-required-checks-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-review-contract-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-acceptance-proof-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-artifact-traceability-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-quality-gate-skip-policy-evaluator", "weight": 0.8, "required": true },
    { "pluginId": "ai-native-thread-closeout-evaluator", "weight": 0.6, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-pr-lifecycle-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. Use it when the user asks to evaluate a PR, pull request, merge readiness, review evidence, or PR closeout.

## Config Namespace

Configure this evaluator under `evaluators["ai-native-pr-lifecycle-evaluator"]`.

Supported phases are `opened`, `active`, `review`, `pre_merge`, `post_merge`, and `closeout`. If a PR target is clear but phase is absent, assume `opened` unless PR metadata proves it is already in review, pre-merge, or post-merge.

Settings are evaluator-owned and may include `defaultPhase`, `evidenceStrictness`, `outputMode`, and `affectOverallScorePolicy`.

## Evidence

Inspect PR body, linked issue, changed/not-done sections, acceptance criteria, command evidence, CI checks, review comments, requested changes, artifact links, skipped gates, and closeout notes.

## Scoring Rules

Aggregate direct child evaluator outputs. Phase changes may affect which child evidence is emphasized, but this grouping evaluator must not invent leaf deductions.

## Required Checks

State the detected PR phase and target reference. Do not ask whether the user meant PR evaluation when the prompt already names a PR or pull request.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not post GitHub comments unless a separate workflow explicitly requests it.
