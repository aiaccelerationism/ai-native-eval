#!/usr/bin/env sh
set -eu
mkdir -p outputs
cat > outputs/repo-routing-response.md <<'EOF'
AI_NATIVE_REPO_REQUEST_ROUTE
The user asked for whole repository evaluation, so route directly to ai-native-repo-maturity-evaluator without asking for target choice.
EOF
