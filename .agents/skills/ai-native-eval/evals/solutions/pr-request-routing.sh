#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/pr-routing-response.md <<'EOF'
AI_NATIVE_PR_REQUEST_ROUTE
The user asked for PR evaluation, so route directly to ai-native-pr-lifecycle-evaluator and assume the default PR phase when no phase is supplied.
EOF
