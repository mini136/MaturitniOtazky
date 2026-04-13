#!/usr/bin/env sh
set -eu

REPO_DIR="${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"

cd "$REPO_DIR"

if [ ! -d .git ]; then
  echo "Repository not found: $REPO_DIR" >&2
  exit 1
fi

export DOCKER_CONFIG="${DOCKER_CONFIG:-$REPO_DIR/.docker-config}"
export BUILDX_CONFIG="${BUILDX_CONFIG:-$REPO_DIR/.buildx}"
mkdir -p "$DOCKER_CONFIG" "$BUILDX_CONFIG"

git fetch origin "$BRANCH"

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  echo "No changes on origin/$BRANCH"
  exit 0
fi

git pull --ff-only origin "$BRANCH"
docker compose up -d --build --remove-orphans
