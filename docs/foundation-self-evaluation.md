# Foundation Self-Evaluation

This repository dogfoods `ai-native-foundation-evaluator` and the project-specific `ai-native-eval-self-evaluator`.

The baseline intentionally evaluates foundation maturity plus AI Native Eval evaluator-system quality. `bmad-method-evaluator` is disabled in the self-evaluation config because this repository is not a BMAD project baseline.

The baseline is strict about evidence quality. Documentation is credited as a starting point, but evaluators deduct heavily when the repository lacks matching scripts, templates, CI enforcement, durable artifacts, review automation, historical proof, AI participation proof, or recent PR-equivalent change follow-through.

## Current Baseline

- Run id: `self-eval-20260614-foundation`
- Scope: `ai-native-eval foundation and evaluator-system self-evaluation`
- Score: `2.8 / 10`
- Level: `2`
- Confidence: `high`
- AI participation: foundation scoring now reserves 40% for AI participation, including agent threads, source control AI participation, skill activation, AI self-assessment, human follow-through, and collaboration trace.
- Recent-change evidence: strict deductions apply because the baseline does not yet link each evaluator to proof from the latest five PR-equivalent substantive changes.
- Compact report: [self-evaluations/foundation-20260614/report.md](../self-evaluations/foundation-20260614/report.md)
- Run folder: `self-evaluations/foundation-20260614/run/`

## Regeneration

```sh
pnpm self-eval:validate
pnpm self-eval:render
pnpm self-eval:check
```

The render command validates first. If validation fails, fix the named evaluator JSON files or skill rubric before rendering again.

## Acceptance Criteria

The self-evaluation baseline is acceptable when:

- The run config disables BMAD and records that disabled subtree in the report.
- The project config adds `ai-native-eval-self-evaluator` as a project-specific additional root.
- Every enabled foundation leaf evaluator has exactly one JSON output file.
- No evaluator output uses invented generic deductions.
- `pnpm self-eval:validate` passes.
- `pnpm self-eval:render` produces a compact Markdown report artifact.
- `pnpm self-eval:check` passes, proving the committed compact report is fresh.
- [README.md](../README.md) links to the current baseline score and artifacts.
