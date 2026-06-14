# Reviewer Contract

Reviewers should evaluate this repository as an agent skill pack plus deterministic reporting tool.

## Required Review Surface

Every substantive PR should include:

- Changed skills, tool code, docs, fixtures, or report artifacts.
- Commands run and whether they are deterministic or real-agent commands.
- Human E2E evidence for workflow-critical, user-facing, agent-facing, or evaluator-routing changes. An AI agent may provide this by explicitly acting as the human tester and recording the command, scenario, artifacts inspected, and outcome.
- Any evaluator rubric ids added, removed, or changed.
- Any changes to built-in root behavior, config resolution, disabled subtree handling, or report rendering.
- Whether `self-evaluations/**` artifacts were regenerated.
- Which gates were skipped and why the skip is safe.

## Severity

- P0: deterministic scoring, validation, or config behavior is wrong; disabled evaluators can still affect score; reports can render invalid inputs; skill contracts contradict tool behavior.
- P1: a supported workflow is missing test coverage; required human E2E evidence is absent; report output is misleading; evaluator outputs use invented deduction ids; README or docs route agents incorrectly.
- P2: wording, discoverability, minor report polish, or missing low-risk examples.

## Review Gates

Use these gates before approving a PR:

- `pnpm test`
- `pnpm self-eval:validate` when self-evaluation artifacts or evaluator contracts changed.
- `pnpm self-eval:check` for any PR that could make the committed self-evaluation report stale.
- `pnpm self-eval:render` when self-evaluation report artifacts intentionally changed.
- `pnpm skill-eval:contract` when skill behavior changed.
- Live skill evals or real-agent E2E when the task specifically changes real agent behavior.
- `pnpm test:human` when a change affects user-facing flows, agent-facing workflow routing, lifecycle evaluator entrypoints, generated reports, or any behavior a human developer would otherwise manually verify.

Docs-only or instruction-only PRs may skip expensive live agent evidence when they do not alter workflow behavior, but the PR must say that live evidence was intentionally deferred. Workflow instruction changes that alter how an agent chooses, routes, validates, or reports work should include human E2E evidence.

The pull request template is the required review surface for PR authors. It mirrors this contract and must not be bypassed by relying only on chat context.

## Follow-Through

Review comments should identify the exact skill, tool module, fixture, or report artifact affected. A finding is closed only when the fix and the proof command are both visible in the PR.
