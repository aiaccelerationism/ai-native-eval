# AI Native Eval Research Plan

This document defines the research program for testing whether `ai-native-eval` improves AI-native development outcomes. It is a planning artifact, not a result report.

## Thesis

AI-native development should not rely only on aspirational guidelines. A repeatable, evidence-based eval loop should help repositories improve agent-assisted development outcomes more reliably than informal AI-native intent.

The primary claim is:

> Eval-guided AI-native adoption improves the reviewability, repeatability, and repair efficiency of agent-assisted software development compared with baseline repositories and self-declared AI-native repositories that do not use a structured eval loop.

This claim is falsifiable. A pilot should report a null or negative result if eval-guided adoption does not improve the preregistered outcome metrics, or if improvements come only from documentation polish without measured development-performance gains.

## Research Questions

- RQ1: Do AI-native repository practices improve agent-assisted development performance compared with a baseline repository state?
- RQ2: Does eval-guided adoption improve outcomes more than self-declared AI-native adoption without a structured evaluator?
- RQ3: Which evaluator findings most often lead to measurable repair gains?
- RQ4: Does the eval score or dimension score predict task success, review burden, repair loops, or evidence completeness?

## Comparison Conditions

Use three conditions. Each condition must preserve the exact artifacts used so another reviewer can reproduce the classification.

| Condition | Definition | Allowed support |
| --- | --- | --- |
| Baseline | Repository state before explicit AI-native improvement. | Existing README, scripts, tests, and ordinary issue or PR text. |
| Self-declared AI-native | Repository improved from general AI-native guidance but without `ai-native-eval` findings. | A checklist or human-written best-practice pass. No evaluator score or deduction-driven repair list. |
| Eval-guided AI-native | Repository improved by running `ai-native-eval`, selecting findings, repairing them, and preserving the evidence chain. | Eval report, finding list, repair PRs, validation commands, and outcome measurements. |

For this repository's first pilot, prefer a staged design over parallel teams because it is cheaper and easier to audit:

1. T0: original fixture or external repo state.
2. T1: manual AI-native pass from a checklist.
3. T2: eval-guided repair pass from `ai-native-eval` findings.

Tasks must differ across stages while remaining matched by difficulty, so agents do not solve the same task twice.

## Minimum Pilot

The first pilot is intentionally small:

- Repositories: 2 fixture repos or 1 fixture repo plus 1 small open-source repo.
- Tasks: 6 to 9 coding tasks total, balanced across bug fix, feature change, test repair, and documentation/runtime ambiguity.
- Agent: one fixed agent surface and model family for all conditions.
- Budget: same wall-clock or turn budget per task.
- Review: one reviewer using the rubric in [research-pilot-protocol.md](research-pilot-protocol.md).
- Output: one row per task run in the schema from [research-data-schema.md](research-data-schema.md).

Pilot success does not require proving the final paper claim. It must decide whether the metrics are collectable, whether the comparison is fair enough to scale, and whether evaluator findings can be traced to later outcome changes.

## Primary Metrics

The primary outcomes are:

- Task success: whether acceptance criteria pass without reviewer override.
- Repair loops: number of agent repair attempts after first review or failing check.
- Reviewer assessment time: minutes from review start to merge/block decision.
- Missing evidence count: number of required artifacts absent from the task record.
- Command failure count: incorrect, missing, or undocumented validation commands attempted by the agent.

Secondary outcomes are:

- Scope drift count.
- Handoff resumability rating.
- Reviewer confidence rating.
- Recurrence count for previously known issue classes.
- Eval score and dimension score before each task batch.

Metric definitions and collection fields live in [research-data-schema.md](research-data-schema.md).

## Evidence Chain

Every eval-guided repair must preserve this chain:

```text
evaluator finding
  -> selected repair task
  -> implementation artifact
  -> validation command evidence
  -> later agent task outcome
  -> reviewer interpretation
```

The research claim cannot be supported by improved docs, improved eval score, or a prettier report alone. It requires measured development outcomes from task runs.

## Validity Controls

The pilot must address these risks before claiming improvement:

- Task leakage: agents must not repeat the same task across conditions.
- Task mismatch: tasks must be matched by type and difficulty.
- Agent variance: use one fixed agent setup for the pilot and record version/model metadata when available.
- Reviewer bias: use a fixed rubric and hide condition labels from the reviewer when practical.
- Selection bias: record why each repo and task was selected.
- Process theater: require outcome metrics, not only policy or documentation artifacts.
- Negative results: report null or negative results without rewriting the metrics after the run.

## Research Artifacts

Committed planning artifacts:

- [research-plan.md](research-plan.md): claim, research questions, comparison conditions, and minimum pilot.
- [research-pilot-protocol.md](research-pilot-protocol.md): execution steps, task matching, reviewer workflow, and stop/go rules.
- [research-data-schema.md](research-data-schema.md): metrics, JSONL fields, and evidence-ledger schema.

Future pilot result artifacts should live under `research/pilots/<pilot-id>/` only after the pilot is intentionally run and reviewed. Generated scratch outputs should stay under ignored local artifact folders until promoted.
