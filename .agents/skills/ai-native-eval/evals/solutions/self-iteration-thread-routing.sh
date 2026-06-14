#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/self-iteration-thread-response.md <<'EOF'
AI_NATIVE_SELF_ITERATION_THREAD_ROUTE
The user asked for self_iteration mode on the current thread, so route to ai-native-thread-checkpoint-evaluator and record self_iteration as trigger metadata. The external wrapper owns reruns, loop enforcement, and stop conditions.
EOF
