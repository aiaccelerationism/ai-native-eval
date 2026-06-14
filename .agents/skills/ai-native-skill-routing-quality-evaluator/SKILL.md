---
name: ai-native-skill-routing-quality-evaluator
description: Evaluate skill routing quality for AI-native repo maturity. Use when scoring whether project skills have clear trigger descriptions, required reading, boundaries, and handoff rules.
---

# AI Native Skill Routing Quality Evaluator

Evaluate one thing: whether installed skills route agents to the right workflow at the right time.

This is a standalone evaluator plugin. It emits scored evaluation nodes and does not assign final repo level.

## Plugin Manifest

```json
{
  "pluginId": "ai-native-skill-routing-quality-evaluator",
  "label": "Skill routing quality evaluator",
  "version": "0.1.0",
  "dimension": "agent_readiness",
  "directChildren": [],
  "extensionPoints": [{ "id": "ai-native-skill-routing-quality-evaluator.children" }]
}
```

## Evidence

Inspect `.agents/skills/**/SKILL.md`, skill frontmatter descriptions, required reading, trigger rules, stop conditions, and overlap between skills.

## Scoring Rules

Use the deduction groups below for leaf scoring. Start from full credit and apply every deduction that is supported by evidence. Do not invent partial subjective scores.

The canonical leaf node should use `pointsAvailable: 1`. If this evaluator emits multiple leaf nodes, each leaf must define its own deduction groups instead of reusing these blindly.

## Deduction Groups

Use these groups when evaluating skill trigger descriptions, required reading, boundaries, and handoff rules.

```ai-native-deduction-groups
[
  {
    "id": "trigger-clarity",
    "label": "Trigger clarity",
    "budget": 0.4,
    "deductions": [
      {
        "id": "missing-trigger-clarity",
        "label": "Missing trigger clarity",
        "points": 0.4,
        "appliesWhen": "The repository skills lack clear trigger descriptions for when agents should use them.",
        "evidenceRequired": "Cite skill README, SKILL.md files, eval cases, routing docs, and task examples that show the missing skill routing quality requirement.",
        "recommendation": "Add explicit skill routing quality guidance for trigger clarity."
      },
      {
        "id": "incomplete-trigger-clarity",
        "label": "Incomplete trigger clarity",
        "points": 0.2,
        "appliesWhen": "The repository trigger descriptions exist but overlap or conflict in high-frequency workflows.",
        "evidenceRequired": "Cite the partial skill routing quality evidence and the specific gap.",
        "recommendation": "Tighten the trigger clarity guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-trigger-clarity",
        "label": "Unlinked trigger clarity evidence",
        "points": 0.1,
        "appliesWhen": "Skill routing quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill routing quality evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "boundary-and-handoff",
    "label": "Boundary and handoff",
    "budget": 0.35,
    "deductions": [
      {
        "id": "missing-boundary-and-handoff",
        "label": "Missing boundary and handoff",
        "points": 0.35,
        "appliesWhen": "The repository skills do not define boundaries, required reading, or handoff to adjacent skills.",
        "evidenceRequired": "Cite skill README, SKILL.md files, eval cases, routing docs, and task examples that show the missing skill routing quality requirement.",
        "recommendation": "Add explicit skill routing quality guidance for boundary and handoff."
      },
      {
        "id": "incomplete-boundary-and-handoff",
        "label": "Incomplete boundary and handoff",
        "points": 0.18,
        "appliesWhen": "The repository boundaries exist but leave agents likely to overreach or miss a handoff.",
        "evidenceRequired": "Cite the partial skill routing quality evidence and the specific gap.",
        "recommendation": "Tighten the boundary and handoff guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-boundary-and-handoff",
        "label": "Unlinked boundary and handoff evidence",
        "points": 0.09,
        "appliesWhen": "Skill routing quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill routing quality evidence from the workflow where agents need it."
      }
    ]
  },
  {
    "id": "routing-validation",
    "label": "Routing validation",
    "budget": 0.25,
    "deductions": [
      {
        "id": "missing-routing-validation",
        "label": "Missing routing validation",
        "points": 0.25,
        "appliesWhen": "The repository skill routing is not covered by evals, examples, or review evidence.",
        "evidenceRequired": "Cite skill README, SKILL.md files, eval cases, routing docs, and task examples that show the missing skill routing quality requirement.",
        "recommendation": "Add explicit skill routing quality guidance for routing validation."
      },
      {
        "id": "incomplete-routing-validation",
        "label": "Incomplete routing validation",
        "points": 0.13,
        "appliesWhen": "The repository validation exists but omits important workflow classes.",
        "evidenceRequired": "Cite the partial skill routing quality evidence and the specific gap.",
        "recommendation": "Tighten the routing validation guidance until another agent can evaluate it without guessing."
      },
      {
        "id": "unlinked-routing-validation",
        "label": "Unlinked routing validation evidence",
        "points": 0.06,
        "appliesWhen": "Skill routing quality evidence exists but is not linked from the relevant agent, issue, PR, docs, or report workflow.",
        "evidenceRequired": "Cite both the existing evidence and the missing link path.",
        "recommendation": "Link the skill routing quality evidence from the workflow where agents need it."
      }
    ]
  }
]
```

Group budgets sum to `1.0`, so this leaf has no built-in fallback points. Each group includes a full-missing deduction that can consume the full group budget. When emitting evaluator output, convert each rubric item into a runtime deduction with `applies`, a concrete `reason`, and cited evidence when it applies.

## Required Checks

Cite exact skills and identify trigger ambiguity, missing required reading, overly broad scope, or hidden dependencies.

## Output Expectations

Write one per-leaf evaluator JSON file named `ai-native-skill-routing-quality-evaluator.json` under the run folder's `evaluators/` directory. The output must include `pluginId`, optional `status`, `confidence`, `reason`, evidence, recommendations, and a `deductions` array. Each deduction judgment must reference a `groupId` and `deductionId` from this skill's `ai-native-deduction-groups` fence. Do not output `deductionGroups`, do not redefine rubric budgets, and do not invent generic deductions such as `Evidence-backed deduction`. Applied deductions must include a concrete reason and cited evidence when available. Do not calculate final level.
