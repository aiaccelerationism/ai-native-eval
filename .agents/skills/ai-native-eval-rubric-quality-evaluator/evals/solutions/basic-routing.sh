#!/usr/bin/env bash
set -euo pipefail

mkdir -p outputs
cat > outputs/final-response.md <<'EOF'
AI_NATIVE_SKILL_EVAL_COMPLETE
ai-native-eval-rubric-quality-evaluator
This skill evaluates whether evaluator rubrics use concrete deduction groups, complete budgets, and repairable evidence.
EOF
