---
name: ai-native-ai-participation-evaluator
description: Evaluate AI participation depth across agent threads, source control, skill activation, AI self-assessment, human follow-through, and human-AI collaboration trace. Use when foundation scoring needs to know whether recent work actually used AI-native workflows rather than only documenting them.
---

# AI Native AI Participation Evaluator

Evaluate whether the repository's actual work loop is AI-native in practice.

This is a grouping evaluator. It emits scored evaluation nodes from direct children and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-ai-participation-evaluator",
  "label": "AI participation evaluator",
  "version": "0.1.0",
  "dimension": "ai_participation",
  "directChildren": [
    { "pluginId": "ai-native-agent-thread-participation-evaluator", "weight": 0.2, "required": true },
    { "pluginId": "ai-native-source-control-ai-participation-evaluator", "weight": 0.2, "required": true },
    { "pluginId": "ai-native-skill-activation-depth-evaluator", "weight": 0.2, "required": true },
    { "pluginId": "ai-native-ai-self-assessment-loop-evaluator", "weight": 0.2, "required": true },
    { "pluginId": "ai-native-human-follow-through-evaluator", "weight": 0.15, "required": true },
    { "pluginId": "ai-native-human-ai-collaboration-trace-evaluator", "weight": 0.05, "required": true }
  ],
  "extensionPoints": [
    { "id": "ai-native-ai-participation-evaluator.children" }
  ]
}
```

This evaluator owns only the direct children above. It should not absorb descendant scoring into one score.

## Evidence

Inspect child evaluator outputs for agent thread participation, GitHub/source-control AI participation, skill activation depth, AI self-assessment loops, human follow-through, and collaboration trace.

## Scoring Rules

Aggregate direct child evaluator outputs. Emit a `missing` node only when an expected direct child evaluator is unavailable after plugin resolution.

This evaluator is intended to occupy 40% of the built-in foundation score. Keep its direct children focused on actual participation evidence, not generic repository readiness.

## Required Checks

Ensure each direct child evaluates both configuration and recent execution evidence. The strongest evidence comes from the latest five PR-equivalent substantive changes, linked issues, PR bodies, reviews, checks, agent thread summaries, and self-assessment artifacts.

## Output Expectations

This is a grouping evaluator. Resolve and route only the direct children declared in this skill's Plugin Manifest. Do not score grandchildren directly, do not own descendant rubrics, and do not output leaf `deductionGroups`. Leaf child evaluators must write their own per-leaf JSON files under the run folder's `evaluators/` directory. The eval tool assembles the runtime tree from installed manifests plus validated leaf outputs. Do not calculate final level.
