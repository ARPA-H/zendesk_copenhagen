#!/usr/bin/env bash
# Runs once per new Codespace (postCreateCommand). Secrets/env vars are
# available here; keep this idempotent since it can run again on rebuild.
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Populate local-only config from its committed example. `cp -n` never
# overwrites, so re-running this is always safe.
cp -n .a11yrc.json.example .a11yrc.json || true

# Remove stale git-lfs hooks. The base image has no git-lfs binary and this
# repo doesn't use LFS (.gitattributes has no `filter=lfs` entries) - leftover
# hooks from a machine where `git lfs install` once ran globally would
# otherwise block every commit/push inside the container.
if ! grep -qr 'filter=lfs' .gitattributes 2>/dev/null; then
  rm -f .git/hooks/pre-push .git/hooks/post-commit .git/hooks/post-checkout .git/hooks/post-merge
fi
