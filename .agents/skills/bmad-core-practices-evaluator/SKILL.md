---
name: bmad-core-practices-evaluator
description: Evaluate BMAD core collaboration practices. Use when scoring whether a repo documents BMAD-style help routing, brainstorming, elicitation, spec, adversarial review, and document operations.
---

# BMAD Core Practices Evaluator

Evaluate one thing: BMAD core practice adoption.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "bmad-core-practices-evaluator",
  "label": "BMAD core practices evaluator",
  "version": "0.1.0",
  "dimension": "bmad_core_practices",
  "directChildren": [],
  "extensionPoints": [{ "id": "bmad-core-practices-evaluator.children" }]
}
```

## Evidence

Inspect spec docs, brainstorm outputs, elicitation notes, review reports, edge-case reviews, doc indexes, doc sharding, and customization guidance.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating BMAD core practice adoption.

```ai-native-deduction-groups
[
  {
    "id": "core-practice-routing",
    "label": "Core practice routing",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-core-practice-routing",
        "label": "Missing core practice routing",
        "points": 0.35,
        "appliesWhen": "The repo does not document when to use BMAD-style help, brainstorming, elicitation, spec, review, or document operations.",
        "evidenceRequired": "Cite repo artifacts that prove the BMAD core practice adoption gap.",
        "recommendation": "Add lightweight routing guidance for BMAD-style core practices."
      },
      {
        "id": "incomplete-core-practice-routing",
        "label": "Incomplete core practice routing",
        "points": 0.18,
        "appliesWhen": "Core practice routing evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial BMAD core practice adoption evidence and the specific gap.",
        "recommendation": "Add lightweight routing guidance for BMAD-style core practices."
      }
    ]
  },
  {
    "id": "core-practice-artifacts",
    "label": "Core practice artifacts",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-core-practice-artifacts",
        "label": "Missing core practice artifacts",
        "points": 0.4,
        "appliesWhen": "There is no evidence of core practice artifacts such as specs, brainstorm outputs, adversarial reviews, edge-case reviews, doc indexes, or sharded docs when relevant.",
        "evidenceRequired": "Cite repo artifacts that prove the BMAD core practice adoption gap.",
        "recommendation": "Create or link the core practice artifacts that are relevant to this repo."
      },
      {
        "id": "incomplete-core-practice-artifacts",
        "label": "Incomplete core practice artifacts",
        "points": 0.2,
        "appliesWhen": "Core practice artifacts evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial BMAD core practice adoption evidence and the specific gap.",
        "recommendation": "Create or link the core practice artifacts that are relevant to this repo."
      }
    ]
  },
  {
    "id": "core-practice-customization",
    "label": "Core practice customization",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-core-practice-customization",
        "label": "Missing core practice customization",
        "points": 0.25,
        "appliesWhen": "The repo does not document how project-specific BMAD or agent-skill behavior should be customized safely.",
        "evidenceRequired": "Cite repo artifacts that prove the BMAD core practice adoption gap.",
        "recommendation": "Document safe project-level skill customization or override practices."
      },
      {
        "id": "incomplete-core-practice-customization",
        "label": "Incomplete core practice customization",
        "points": 0.13,
        "appliesWhen": "Core practice customization evidence exists but is partial, stale, or too vague for agent-safe downstream work.",
        "evidenceRequired": "Cite the partial BMAD core practice adoption evidence and the specific gap.",
        "recommendation": "Document safe project-level skill customization or override practices."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Treat these as optional practices; apply deductions only when the repo claims or needs BMAD-style core collaboration but lacks evidence.

## Output Expectations

Write one per-leaf evaluator JSON file named `bmad-core-practices-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
