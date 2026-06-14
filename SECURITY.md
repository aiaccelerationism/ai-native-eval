# Security Policy

## Reporting A Vulnerability

Please report suspected security issues privately through the repository owner's preferred security contact or GitHub private vulnerability reporting when it is available.

Do not open a public issue for vulnerabilities that include secrets, tokens, private logs, private repository content, or exploitable details.

## Eval Artifact Safety

`ai-native-eval` inspects repository evidence and may generate local reports, snapshots, and run folders. Evaluation artifacts should not persist secrets, tokens, raw private logs, large binary artifacts, or unrelated user data.

When evidence is sensitive, summarize the finding and link only to an access-controlled source rather than copying the sensitive content into the report.

Generated local artifacts belong under `.ai-native-eval/artifacts/` unless a reviewed report is intentionally promoted into committed project evidence.
