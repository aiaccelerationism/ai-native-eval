---
name: ai-native-eval-plugin-boundary-integrity-evaluator
description: Evaluate whether AI Native Eval plugin graph boundaries are hot-pluggable, direct-child-only, and free of central descendant registries. Use only for evaluator-system self-evaluation.
---

# AI Native Eval Plugin Boundary Integrity Evaluator

Evaluate one thing: whether evaluator plugin boundaries preserve hot-pluggable direct-child ownership.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-eval-plugin-boundary-integrity-evaluator",
  "label": "Plugin boundary integrity evaluator",
  "version": "0.1.0",
  "dimension": "eval_system_quality",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-eval-plugin-boundary-integrity-evaluator.children" }]
}
```

## Evidence

Inspect evaluator plugin manifests, config resolution, folder validation, plugin tests, built-in root declarations, additional root config, disabled subtree behavior, and docs describing plugin boundaries.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating hot-pluggable plugin boundaries and runtime tree resolution.

```ai-native-deduction-groups
[
  {
    "id": "direct-child-ownership",
    "label": "Direct-child ownership",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-direct-child-ownership",
        "label": "Missing direct-child ownership",
        "points": 0.35,
        "appliesWhen": "A central registry or root skill owns deep descendants instead of each parent owning only direct children.",
        "evidenceRequired": "Cite source, docs, or skill manifests showing a central canonical full tree or deep descendant ownership.",
        "recommendation": "Move child declarations to each parent evaluator skill and resolve recursively at runtime."
      },
      {
        "id": "incomplete-direct-child-ownership",
        "label": "Incomplete direct-child ownership",
        "points": 0.18,
        "appliesWhen": "Most evaluators follow direct-child ownership but some docs, tests, or configs still imply a central full hierarchy.",
        "evidenceRequired": "Cite the inconsistent manifest, doc, or test fixture.",
        "recommendation": "Remove central hierarchy language and keep only direct child references in evaluator manifests."
      },
      {
        "id": "unproven-direct-child-ownership",
        "label": "Unproven direct-child ownership",
        "points": 0.09,
        "appliesWhen": "Direct-child ownership is documented but tests do not prove root lacks knowledge of grandchildren.",
        "evidenceRequired": "Cite missing or partial plugin-resolution tests.",
        "recommendation": "Add tests showing a root does not include grandchild or great-grandchild ids while runtime resolution still reaches them."
      }
    ]
  },
  {
    "id": "hot-plug-config",
    "label": "Hot-plug config",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-hot-plug-config",
        "label": "Missing hot-plug config",
        "points": 0.35,
        "appliesWhen": "Users cannot add evaluator roots through project/person config without editing built-in skill code.",
        "evidenceRequired": "Cite config resolution or docs showing missing additional root support.",
        "recommendation": "Support additional roots through source-controlled project config and record them in run snapshots."
      },
      {
        "id": "incomplete-hot-plug-config",
        "label": "Incomplete hot-plug config",
        "points": 0.18,
        "appliesWhen": "Additional roots exist but ordering, source attribution, or source-controlled project config behavior is incomplete.",
        "evidenceRequired": "Cite config snapshots, docs, or tests showing the partial support.",
        "recommendation": "Make additional root order and config source attribution visible in run snapshots and reports."
      },
      {
        "id": "unproven-external-pack-flow",
        "label": "Unproven external pack flow",
        "points": 0.09,
        "appliesWhen": "The system supports configured roots but lacks proof with an external or project-specific plugin pack.",
        "evidenceRequired": "Cite tests or self-evaluation config showing missing external/project-specific pack proof.",
        "recommendation": "Add a project-specific plugin pack through config and include it in self-evaluation evidence."
      }
    ]
  },
  {
    "id": "disabled-subtree-integrity",
    "label": "Disabled subtree integrity",
    "budget": 0.3,
    "deductions": [
      {
        "id": "missing-disabled-subtree-integrity",
        "label": "Missing disabled subtree integrity",
        "points": 0.3,
        "appliesWhen": "Disabled parent plugins can still require or accept descendant outputs.",
        "evidenceRequired": "Cite validation, tests, or reports showing disabled subtree leakage.",
        "recommendation": "Make disabled parent plugins block descendants and reject outputs under disabled subtrees."
      },
      {
        "id": "incomplete-disabled-subtree-integrity",
        "label": "Incomplete disabled subtree integrity",
        "points": 0.15,
        "appliesWhen": "Disabled subtree logic exists but missing output rejection, report rendering, or rationale visibility is incomplete.",
        "evidenceRequired": "Cite partial tests, run snapshots, or reports.",
        "recommendation": "Cover disabled roots, disabled descendants, rejected outputs, and rendered rationale in tests."
      },
      {
        "id": "unlinked-disabled-subtree-proof",
        "label": "Unlinked disabled subtree proof",
        "points": 0.08,
        "appliesWhen": "Disabled subtree behavior is tested but not connected to self-evaluation or user-facing docs.",
        "evidenceRequired": "Cite tests and the missing report/doc linkage.",
        "recommendation": "Link disabled subtree proof from docs and self-evaluation artifacts."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Check direct-child-only ownership, additional root config, disabled subtree blocking, unreachable output rejection, and absence of shared protocol-skill dependencies.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-eval-plugin-boundary-integrity-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
