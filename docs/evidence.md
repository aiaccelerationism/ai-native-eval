# Evidence And Artifact Policy

The eval should be able to prove its own behavior with durable artifacts.

## Evidence Surfaces

- Source docs: [README.md](../README.md), [AGENTS.md](../AGENTS.md), and `docs/**`.
- Skill contracts: `.agents/skills/**/SKILL.md`.
- Deterministic tests: root `tests/**` and nested eval tests.
- Skill evals: `.agents/skills/**/evals/**`.
- Project eval config: `.ai-native-eval/config.json` when present.
- Local generated eval artifacts: `.ai-native-eval/artifacts/**`.
- PR evidence: command output summaries, report links, and review findings.

## Self-Evaluation Artifacts

Committed self-evaluation artifacts are intentional exceptions to the default generated-output ignore rule. They should be append-only snapshots unless the run id explicitly represents a refreshed baseline.

The current baseline is:

```text
self-evaluations/foundation-20260614/run/
self-evaluations/foundation-20260614/report.md
```

Local ad hoc runs are generated under `.ai-native-eval/artifacts/**`, which is ignored by default. The committed run folder contains one JSON file per leaf evaluator. The compact Markdown report is generated from that folder, not hand-edited. Full HTML and normalized JSON reports may be generated locally for inspection, but they are intentionally not committed because they are much larger.

Evaluation artifacts should not persist secrets, tokens, raw private logs, large binary artifacts, or unrelated user data. Summarize sensitive evidence instead of copying it into reports.

## Recurrence Prevention

When the project discovers a durable miss, prefer this order:

1. Add or update a deterministic tool test when the miss is in aggregation, validation, config, or rendering.
2. Add or update a skill eval when the miss is in skill instructions or real agent behavior.
3. Update the relevant evaluator skill rubric when the miss is a scoring contract issue.
4. Update documentation only when the behavior already exists but was hard to discover.

Do not leave durable preferences only in chat, PR bodies, or local notes.
