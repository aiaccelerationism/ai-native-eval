![AI Native Eval](docs/assets/ai-native-eval-title.jpg)

*Eval is all you need* — KI-Agenten werden deutlich besser, wenn sie ein klares Evaluationsziel haben, gegen das sie optimieren können.

[English](README.md) | [中文](README_CN.md) | [Español](README_ES.md) | Deutsch | [日本語](README_JA.md)

[![CI](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml/badge.svg)](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)

**Make Repositories AI-Native** — Ein evidenzbasiertes Evaluations- und Reparatursystem, das KI-Agenten hilft, den Entwicklungsworkflow eines Repositories zu verstehen, zu bewerten und zu verbessern, bis Menschen und Agenten wiederholt prüfbare, hochwertige Änderungen liefern können.

**Gebaut für selbstverbessernde Repositories.** Erhalte einen deterministischen AI-native maturity score von `0.0 / 10`, sieh genau, warum das Repository noch nicht `10 / 10` ist, und gib Agenten den Reparaturpfad, den sie Lauf für Lauf ausführen können. Evaluiere das gesamte Repository oder gezielt den Moment, der zählt: PR, Issue, Agent Thread, User Turn oder periodischer Health Check.

## Warum ai-native-eval?

Traditionelle Repository-Checks sagen dir, ob Code baut. `ai-native-eval` fragt, ob Mensch und KI-Agent dauerhaft hochwertige Arbeit zusammen liefern können.

- **AI-native score**: erhalte einen `0.0 / 10` maturity score für das Repository.
- **Warum nicht 10/10**: sieh exakt, welche evidenzbasierten Abzüge eine perfekte Bewertung verhindern.
- **Agent repair loop**: verwandle Empfehlungen in Aufgaben, die ein Agent ausführen kann.
- **Evaluiere den richtigen Scope**: vollständige Repo-Prüfung oder gezielt PR, Issue, Agent Thread, einzelner User Turn oder periodischer Health Check.
- **Workflow policy signals**: markiere wichtige Findings als `warn` oder `error`, ohne den zugrunde liegenden Score zu verstecken.
- **Lifecycle coverage**: evaluiere Docs, Agent-Anweisungen, Issues, PRs, CI, Tests, Runtime Commands, Review-Artefakte und historische Evidenz.
- **Deterministische Aggregation**: finale Scores werden aus Evaluator-Rubrics berechnet.
- **Pluggbare Evaluatoren**: füge integrierte, BMAD- oder projektspezifische Evaluator Packs hinzu.

## Quick Start

Kopiere diesen Prompt in deinen Agenten:

```text
Evaluate my repository with ai-native-eval from https://github.com/aiaccelerationism/ai-native-eval.
```

## Report Preview

![AI Native Eval report preview](docs/assets/report-preview.png)

```text
Score: 8.2 / 10
Policy: BLOCKED (1 error · 1 warning)
Selected evaluator pack: ai-native-pr-lifecycle-evaluator
PR lifecycle: 8.2 / 10
  PR readiness: 8.0 / 10 [ERROR]
  Required checks: 9.0 / 10
  Acceptance proof: 7.6 / 10 [WARN]
    Why not 10/10:
      - PR evidence does not link every acceptance criterion to proof.
      - The closeout plan does not name the post-merge follow-up owner.
      - Visual or trace evidence is missing for the changed user-facing path.
```

Der Report gibt Menschen und Agenten dieselbe Review-Oberfläche:

