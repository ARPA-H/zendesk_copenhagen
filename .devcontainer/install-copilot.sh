#!/usr/bin/env bash
# Single enforcement point for installing the Copilot CLI, used by both
# onCreateCommand (container creation / prebuild) and post-start.sh (every
# start/resume), so no install path can drift from the security posture:
#
# - The pin is read from the repo-committed devcontainer.json (single source
#   of truth, always current in the checkout even on containers built before
#   a pin bump), with the COPILOT_CLI_VERSION env var as fallback.
# - Fail closed unless the pin is an exact X.Y.Z version: a config typo, a
#   dist-tag ("latest") or a semver range would silently reintroduce mutable
#   package resolution.
# - --ignore-scripts: the CLI ships platform binaries as optionalDependencies
#   (no lifecycle scripts required to function), so package install scripts
#   never execute under the Codespace's credentials.
set -uo pipefail

PIN=$(sed -n 's/.*"COPILOT_CLI_VERSION": *"\([^"]*\)".*/\1/p' \
  "$(dirname "${BASH_SOURCE[0]}")/devcontainer.json" | head -n 1)
PIN="${PIN:-${COPILOT_CLI_VERSION:-}}"

if [[ "${PIN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  npm install -g --ignore-scripts "@github/copilot@${PIN}"
else
  echo "Refusing to install @github/copilot: pin '${PIN}' is not an exact version" >&2
  exit 1
fi
