# Architecture

`ai-native-eval` has two boundaries: the skill pack and the deterministic tool.

## Skill Pack Boundary

Skills live under `.agents/skills/**`.

- `ai-native-eval` is the orchestrator skill.
- `ai-native-foundation-evaluator` is the built-in foundation evaluator pack root.
- `bmad-method-evaluator` is the built-in BMAD evaluator pack root.
- `ai-native-eval-self-evaluator` is a project-specific evaluator-system pack used by this repo's own `.ai-native-eval/config.json`, not a default root for ordinary repositories.
- Fine-grained evaluator skills own their own direct children and deduction rubric.

There is no central canonical evaluator hierarchy. The runtime tree is resolved from installed skill manifests:

1. Start from built-in roots and configured additional roots.
2. Read each root skill's direct children.
3. Recursively resolve only the direct children declared by each child.
4. Stop at leaf evaluator skills.
5. Validate each leaf output against that leaf skill's own deduction groups.

## Tool Boundary

The TypeScript tool lives at `.agents/skills/ai-native-eval/scripts/eval/`.

The tool owns deterministic behavior:

- config resolution
- run folder initialization
- plugin graph validation
- evaluator folder validation
- deduction-group scoring
- aggregation
- HTML and JSON report rendering
- persistence helpers

The tool must not contain domain-specific scoring opinions that belong in evaluator skills. Evaluator skills provide rubrics and judgments; the tool validates and aggregates.

## Data Flow

```text
repo evidence
  -> evaluator skill judgment JSON files
  -> run folder validation
  -> normalized evaluation node tree
  -> deterministic aggregation
  -> report JSON
  -> static HTML report
```

The report JSON is the source of truth. The HTML report is a static inspection surface generated from the same validated report.

## Ownership Rules

- Evaluator plugin manifests and deduction rubrics belong in each evaluator skill's `SKILL.md`.
- The orchestrator may know built-in root pack ids, but it must not know every descendant evaluator.
- Additional evaluator packs are appended through config rather than modifying built-in skill files.
- Disabled plugins and subtrees are recorded in the run snapshot and rendered as disabled nodes.
- Tool tests should exercise deterministic contracts. Real-agent tests should stay separate and explicit.

## Current Non-Goals

- No external package discovery implementation yet.
- No hosted service or database runtime.
- No BMAD self-evaluation for this repository's baseline.
- No product UI implementation beyond report HTML generation.
