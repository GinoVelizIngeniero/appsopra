#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

pnpm install --frozen-lockfile || pnpm install

cd packages/backend
npx prisma generate

cd "$CLAUDE_PROJECT_DIR"
