#!/usr/bin/env sh
set -eu

REPO_DIR="${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
LOG_FILE="$REPO_DIR/deploy/auto-update.log"
JOB="* * * * * cd $REPO_DIR && /bin/sh $REPO_DIR/deploy/update.sh $REPO_DIR >> $LOG_FILE 2>&1"

TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -F -v "$REPO_DIR/deploy/update.sh" > "$TMP_CRON" || true
printf '%s\n' "$JOB" >> "$TMP_CRON"
crontab "$TMP_CRON"
rm -f "$TMP_CRON"

echo "Auto-update cron installed for $REPO_DIR"
