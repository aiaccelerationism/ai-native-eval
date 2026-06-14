---
name: ai-native-architecture-evaluator
description: Evaluate architecture, ownership boundaries, module structure, runtime/deploy paths, data boundaries, and long-term maintainability for AI-native repo maturity. Use when an AI-native eval review needs architecture and ownership scoring.
---

# AI Native Architecture Evaluator

Evaluate whether architecture boundaries help agents make bounded, typed, reviewable changes without drifting across ownership lines.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-architecture-evaluator",
  "label": "Architecture boundary evaluator",
  "version": "0.1.0",
  "dimension": "architecture_boundaries",
  "directChildren": [
    { "pluginId": "ai-native-ownership-boundary-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-deployment-boundary-evaluator", "weight": 1, "required": false },
    { "pluginId": "ai-native-data-portability-boundary-evaluator", "weight": 1, "required": false },
    { "pluginId": "ai-native-domain-boundary-evaluator", "weight": 1, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-architecture-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only architecture/deployment direct children and should not become a catch-all architecture review.

## Evidence

Inspect:

- Architecture charters, ADRs, platform docs, package ownership docs, and domain boundary docs.
- Package/module structure, public exports, service/repository boundaries, and app/package ownership.
- Runtime and deployment architecture docs, local/cloud/self-hosted boundaries, and shell/runtime boundaries.
- Data/auth/org/persistence boundaries when present.
- PRs or tasks that changed shared packages, generated APIs, database boundaries, or deployment assumptions.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: boundaries are documented, current, enforced by code shape or review gates, and clear enough for agents.
- `partial`: boundaries exist but are ambiguous, prose-only, missing consumers, or missing gate expectations.
- `missing`: important architecture surfaces have no docs or ownership rules.
- `stale`: docs contradict package layout, runtime paths, or implemented boundaries.
- `fail`: repo encourages shortcuts such as direct DB access, misleading shared exports, or deployment-coupled product logic.

## Required Checks

For each scored node:

- Cite docs, package paths, APIs, or PR evidence.
- Identify whether the weakness is missing documentation, unclear ownership, weak enforcement, or architecture drift.
- Recommend a specific boundary doc, ownership rule, test, or review gate.
- Do not score generic code quality; score architecture operability for AI-assisted change.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not inspect every source file unless the review scope specifically asks for architecture drift evidence.
