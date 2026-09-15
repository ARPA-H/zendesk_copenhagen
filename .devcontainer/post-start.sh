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
  # The repo-committed devcontainer.json is the single source of truth for the
  # pin: containers created before the pin existed (or before a rebuild after
  # a pin bump) have a stale or missing COPILOT_CLI_VERSION env var, but this
  # script always runs against the current checkout, so reading the file here
  # converges long-lived Codespaces onto the current pin without a rebuild.
  COPILOT_PIN=$(sed -n 's/.*"COPILOT_CLI_VERSION": *"\([^"]*\)".*/\1/p' \
    "$(dirname "${BASH_SOURCE[0]}")/devcontainer.json" | head -n 1)
  COPILOT_PIN="${COPILOT_PIN:-${COPILOT_CLI_VERSION:-}}"
  # Fail closed unless the pin is an exact semver version: a config typo or a
  # dist-tag ("latest") or range ("^1.0.0") would silently reintroduce the
  # mutable resolution this script exists to prevent.
  if [[ "${COPILOT_PIN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # --ignore-scripts: the CLI ships platform binaries as optionalDependencies
    # (no lifecycle scripts required to function), so package install scripts
    # never execute under the Codespace's credentials.
    npm install -g --ignore-scripts "@github/copilot@${COPILOT_PIN}"
  else
    echo "Refusing to install @github/copilot: pin '${COPILOT_PIN}' is not an exact version"
  fi
  command -v gh >/dev/null 2>&1 && gh extension upgrade --all
} >>"$LOG" 2>&1 &
disown
