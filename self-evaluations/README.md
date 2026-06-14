# Self-Evaluations

This directory stores curated self-evaluation baselines that are intentionally committed for review.

Local ad hoc eval runs belong under `.ai-native-eval/artifacts/` and stay ignored. Shared project config belongs in `.ai-native-eval/config.json` and can be committed. When a run is worth committing, copy or move the reviewed run folder and compact report into a stable directory here.

Current baseline:

```text
self-evaluations/foundation-20260614/
  run/
    run.json
    evaluators/*.json
  report.md
```

Commit compact Markdown reports by default. Full HTML and normalized JSON reports can be generated locally with the eval CLI when needed, but they should not be committed unless a reviewer explicitly asks for them.
