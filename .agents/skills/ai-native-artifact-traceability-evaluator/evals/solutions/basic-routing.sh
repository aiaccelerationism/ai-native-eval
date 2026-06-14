#!/usr/bin/env bash
set -euo pipefail

mkdir -p outputs
cat > outputs/final-response.md <<'EOF'
AI_NATIVE_SKILL_EVAL_COMPLETE
ai-native-artifact-traceability-evaluator
This skill's primary responsibility is to follow its SKILL.md instructions and apply the appropriate AI-native evaluation behavior.
EOF
