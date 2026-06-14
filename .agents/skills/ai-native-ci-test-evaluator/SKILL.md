---
name: ai-native-ci-test-evaluator
description: Evaluate CI workflows, required checks, test commands, E2E proof, build gates, screenshots, traces, and runtime verification for AI-native repo maturity. Use when an AI-native eval review needs CI/test/evidence gate scoring.
---

# AI Native CI/Test Evaluator

Evaluate whether automated and manual quality gates prove behavior well enough for AI-assisted development.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-ci-test-evaluator",
  "label": "CI and test evidence evaluator",
  "version": "0.1.0",
  "dimension": "ci_test_evidence",
  "directChildren": [
    { "pluginId": "ai-native-ci-required-checks-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-test-command-surface-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-e2e-artifact-proof-evaluator", "weight": 1.2, "required": false },
    { "pluginId": "ai-native-quality-gate-skip-policy-evaluator", "weight": 0.8, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-ci-test-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only CI/test direct children; each child scores one gate surface.

## Evidence

Inspect:

- `.github/workflows/**`, CI config, branch protection docs, required check names.
- Package scripts for lint, typecheck, unit, integration, build, E2E, and coverage.
- Test directories, Playwright/Cypress configs, report folders, trace/video/screenshot policies.
- Workflow run links, check runs, uploaded artifacts, and local validation logs when provided.
- Policy skips for docs-only, agent-instruction-only, or expensive gates.

If live CI history is unavailable, evaluate committed workflow/config evidence and mark live history as missing.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: gates are documented, runnable, required where appropriate, and produce inspectable evidence.
- `partial`: gates exist but are not required, not app-owned, lack artifacts, or have unclear skip policy.
- `missing`: expected CI/test evidence is absent or inaccessible.
- `stale`: scripts/workflows/docs disagree.
- `fail`: gates are bypassable, misleading, or known failing without repair/classification.

## Required Checks

For each scored node:

- Cite workflow files, scripts, run links, or artifact names.
- Separate "not run in this review" from "no gate exists".
- Recommend concrete gate, artifact, or command improvements.
- Do not treat a passing build as proof of visible behavior when E2E or screenshots are required.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not judge product UX quality beyond whether test/artifact proof exists.
