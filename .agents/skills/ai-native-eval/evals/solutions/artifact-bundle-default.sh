#!/usr/bin/env bash
set -euo pipefail

mkdir -p outputs
cat > outputs/artifact-bundle-response.md <<'EOF'
AI_NATIVE_ARTIFACT_BUNDLE_DEFAULT
.ai-native-eval/artifacts/<run-id>/
Normal repository evaluations write generated artifacts to the repo-local bundle by default; /tmp is appropriate only for dry runs, tests, or when the user explicitly asks not to write generated artifacts into the repository.
EOF
