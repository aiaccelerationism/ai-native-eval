![AI Native Eval](docs/assets/ai-native-eval-title.jpg)

*Eval is all you need* — Los agentes de IA mejoran mucho más rápido cuando tienen un objetivo de evaluación claro contra el cual optimizar.

[English](README.md) | [中文](README_CN.md) | Español | [Deutsch](README_DE.md) | [日本語](README_JA.md)

[![CI](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml/badge.svg)](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)

**Make Repositories AI-Native** — Un sistema de evaluación y reparación basado en evidencia que ayuda a los agentes de IA a entender, puntuar y mejorar el flujo de desarrollo de un repositorio hasta que humanos y agentes puedan entregar cambios revisables y de alta calidad de forma repetible.

**Creado para repositorios que se mejoran a sí mismos.** Obtén una puntuación determinista de madurez AI-native de `0.0 / 10`, ve exactamente por qué el repositorio todavía no es `10 / 10`, y entrega a los agentes una ruta de reparación que puedan ejecutar una y otra vez. Ejecuta una evaluación completa del repositorio o apunta al momento que importa: PR, issue, thread de agente, turno de usuario o revisión periódica de salud.

## ¿Por qué ai-native-eval?

Las comprobaciones tradicionales dicen si el código compila. `ai-native-eval` pregunta si una persona y un agente de IA pueden seguir entregando trabajo de calidad juntos.

- **Puntuación AI-native**: obtén una puntuación de madurez `0.0 / 10` para el repositorio.
- **Por qué no es 10/10**: ve las deducciones respaldadas por evidencia que impiden la puntuación perfecta.
- **Bucle de reparación para agentes**: convierte recomendaciones en tareas ejecutables por un agente.
- **Evalúa el alcance correcto**: revisa todo el repositorio o enfócate en un PR, issue, thread, turno de usuario o revisión periódica.
- **Señales de política del workflow**: marca hallazgos importantes como `warn` o `error` sin ocultar la puntuación base.
- **Cobertura de lifecycle**: evalúa documentación, instrucciones para agentes, issues, PRs, CI, pruebas, comandos runtime, artefactos de revisión e historial de evidencia.
- **Agregación determinista**: las puntuaciones finales se calculan desde rubrics de evaluadores.
- **Evaluadores enchufables**: agrega paquetes integrados, BMAD o evaluadores específicos del proyecto.

## Quick Start

Copia este prompt a tu agente:

```text
Evaluate my repository with ai-native-eval from https://github.com/aiaccelerationism/ai-native-eval.
```

## Vista previa del reporte

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

El reporte da a humanos y agentes la misma superficie de revisión:

- Una puntuación de madurez AI-native `0.0 / 10` para el alcance seleccionado.
- Un evaluator pack seleccionado para repo completo, PR, issue, thread, turn, periodic o contextos específicos del proyecto.
- Un árbol de evaluadores que cubre docs, agent readiness, GitHub workflow, CI/tests, runtime local, calidad de evidencia, arquitectura, BMAD, lifecycle checks y paquetes opcionales.
- Deducciones "Why not 10/10" respaldadas por evidencia.
- Recomendaciones que pueden convertirse en tareas de reparación para agentes.
- Salida HTML estática y Markdown compacto.
- Configuración versionable para activar, desactivar, reponderar o agregar evaluadores.
- Evaluaciones incrementales que reutilizan evidencia previa.
- Trigger metadata para integraciones one-shot, turn-inline, self-iteration, periodic o external-event; los hooks, schedulers, comentarios y loops de reparación pertenecen a sistemas externos.
- Reglas de política estilo ESLint con severidades `off`, `warn` y `error`, para mostrar estados blocked o warning sin cambiar la puntuación numérica.

## Evaluator Packs integrados

`ai-native-eval` incluye lifecycle entry packs y evaluadores reutilizables para repo foundation y adopción de BMAD Method.

