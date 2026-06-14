---
name: ai-native-docs-evaluator
description: Evaluate repository documentation and onboarding for AI-native development maturity. Use when an AI-native eval review needs focused scoring of README, docs, runtime instructions, decision docs, onboarding clarity, and documentation evidence.
---

# AI Native Docs Evaluator

Evaluate whether repository documentation lets an AI agent and human collaborator understand, run, modify, and review the project without guessing.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-docs-evaluator",
  "label": "Documentation and onboarding evaluator",
  "version": "0.1.0",
  "dimension": "documentation_onboarding",
  "directChildren": [
    { "pluginId": "ai-native-readme-onboarding-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-runtime-docs-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-decision-context-evaluator", "weight": 0.8, "required": false },
    { "pluginId": "ai-native-review-workflow-docs-evaluator", "weight": 1, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-docs-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only the direct documentation child evaluators above.

## Evidence

Inspect documentation surfaces that are present:

- `README.md`, setup docs, quick start docs, contribution docs.
- Runtime, local dev, local production, build, test, and E2E command docs.
- Architecture, decision, domain, product, or phase/source-of-truth docs.
- Review workflow, issue workflow, PR workflow, quality gate, and artifact docs.
- Links from docs to scripts, commands, apps, packages, and evidence artifacts.

If a document is referenced but missing, score the relevant child as `missing` or `partial` and cite the broken reference.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: docs are discoverable, current, specific, and actionable.
- `partial`: docs exist but omit failure handling, scope, command output, or review expectations.
- `missing`: expected docs or linked docs are absent.
- `stale`: docs contradict current scripts, package layout, app routes, or workflow rules.
- `not_applicable`: the review scope explicitly excludes the surface.

Do not reward polished prose unless it helps an agent perform reviewable work.

## Required Checks

For each scored node, include:

- Evidence links to exact files or sections.
- A reason explaining the score.
- A recommendation when status is not `pass`.
- Improvement references only when they point to a precise useful source.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not inspect GitHub comments, CI history, or runtime behavior except as linked documentation evidence; those belong to other evaluators.
