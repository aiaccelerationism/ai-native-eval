# Reviewer Contract

Reviewers should evaluate this repository as an agent skill pack plus deterministic reporting tool.

## Required Review Surface

Every substantive PR should include:

- Changed skills, tool code, docs, fixtures, or report artifacts.
- Commands run and whether they are deterministic or real-agent commands.
- Any evaluator rubric ids added, removed, or changed.
- Any changes to built-in root behavior, config resolution, disabled subtree handling, or report rendering.
- Whether `self-evaluations/**` artifacts were regenerated.
- Which gates were skipped and why the skip is safe.

## Severity

- P0: deterministic scoring, validation, or config behavior is wrong; disabled evaluators can still affect score; reports can render invalid inputs; skill contracts contradict tool behavior.
- P1: a supported workflow is missing test coverage; report output is misleading; evaluator outputs use invented deduction ids; README or docs route agents incorrectly.
- P2: wording, discoverability, minor report polish, or missing low-risk examples.

## Review Gates

Use these gates before approving a PR:

- `pnpm test`
- `pnpm self-eval:validate` when self-evaluation artifacts or evaluator contracts changed.
- `pnpm self-eval:check` for any PR that could make the committed self-evaluation report stale.
- `pnpm self-eval:render` when self-evaluation report artifacts intentionally changed.
- `pnpm skill-eval:contract` when skill behavior changed.
- Live skill evals or real-agent E2E when the task specifically changes real agent behavior.

Docs-only or instruction-only PRs may skip expensive live agent evidence, but the PR must say that live evidence was intentionally deferred.

The pull request template is the required review surface for PR authors. It mirrors this contract and must not be bypassed by relying only on chat context.

## Follow-Through

Review comments should identify the exact skill, tool module, fixture, or report artifact affected. A finding is closed only when the fix and the proof command are both visible in the PR.