| Pack | Propósito |
| --- | --- |
| `ai-native-repo-maturity-evaluator` | Baseline completo del repositorio y revisión incremental a nivel repo. |
| `ai-native-pr-lifecycle-evaluator` | Evaluación de PR opened, review, pre-merge, post-merge y closeout. |
| `ai-native-issue-lifecycle-evaluator` | Evaluación de intake, planning, follow-up y handoff de issues. |
| `ai-native-thread-checkpoint-evaluator` | Evaluación de checkpoint, handoff, collaboration trace y closeout de threads de agente. |
| `ai-native-turn-guardrail-evaluator` | Guardrail para un turno de usuario o respuesta del agente. |
| `ai-native-periodic-health-evaluator` | Revisión programada o ad hoc de salud y drift del repositorio. |
| `ai-native-foundation-evaluator` | Base general AI-native: operabilidad, docs, agent readiness, GitHub workflow, CI/test gates, evidencia UX/producto, arquitectura y disciplina de evidencia. |
| `bmad-method-evaluator` | Adopción de BMAD Method y madurez de artefactos. |

Un repositorio puede usar los packs integrados, agregar evaluadores específicos del proyecto o desactivar áreas que no apliquen. El skill raíz `ai-native-eval` solo selecciona el pack de primer nivel; cada pack controla sus child evaluators, phases, reglas de política y settings propios.

## Cómo funciona

El flujo de evaluación está diseñado para ser repetible y auditable.

1. Resolver alcance, raíz del repo, commit actual y evidencia disponible.
2. Determinar el contexto: baseline completo, run incremental, evento issue/PR, checkpoint de thread, turno de usuario, periodic scan o lifecycle específico del proyecto.
3. Leer estado de evaluaciones previas si existe.
4. Resolver configuración efectiva desde el lifecycle root seleccionado, user config, project config, overrides explícitos y configuración bajo `evaluators[pluginId]`.
5. Escribir un run folder con `run.json` como snapshot de auditoría.
6. Resolver plugins instalados mediante referencias directas a children.
7. Agrupar evaluadores en batches cuando sea útil.
8. Escribir el juicio de cada leaf evaluator habilitado en su propio JSON.
9. Validar la carpeta contra el run snapshot, manifests instalados y leaf rubrics.
10. Agregar nodos normalizados de forma determinista.
11. Renderizar HTML estático y artefactos Markdown/JSON opcionales.

La validación detecta salidas inconsistentes antes de renderizar, para que runs rotos o incompletos no se conviertan en reportes pulidos.

Para una petición vacía como "use ai-native-eval", el skill raíz pregunta qué evaluator pack usar. Si la petición ya nombra el target, como repo, PR, issue, thread, turn o periodic check, enruta directamente y usa la phase por defecto del pack cuando no se especifica una.

## Scoring

Las puntuaciones se calculan desde evaluator rubrics.

- Los leaf evaluators emiten juicios contra deduction groups tipo checklist.
- La IA selecciona deducciones aplicables y aporta razones/evidencia.
- La herramienta TypeScript incluida lee el rubric desde el evaluator skill y calcula puntos determinísticamente.
- El `budget` de un deduction group limita penalizaciones duplicadas dentro del grupo.
- Los deduction groups deben poder deducir todo su budget.
- Si un leaf no es `10.0 / 10`, debe explicar por qué mediante deducciones aplicadas.
- Las puntuaciones padre son promedios ponderados de children aplicables.
- Confidence es independiente de score y refleja cobertura de evidencia.
- Las policy rules son independientes del score. Una regla puede marcar `warn` o `error` si la puntuación cae bajo su threshold; `error` se muestra como blocked, pero la puntuación numérica no cambia.

Las puntuaciones altas requieren evidencia repetida en docs, issues/PRs, CI/tests, artefactos e historial de workflow. Tener docs bonitas por sí solo no debería producir un `10 / 10` de alta confianza.

## Reportes