- Ein `0.0 / 10` AI-native maturity score für den gewählten Scope.
- Ein ausgewähltes Evaluator Pack für Full Repo, PR, Issue, Thread, Turn, Periodic oder projektspezifische Evaluation Contexts.
- Ein verschachtelter Evaluator Tree für Docs, Agent Readiness, GitHub Workflow, CI/Tests, Local Runtime, Evidenzqualität, Architektur, BMAD Adoption, Lifecycle Workflow Checks und optionale Packs.
- Evidenzbasierte "Why not 10/10"-Abzüge.
- Empfehlungen, die zu Agent-Reparaturaufgaben werden können.
- Statisches HTML und kompaktes Markdown.
- Source-controlled Config zum Aktivieren, Deaktivieren, Umgewichten oder Hinzufügen von Evaluator Packs.
- Inkrementelle Evaluationen, die frühere Evidenz wiederverwenden können.
- Trigger metadata für one-shot, turn-inline, self-iteration, periodic oder external-event Integrationen; externe Systeme bleiben für Hooks, Scheduler, Kommentare und Repair Loops verantwortlich.
- ESLint-artige Policy Rules mit `off`, `warn` und `error`, damit Reports blocked/warning-Zustände zeigen können, ohne den numerischen Score zu verändern.

## Eingebaute Evaluator Packs

`ai-native-eval` liefert Lifecycle Entry Packs plus wiederverwendbare Evaluator Packs für Repo Foundation und BMAD Method Adoption.

| Pack | Zweck |
| --- | --- |
| `ai-native-repo-maturity-evaluator` | Vollständiger Repository-Baseline und inkrementeller Repo-Level Review. |
| `ai-native-pr-lifecycle-evaluator` | Evaluation von PR opened, review, pre-merge, post-merge und closeout. |
| `ai-native-issue-lifecycle-evaluator` | Evaluation von Issue intake, planning, follow-up und handoff. |
| `ai-native-thread-checkpoint-evaluator` | Evaluation von Agent Thread checkpoint, handoff, collaboration trace und closeout. |
| `ai-native-turn-guardrail-evaluator` | Guardrail Evaluation für einen einzelnen User Turn oder eine Agent Response. |
| `ai-native-periodic-health-evaluator` | Geplanter oder ad hoc Repository Health und Drift Review. |
| `ai-native-foundation-evaluator` | Allgemeine AI-native Repo Foundation: Operability, Docs, Agent Readiness, GitHub Workflow, CI/Test Gates, Product UX Evidence, Architektur und Evidenzdisziplin. |
| `bmad-method-evaluator` | BMAD Method Adoption und Artefakt-Maturität. |

Ein Repository kann die eingebauten Packs nutzen, projektspezifische Evaluator Packs hinzufügen oder irrelevante Bereiche deaktivieren. Der Root Skill `ai-native-eval` wählt nur das First-Level Pack aus; jedes Pack besitzt seine Child Evaluators, Phase Defaults, Policy Rules und evaluator-specific Settings selbst.

## Funktionsweise

Der Eval Flow ist wiederholbar und auditierbar.

1. Scope, Repo Root, aktuellen Commit und verfügbare Evidenz auflösen.
2. Evaluation Context bestimmen: Full Baseline, Incremental Run, Issue/PR Event, Thread Checkpoint, User Turn, Periodic Scan oder projektspezifischer Lifecycle.
3. Vorherigen Eval State lesen, falls vorhanden.
4. Effective Config aus ausgewähltem Lifecycle Root, optionaler User Config, Project Config, expliziten Overrides und evaluator-specific Config unter `evaluators[pluginId]` auflösen.
5. Run Folder mit `run.json` als Audit Snapshot schreiben.
6. Installierte Evaluator Plugins über direkte Child References auflösen.
7. Evaluatoren bei Bedarf in Execution Batches gruppieren.
8. Das Judgment jedes aktivierten Leaf Evaluators in eine eigene JSON-Datei schreiben.
9. Folder gegen Run Snapshot, installierte Manifests und Leaf Rubrics validieren.
10. Normalisierte Evaluator Nodes deterministisch aggregieren.
11. Statisches HTML und optionale Markdown/JSON Artefakte rendern.

Die Validierung erkennt inkonsistente Evaluator Outputs vor dem Rendering, damit kaputte oder unvollständige Runs nicht als polierte Reports erscheinen.

