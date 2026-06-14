---
name: ai-native-evidence-evaluator
description: Evaluate persisted evidence, eval state, reports, screenshots, traces, acceptance proof, review artifacts, and workflow learning for AI-native repo maturity. Use when an AI-native eval review needs evidence discipline or historical learning scoring.
---

# AI Native Evidence Evaluator

Evaluate whether the repository preserves proof of work and turns repeated lessons into durable workflow memory.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-evidence-evaluator",
  "label": "Evidence and learning evaluator",
  "version": "0.1.0",
  "dimension": "evidence_discipline",
  "directChildren": [
    { "pluginId": "ai-native-acceptance-proof-evaluator", "weight": 1.2, "required": true },
    { "pluginId": "ai-native-artifact-traceability-evaluator", "weight": 1, "required": true },
    { "pluginId": "ai-native-known-issue-awareness-evaluator", "weight": 0.8, "required": false },
    { "pluginId": "ai-native-recurrence-prevention-evaluator", "weight": 1.2, "required": false }
  ],
  "extensionPoints": [
    { "id": "ai-native-evidence-evaluator.children" }
  ]
}
```

This is a grouping evaluator. It owns only evidence/learning direct children; product UX proof and CI proof may be separate sibling evaluator groups.

## Evidence

Inspect:

- `.ai-native-eval/` state, snapshots, reports, manifests, and evidence ledgers when available.
- PR evidence sections, issue acceptance proof, review artifacts, screenshots, traces, videos, and run logs.
- Known issue cards, skill updates, decision docs, recurrence-prevention notes, and eval cases created from repeated misses.
- Artifact names, download instructions, report paths, and links from claims to evidence.
- Privacy-safe persistence choices for logs and artifacts.

## Scoring Rules

Aggregate direct child evaluator outputs. If a child evaluator is missing, emit a `missing` node for that direct child rather than replacing it with broad scoring here.

Use:

- `pass`: claims are backed by inspectable evidence, artifacts are findable, and lessons are captured durably.
- `partial`: evidence exists but is incomplete, hard to inspect, not linked, or not connected to acceptance criteria.
- `missing`: expected proof, reports, or learning records are absent.
- `stale`: evidence points to old commits, obsolete artifacts, or superseded workflow rules.
- `fail`: reports or artifacts contain secrets/private data, or claims contradict available evidence.

## Required Checks

For each scored node:

- Link exact report, artifact, issue/PR, known issue, skill, or decision doc.
- Separate lack of evidence from negative evidence.
- Recommend a concrete artifact, ledger, report, skill update, known issue, or eval case.
- Do not persist raw secrets, private logs, or large binaries as eval evidence.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not score whether the underlying implementation is correct except through preserved evidence quality.
