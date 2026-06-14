#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/bare-request-response.md <<'EOF'
AI_NATIVE_BARE_REQUEST_MENU
Please choose which ai-native evaluation to run:
- ai-native-repo-maturity-evaluator
- ai-native-pr-lifecycle-evaluator
- ai-native-issue-lifecycle-evaluator
- ai-native-thread-checkpoint-evaluator
- ai-native-turn-guardrail-evaluator
- ai-native-periodic-health-evaluator
EOF
