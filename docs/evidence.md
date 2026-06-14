# Evidence And Artifact Policy

The eval should be able to prove its own behavior with durable artifacts.

## Evidence Surfaces

- Source docs: [README.md](../README.md), [AGENTS.md](../AGENTS.md), and `docs/**`.
- Skill contracts: `.agents/skills/**/SKILL.md`.
- Deterministic tests: root `tests/**` and nested eval tests.
- Skill evals: `.agents/skills/**/evals/**`.
- Project eval config: `.ai-native-eval/config.json` when present.
- Research planning artifacts: [research-plan.md](research-plan.md), [research-pilot-protocol.md](research-pilot-protocol.md), and [research-data-schema.md](research-data-schema.md).
- Local generated eval bundles: `.ai-native-eval/artifacts/<run-id>/**`.
- PR evidence: command output summaries, report links, and review findings.
- Human E2E evidence: command output from `pnpm test:human` or an equivalent agent-as-human run, plus the scenario tested, generated artifact paths, inspected report/screenshot/trace paths, and pass/fail outcome.

## Self-Evaluation Artifacts

Committed self-evaluation artifacts are intentional exceptions to the default generated-output ignore rule. They should be append-only snapshots unless the run id explicitly represents a refreshed baseline.

The current baseline is:

```text
self-evaluations/foundation-20260614/run/
self-evaluations/foundation-20260614/report.md
```

Local ad hoc runs are generated under `.ai-native-eval/artifacts/<run-id>/`, which is ignored by default. A generated bundle keeps the run folder, reports, snapshot, and manifest together so the evaluation can be copied, attached, reviewed, or removed as one directory. The committed run folder contains one JSON file per leaf evaluator. The compact Markdown report is generated from that folder, not hand-edited. Full HTML and normalized JSON reports may be generated locally for inspection, but they are intentionally not committed because they are much larger.

Evaluation artifacts should not persist secrets, tokens, raw private logs, large binary artifacts, or unrelated user data. Summarize sensitive evidence instead of copying it into reports.

## Human E2E Evidence

Human E2E evidence means the final user or developer path was exercised the way a human reviewer would normally try it before trusting the change. In an AI-native repository, an agent may do this on the human's behalf, but the agent must say it is acting as the human tester and leave reviewable proof.

For workflow-critical, user-facing, agent-facing, report-rendering, or evaluator-routing changes, record:

- The command or manual scenario used.
- The target behavior under test.
- The generated artifacts, reports, screenshots, traces, or logs inspected.
- The pass/fail outcome and any repair loop.

Deterministic unit tests are still required where appropriate, but they do not replace human E2E evidence for behavior that a human developer would otherwise manually verify.

## Recurrence Prevention

When the project discovers a durable miss, prefer this order:

1. Add or update a deterministic tool test when the miss is in aggregation, validation, config, or rendering.
2. Add or update a skill eval when the miss is in skill instructions or real agent behavior.
3. Update the relevant evaluator skill rubric when the miss is a scoring contract issue.
4. Update documentation only when the behavior already exists but was hard to discover.

Do not leave durable preferences only in chat, PR bodies, or local notes.
