# Research Pilot Protocol

This protocol defines the first executable pilot for the `ai-native-eval` research plan.

## Pilot Objective

Determine whether eval-guided AI-native adoption produces measurable improvements over baseline and self-declared AI-native adoption, and whether the repo can collect the evidence without relying on chat memory.

## Inputs

Before the pilot starts, create a pilot folder under `research/pilots/<pilot-id>/` with:

- `pilot-plan.md`: selected repos, task list, run budget, reviewer, and dates.
- `task-bank.jsonl`: one task per line using the fields in [research-data-schema.md](research-data-schema.md).
- `runs.jsonl`: one task-run record per condition and task.
- `finding-ledger.jsonl`: evaluator finding -> repair -> outcome links.
- `review-notes.md`: reviewer calibration notes and final interpretation.

Do not commit raw secrets, private logs, or large binary artifacts. Summarize sensitive evidence and link to safe artifacts.

## Conditions

Run tasks under these conditions:

1. Baseline: original repo state or fixture state before AI-native improvement.
2. Self-declared AI-native: manual improvement from a written checklist, without using evaluator findings.
3. Eval-guided AI-native: improvement from `ai-native-eval` findings, with selected repairs linked in the finding ledger.

For staged pilots, record the commit or fixture snapshot for T0, T1, and T2. For parallel pilots, record the branch or worktree for each condition.

## Task Selection

Each task must include:

- Task type: bug fix, feature change, test repair, docs/runtime ambiguity, or review/evidence repair.
- Acceptance criteria.
- Expected validation commands.
- Non-goals.
- Difficulty estimate: small, medium, or large.
- Matched-task group id tying comparable tasks across conditions.

Do not reuse the same exact task across conditions. Use matched tasks with similar complexity instead.

## Agent Run Rules

Use one agent setup for all runs in the pilot.

Record:

- Agent surface and version when available.
- Model family when available.
- Prompt or issue text.
- Time or turn budget.
- Commands attempted.
- Files changed.
- Final status.

Agents may use repo docs, scripts, evaluator reports, and linked artifacts available in the assigned condition. Agents in the self-declared condition must not use `ai-native-eval` reports or deduction lists.

## Review Rules

Use the same reviewer rubric for all runs.

The reviewer records:

- Task success: pass, partial, or fail.
- Acceptance criteria result.
- Reviewer assessment time in minutes.
- Reviewer confidence from 1 to 5.
- Missing evidence count.
- Scope drift count.
- Required repair loops.
- Merge/block decision.

When practical, hide the condition label from the reviewer until after the first review decision.

## Eval-Guided Repair Rules

For the eval-guided condition:

1. Run `ai-native-eval` and preserve the report artifact.
2. Select findings before repairing anything.
3. Record selected findings in `finding-ledger.jsonl`.
4. Make repairs in a reviewable branch or fixture snapshot.
5. Run validation commands.
6. Link the repair artifact and validation evidence.
7. Run matched agent tasks and record outcomes.

Do not claim a repair improved performance unless a later task outcome or reviewer measurement changed in the expected direction.

## Stop/Go Criteria

Stop and revise the pilot design if:

- More than 20% of task runs cannot be measured from the schema.
- Reviewer cannot apply the rubric consistently.
- Matched tasks are judged materially different in difficulty.
- Agent environment differences dominate the result.
- Evidence artifacts cannot be linked without copying unsafe data.

Scale beyond the pilot only if:

- Every run has a complete `runs.jsonl` record.
- Every eval-guided repair has a finding-ledger entry.
- At least one primary metric shows interpretable signal or a clear null result.
- Threats to validity are documented before looking at aggregate results.

## Required Closeout

Each pilot closeout must include:

- Summary of conditions and task counts.
- Aggregate primary metrics.
- Finding-repair-outcome examples.
- Null or negative results.
- Validity risks that remain.
- Decision: scale, revise, or stop.
