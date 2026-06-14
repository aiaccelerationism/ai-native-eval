#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/thread-routing-response.md <<'EOF'
AI_NATIVE_THREAD_REQUEST_ROUTE
The user asked for current thread evaluation, so route directly to ai-native-thread-checkpoint-evaluator.
EOF
