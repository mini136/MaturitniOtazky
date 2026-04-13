#!/usr/bin/env sh
set -eu

REPO_DIR="${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
LOG_FILE="$REPO_DIR/deploy/auto-update.log"

quote_path() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

Q_REPO_DIR="$(quote_path "$REPO_DIR")"
Q_LOG_FILE="$(quote_path "$LOG_FILE")"
JOB="* * * * * cd $Q_REPO_DIR && /bin/sh $Q_REPO_DIR/deploy/update.sh $Q_REPO_DIR >> $Q_LOG_FILE 2>&1"

TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -F -v "$REPO_DIR/deploy/update.sh" > "$TMP_CRON" || true
printf '%s\n' "$JOB" >> "$TMP_CRON"
crontab "$TMP_CRON"
rm -f "$TMP_CRON"

echo "Auto-update cron installed for $REPO_DIR"