Bei einer leeren Anfrage wie "use ai-native-eval" fragt der Root Skill, welches Evaluator Pack verwendet werden soll. Wenn die Anfrage bereits ein Target nennt, etwa Repo, PR, Issue, Thread, Turn oder Periodic Check, routet er direkt und nutzt die Default Phase des Packs, falls keine Phase angegeben ist.

## Scoring

Scores werden aus Evaluator Rubrics berechnet.

- Leaf Evaluators geben Judgments gegen checklist-artige Deduction Groups aus.
- Die KI wählt passende Deductions und liefert Gründe/Evidenz.
- Das gebündelte TypeScript Tool liest das Rubric aus dem Evaluator Skill und berechnet Punkte deterministisch.
- Ein Deduction Group `budget` begrenzt doppelte Abzüge innerhalb derselben Gruppe.
- Deduction Groups müssen ihr gesamtes Budget abziehen können.
- Wenn ein Leaf nicht `10.0 / 10` ist, muss es über angewendete Deductions erklären, warum.
- Parent Scores sind gewichtete Durchschnitte anwendbarer Child Scores.
- Confidence ist getrennt vom Score und beschreibt Evidenzabdeckung.
- Policy Rules sind getrennt vom Score. Eine Regel kann ein Ergebnis als `warn` oder `error` markieren, wenn ein Score unter den konfigurierten Threshold fällt; `error` erscheint im Report als blocked, der numerische Score bleibt unverändert.

Hohe Scores brauchen wiederholte Evidenz über Docs, Issues/PRs, CI/Tests, Artefakte und Workflow-Historie hinweg. Polierte Docs allein sollten keinen High-Confidence `10 / 10` erzeugen.

## Reports

Der TypeScript Renderer erzeugt einen Drill-down HTML Report aus demselben Evaluation Tree, der fürs Scoring genutzt wird. Der Report enthält verschachtelte Node Results, Evidence Links, Recommendations, Improvement References, kopierbare Repair Prompts, Policy Status, Selected Evaluator Pack, Evaluation Context, Trigger Metadata, Evaluator Config und Reproducibility Metadata.

## Konfiguration und Persistenz

Zu evaluierende Repositories können Eval State hier speichern:

```text
.ai-native-eval/
  config.json
  state.json
  evidence-ledger.jsonl
  artifacts/
    20260614T183012Z-a1b2c3d4e5f6/
      run/
        run.json
        evaluators/
      report.html
      report.md
      report.json
      snapshot.json
      manifest.json
```

`config.json`, `state.json` und kleine Evidence Ledgers können versioniert werden, wenn sie gemeinsame Projektpolitik oder dauerhaften Evaluationszustand definieren. Evaluator-spezifische Config liegt unter `evaluators[pluginId]`, wo ein Pack eigene `additionalChildren`, `disabledChildren` und `settings` erhalten kann. Legacy-Felder `additionalRoots`, `disabled` und `contextRoutes` werden aus Kompatibilitätsgründen weiter gelesen, Reports zeigen aber nicht-fatale Deprecation Warnings.

Eine normale Evaluation schreibt standardmäßig ein timestamped generated bundle unter `artifacts/`, sodass der komplette Run als ein Verzeichnis kopiert, angehängt, reviewed oder gelöscht werden kann. Generierte Outputs unter `artifacts/` werden standardmäßig ignoriert. Geprüfte Reports sollten in einen stabilen committed Evidence Folder verschoben werden, wenn sie Teil der Repo-Historie sein sollen.

## Repo Layout

