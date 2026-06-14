#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/final-response.md <<'EOF'
AI_NATIVE_SKILL_EVAL_COMPLETE
ai-native-turn-guardrail-evaluator evaluates a single user request or agent response for workflow guardrail quality.
EOF
