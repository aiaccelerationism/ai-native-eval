#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-contract}"
if [[ $# -gt 0 ]]; then
  shift
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
SKILLS_ROOT="${REPO_ROOT}/.agents/skills"
RUN_ROOT="${REPO_ROOT}/.skill-eval-runs"

discover_skills() {
  find "${SKILLS_ROOT}" -mindepth 3 -maxdepth 3 -path "*/evals/eval.yaml" \
    | sed -E "s#${SKILLS_ROOT}/([^/]+)/evals/eval.yaml#\\1#" \
    | sort
}

selected_skills() {
  if [[ $# -gt 0 ]]; then
    printf '%s\n' "$@"
  else
    discover_skills
  fi
}

run_skillgrade() {
  local skill="$1"
  shift

  local eval_dir="${SKILLS_ROOT}/${skill}/evals"
  if [[ ! -f "${eval_dir}/eval.yaml" ]]; then
    echo "Missing skill eval file: ${eval_dir}/eval.yaml" >&2
    exit 1
  fi

  (
    cd "${eval_dir}"
    skillgrade "$@"
  )
}

run_contract() {
  local skill
  for skill in $(selected_skills "$@"); do
    echo "==> contract ${skill}"
    run_skillgrade "${skill}" \
      --validate --ci --provider=local \
      --output="${RUN_ROOT}/contract/${skill}"
  done
}

run_live() {
  local real_codex
  real_codex="$(command -v codex || true)"
  if [[ -z "${real_codex}" ]]; then
    echo "Cannot run live skill eval: codex CLI was not found in PATH." >&2
    exit 1
  fi

  export AI_NATIVE_EVAL_REAL_CODEX="${real_codex}"
  export PATH="${SKILLS_ROOT}/_eval-support/bin:${PATH}"

  local skill
  for skill in $(selected_skills "$@"); do
    echo "==> live ${skill}"
    run_skillgrade "${skill}" \
      --agent=codex --provider=local --trials=1 \
      --output="${RUN_ROOT}/live/${skill}"
  done
}

case "${MODE}" in
  contract | validate)
    run_contract "$@"
    ;;
  live)
    run_live "$@"
    ;;
  skill)
    if [[ $# -lt 2 ]]; then
      echo "Usage: $0 skill <contract|live> <skill> [skill...]" >&2
      exit 2
    fi
    SUBMODE="$1"
    shift
    case "${SUBMODE}" in
      contract | validate)
        run_contract "$@"
        ;;
      live)
        run_live "$@"
        ;;
      *)
        echo "Unknown skill mode: ${SUBMODE}" >&2
        exit 2
        ;;
    esac
    ;;
  list)
    discover_skills
    ;;
  *)
    echo "Usage: $0 <contract|live|list|skill>" >&2
    exit 2
    ;;
esac