El renderer TypeScript produce un reporte HTML navegable desde el mismo árbol usado para scoring. Incluye resultados por nodo, evidence links, recomendaciones, improvement references, repair prompts copiables, policy status, selected evaluator pack, evaluation context, trigger metadata, evaluator config y metadata de reproducibilidad.

## Configuración y persistencia

Los repos evaluados pueden guardar estado bajo:

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

`config.json`, `state.json` y evidence ledgers pequeños pueden versionarse cuando definen política compartida o estado durable. La configuración por evaluador vive bajo `evaluators[pluginId]`, donde cada pack recibe sus propios `additionalChildren`, `disabledChildren` y `settings`. Los campos globales legacy `additionalRoots`, `disabled` y `contextRoutes` todavía se leen por compatibilidad, pero los reportes muestran warnings deprecados no fatales.

Una evaluación normal escribe un bundle generado con timestamp bajo `artifacts/`, para que el run completo pueda copiarse, adjuntarse, revisarse o borrarse como un solo directorio. Los outputs generados bajo `artifacts/` se ignoran por defecto. Promueve reportes revisados a una carpeta estable versionada cuando deban formar parte del historial del repo.

## Layout del repositorio

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

El renderer de reportes y la agregación determinista viven dentro del skill `ai-native-eval` en `.agents/skills/ai-native-eval/scripts/eval/`. Consulta [docs/architecture.md](docs/architecture.md) para detalles de boundaries y resolución de plugins.

## Foundation Self-Evaluation

Este repo se evalúa a sí mismo y publica un baseline estricto.

- Score: `3.4 / 10`
- Level: `3`
- Confidence: `high`
- Scope: foundation maturity más calidad del sistema evaluador AI Native Eval y research readiness; `bmad-method-evaluator` está desactivado para esta self-evaluation.
- AI participation: el scoring foundation reserva 40% para participación de IA, incluyendo agent threads, source control AI participation, skill activation, AI self-assessment, human follow-through y collaboration trace.
- Research readiness: el repo tiene research plan, pilot protocol y metrics/data schema; quedan deducciones estrictas por pilot no ejecutado y recent-change follow-through.
- Recent-change evidence: hay deducciones estrictas porque el baseline todavía no vincula cada evaluator con evidencia de las últimas cinco PR-equivalent substantive changes.
- Run folder: `self-evaluations/foundation-20260614/run/`
- Compact report: [self-evaluations/foundation-20260614/report.md](self-evaluations/foundation-20260614/report.md)

El baseline se genera desde JSON por leaf evaluator y puede regenerarse con:

```sh
pnpm self-eval:validate
pnpm self-eval:render
```

## Research Plan

El repo también mantiene un research plan para probar si la adopción AI-native guiada por evaluaciones mejora outcomes medibles frente a intención AI-native informal.

- Research plan: [docs/research-plan.md](docs/research-plan.md)
- Pilot protocol: [docs/research-pilot-protocol.md](docs/research-pilot-protocol.md)
- Metrics and data schema: [docs/research-data-schema.md](docs/research-data-schema.md)

## Skill Evaluations

Cada skill mantiene sus eval cases junto a su `SKILL.md`:

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

Los contract evals validan fixtures de skills. Los live evals ejecutan el camino real de Codex y se mantienen separados del suite determinista por defecto.
El modo `contract` no invoca un agente real. El modo `live` invoca intencionalmente el Codex CLI real y puede ser más lento o menos determinista.

## Comandos de desarrollo

Comandos útiles para desarrollar este repositorio:

```sh
pnpm test
pnpm render:example
pnpm score:example
pnpm persist:example
pnpm self-eval:validate
pnpm self-eval:render
pnpm test:human
```

## Contribuir

Las contribuciones son bienvenidas. Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para el flujo de desarrollo, expectativas de cambios en evaluadores y checklist de PR.

## Seguridad

Reporta vulnerabilidades en privado. Consulta [SECURITY.md](SECURITY.md) para el proceso y notas de seguridad sobre eval artifacts.

## Licencia

MIT License. Consulta [LICENSE](LICENSE) para más detalles.
