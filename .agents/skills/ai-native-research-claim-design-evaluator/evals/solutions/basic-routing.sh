#!/usr/bin/env bash
set -euo pipefail

mkdir -p outputs
cat > outputs/final-response.md <<'EOF'
AI_NATIVE_SKILL_EVAL_COMPLETE
ai-native-research-claim-design-evaluator
This skill evaluates whether the project has a testable research claim, comparison groups, study design, and pilot scope.
EOF