```text
ai-native-eval/
  .agents/
    skills/
      ai-native-eval/
        SKILL.md
        agents/openai.yaml
        scripts/
          eval/
            package.json
            pnpm-lock.yaml
            tsconfig.json
            src/
            fixtures/
            tests/
      ai-native-foundation-evaluator/
      ai-native-repo-maturity-evaluator/
      ai-native-pr-lifecycle-evaluator/
      ai-native-issue-lifecycle-evaluator/
      ai-native-thread-checkpoint-evaluator/
      ai-native-turn-guardrail-evaluator/
      ai-native-periodic-health-evaluator/
      bmad-method-evaluator/
      _eval-support/
        bin/codex
        grade-response.mjs
  tools/
    skill-eval.sh
  tests/
    skill-packaging.test.mjs
  package.json
```

Der Report Renderer und die deterministische Aggregation liegen im `ai-native-eval` Skill Bundle unter `.agents/skills/ai-native-eval/scripts/eval/`. Siehe [docs/architecture.md](docs/architecture.md) für Evaluator Boundaries und Plugin Resolution Details.

## Foundation Self-Evaluation

Dieses Repo evaluiert sich selbst und veröffentlicht einen strengen Baseline Report.

- Score: `3.4 / 10`
- Level: `3`
- Confidence: `high`
- Scope: Foundation Maturity plus AI Native Eval Evaluator-Systemqualität und Research Readiness; `bmad-method-evaluator` ist für diese Self-Evaluation deaktiviert.
- AI participation: Foundation Scoring reserviert 40% für AI Participation, einschließlich Agent Threads, Source Control AI Participation, Skill Activation, AI Self-Assessment, Human Follow-Through und Collaboration Trace.
- Research readiness: Das Repo hat Research Plan, Pilot Protocol und Metrics/Data Schema; strenge Abzüge bleiben für fehlende Pilot Execution und Recent-Change Follow-Through.
- Recent-change evidence: Strenge Abzüge gelten, weil der Baseline noch nicht jeden Evaluator mit Proof aus den letzten fünf PR-äquivalenten substantiellen Änderungen verlinkt.
- Run folder: `self-evaluations/foundation-20260614/run/`
- Compact report: [self-evaluations/foundation-20260614/report.md](self-evaluations/foundation-20260614/report.md)

Der Baseline wird aus per-leaf Evaluator JSON Dateien erzeugt und kann neu generiert werden mit:

```sh
pnpm self-eval:validate
pnpm self-eval:render
```

## Research Plan

Dieses Repo verfolgt außerdem einen Research Plan, um zu testen, ob eval-guided AI-native Adoption messbare Development Outcomes stärker verbessert als informelle AI-native Absicht.

- Research plan: [docs/research-plan.md](docs/research-plan.md)
- Pilot protocol: [docs/research-pilot-protocol.md](docs/research-pilot-protocol.md)
- Metrics and data schema: [docs/research-data-schema.md](docs/research-data-schema.md)

## Skill Evaluations

Jeder Skill besitzt seine Eval Cases neben seinem `SKILL.md`:

```text
.agents/skills/<skill>/evals/
  eval.yaml
  expectations/
  solutions/
```

```sh
pnpm skill-eval:contract
pnpm skill-eval:live
pnpm skill-eval:skill contract ai-native-eval
pnpm skill-eval:skill live ai-native-eval
```

Contract Evals validieren Skill Fixtures. Live Evals führen den echten Codex-Pfad aus und bleiben von der deterministischen Default-Test-Suite getrennt.
`contract` ruft keinen echten Agenten auf. `live` ruft absichtlich den echten Codex CLI auf und kann langsamer oder weniger deterministisch sein.

## Development Commands

Nützliche Commands für die Entwicklung dieses Repositories:

```sh
pnpm test
pnpm render:example
pnpm score:example
pnpm persist:example
pnpm self-eval:validate
pnpm self-eval:render
pnpm test:human
```

## Contributing

Beiträge sind willkommen. Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Development Flow, Erwartungen an Evaluator Changes und PR Checklist.

## Security

Bitte melde Sicherheitslücken privat. Siehe [SECURITY.md](SECURITY.md) für Reporting Guidance und Hinweise zu Eval Artifact Safety.

## License

MIT License. Siehe [LICENSE](LICENSE) für Details.
