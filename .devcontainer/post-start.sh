#!/usr/bin/env bash
# Runs on every container start AND resume (postStartCommand). A Codespace can
# live up to 30 days without ever re-running onCreateCommand, so this keeps
# the pinned Copilot CLI version converged (e.g. after the pin is bumped in
# devcontainer.json). Kept out of devcontainer.json and backgrounded so a
# slow/offline registry never adds to perceived boot time.
#
# SECURITY: installs the exact COPILOT_CLI_VERSION pin, never @latest - a
# mutable dist-tag auto-installed on every resume would hand a compromised
# release window control of every Codespace (which holds repo write
# credentials and user secrets).
set -uo pipefail

LOG=/tmp/devcontainer-tool-updates.log

{
  echo "=== $(date -u +%FT%TZ) tool refresh ==="
  if [ -n "${COPILOT_CLI_VERSION:-}" ]; then
    npm install -g "@github/copilot@${COPILOT_CLI_VERSION}"
  else
    echo "COPILOT_CLI_VERSION unset; skipping Copilot CLI install"
  fi
  command -v gh >/dev/null 2>&1 && gh extension upgrade --all
} >>"$LOG" 2>&1 &
disown
