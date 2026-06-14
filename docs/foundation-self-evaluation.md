# Foundation Self-Evaluation

This repository dogfoods `ai-native-foundation-evaluator`, the project-specific `ai-native-eval-self-evaluator`, and the project-specific `ai-native-research-evaluator`.

The baseline intentionally evaluates foundation maturity, AI Native Eval evaluator-system quality, and research readiness. `bmad-method-evaluator` is disabled in the self-evaluation config because this repository is not a BMAD project baseline.

The baseline is strict about evidence quality. Documentation is credited as a starting point, but evaluators deduct heavily when the repository lacks matching scripts, templates, CI enforcement, durable artifacts, review automation, historical proof, AI participation proof, or recent PR-equivalent change follow-through.

## Current Baseline

- Run id: `self-eval-20260614-foundation`
- Scope: `ai-native-eval foundation, evaluator-system, and research-readiness self-evaluation`
- Score: `3.4 / 10`
- Level: `3`
- Confidence: `high`
- AI participation: foundation scoring now reserves 40% for AI participation, including agent threads, source control AI participation, skill activation, AI self-assessment, human follow-through, and collaboration trace.
- Research readiness: project-specific scoring now credits the research plan, pilot protocol, and metrics/data schema, while still deducting for missing pilot execution, reviewer calibration examples, populated finding ledgers, and recent-change follow-through.
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
- The project config adds `ai-native-eval-self-evaluator` and `ai-native-research-evaluator` as project-specific additional roots.
- Every enabled foundation leaf evaluator has exactly one JSON output file.
- No evaluator output uses invented generic deductions.
- `pnpm self-eval:validate` passes.
- `pnpm self-eval:render` produces a compact Markdown report artifact.
- `pnpm self-eval:check` passes, proving the committed compact report is fresh.
- [README.md](../README.md) links to the current baseline score and artifacts.
