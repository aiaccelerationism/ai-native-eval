# Research Metrics And Data Schema

This document defines the measurable outcomes and durable records for the AI Native Eval research pilot.

## Primary Metrics

| Metric | Field | Type | Definition |
| --- | --- | --- | --- |
| Task success | `task_success` | enum | `pass`, `partial`, or `fail` based on acceptance criteria and reviewer decision. |
| Acceptance pass | `acceptance_pass` | boolean | True only when stated acceptance criteria pass without reviewer override. |
| Repair loops | `repair_loop_count` | integer | Number of agent repair attempts after first review comment or failing validation command. |
| Reviewer assessment time | `reviewer_minutes` | number | Minutes from review start to merge/block decision. |
| Missing evidence | `missing_evidence_count` | integer | Required artifacts absent from the task record, PR evidence, or validation proof. |
| Command failures | `command_failure_count` | integer | Incorrect, undocumented, failed, or missing validation commands attributable to repo command-surface ambiguity. |

## Secondary Metrics

| Metric | Field | Type | Definition |
| --- | --- | --- | --- |
| Scope drift | `scope_drift_count` | integer | Unrelated files, behavior, or requirements changed outside task scope. |
| Handoff resumability | `handoff_resumability` | integer | Reviewer rating from 1 to 5 for whether another agent could continue from artifacts. |
| Reviewer confidence | `reviewer_confidence` | integer | Reviewer rating from 1 to 5 for merge/block confidence. |
| Recurrence count | `recurrence_count` | integer | Known issue classes repeated in the run. |
| Eval score | `eval_score_before` | number | Overall score before the task batch, when available. |
| Eval dimension scores | `eval_dimension_scores_before` | object | Dimension scores before the task batch, when available. |

## Task Bank Record

Store one JSON object per line in `task-bank.jsonl`.

```json
{
  "task_id": "pilot-001-task-001",
  "matched_group_id": "runtime-command-ambiguity-001",
  "task_type": "docs/runtime ambiguity",
  "difficulty": "small",
  "repo_id": "fixture-runtime-docs",
  "prompt_path": "research/pilots/pilot-001/prompts/task-001.md",
  "acceptance_criteria": [
    "Agent identifies the documented test command",
    "Agent validates the change with the expected command"
  ],
  "expected_commands": ["pnpm test"],
  "non_goals": ["Do not change evaluator scoring logic"],
  "selection_reason": "Tests whether runtime command clarity affects agent validation behavior."
}
```

## Run Record

Store one JSON object per line in `runs.jsonl`.

```json
{
  "run_id": "pilot-001-t2-task-001-run-001",
  "pilot_id": "pilot-001",
  "condition": "eval_guided_ai_native",
  "stage": "T2",
  "repo_id": "fixture-runtime-docs",
  "repo_snapshot": "commit-or-fixture-id",
  "task_id": "pilot-001-task-001",
  "agent_surface": "codex",
  "agent_version": "record-when-available",
  "model_family": "record-when-available",
  "budget_minutes": 30,
  "commands_attempted": ["pnpm test"],
  "files_changed_count": 2,
  "task_success": "pass",
  "acceptance_pass": true,
  "repair_loop_count": 1,
  "reviewer_minutes": 12,
  "missing_evidence_count": 0,
  "command_failure_count": 0,
  "scope_drift_count": 0,
  "handoff_resumability": 4,
  "reviewer_confidence": 4,
  "recurrence_count": 0,
  "eval_score_before": 6.4,
  "eval_dimension_scores_before": {
    "repo_operability": 7.0,
    "evidence_discipline": 5.5
  },
  "artifact_refs": [
    "research/pilots/pilot-001/artifacts/t2-task-001.md"
  ],
  "reviewer_notes_ref": "research/pilots/pilot-001/review-notes.md#t2-task-001"
}
```

## Finding Ledger Record

Store one JSON object per line in `finding-ledger.jsonl`.

```json
{
  "ledger_id": "pilot-001-finding-001",
  "pilot_id": "pilot-001",
  "condition": "eval_guided_ai_native",
  "evaluator_id": "ai-native-local-runtime-command-evaluator",
  "deduction_id": "incomplete-runtime-command-docs",
  "finding_summary": "Runtime validation command was not discoverable by agents.",
  "selected_for_repair": true,
  "repair_ref": "pull-request-or-fixture-diff-ref",
  "validation_commands": ["pnpm test"],
  "post_repair_task_runs": ["pilot-001-t2-task-001-run-001"],
  "observed_outcome_summary": "Command failure count fell from 2 in matched baseline run to 0 in eval-guided run.",
  "claim_support": "supports",
  "limitations": "Single task pair; needs replication."
}
```

## Quality Controls

- Every task run must have a task-bank record and a run record.
- Every eval-guided repair claim must have a finding-ledger record.
- Reviewer ratings must use the same 1 to 5 scale across conditions.
- Missing evidence counts must include absent command logs, review notes, screenshots/traces when relevant, and acceptance proof.
- Null and negative outcomes must be recorded with the same schema as positive outcomes.
- Aggregate reports must identify excluded runs and the reason for exclusion.
