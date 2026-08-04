#!/usr/bin/env bash
# Runs on every container start AND resume (postStartCommand). A Codespace can
# live up to 30 days without ever re-running onCreateCommand, so this is the
# only place fast-moving global CLIs (Copilot CLI, gh extensions) get
# refreshed. Kept out of devcontainer.json and backgrounded so a slow/offline
# registry never adds to perceived boot time.
set -uo pipefail

LOG=/tmp/devcontainer-tool-updates.log

{
  echo "=== $(date -u +%FT%TZ) tool refresh ==="
  npm install -g @github/copilot@latest
  command -v gh >/dev/null 2>&1 && gh extension upgrade --all
} >>"$LOG" 2>&1 &
disown
