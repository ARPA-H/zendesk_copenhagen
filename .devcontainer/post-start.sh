#!/usr/bin/env bash
# Runs on every container start AND resume (postStartCommand). A Codespace can
# live up to 30 days without ever re-running onCreateCommand, so this keeps
# the pinned Copilot CLI version converged (e.g. after the pin is bumped in
# devcontainer.json). Kept out of devcontainer.json and backgrounded so a
# slow/offline registry never adds to perceived boot time.
#
# SECURITY: the install itself lives in install-copilot.sh - the single
# enforcement point shared with onCreateCommand - which reads the pin from
# the repo-committed devcontainer.json, refuses anything but an exact X.Y.Z
# version, and passes --ignore-scripts. Reading the pin from the checkout on
# every resume also converges long-lived Codespaces created before a pin
# bump, without requiring a rebuild.
set -uo pipefail

LOG=/tmp/devcontainer-tool-updates.log

{
  echo "=== $(date -u +%FT%TZ) tool refresh ==="
  bash "$(dirname "${BASH_SOURCE[0]}")/install-copilot.sh"
  command -v gh >/dev/null 2>&1 && gh extension upgrade --all
} >>"$LOG" 2>&1 &
disown
