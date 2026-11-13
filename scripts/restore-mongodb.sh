#!/usr/bin/env bash
set -euo pipefail

archive="${1:-}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
if [[ -z "${BACKUP_ENCRYPTION_KEY_FILE:-}" || ! -f "${BACKUP_ENCRYPTION_KEY_FILE}" ]]; then
  echo "BACKUP_ENCRYPTION_KEY_FILE must point to a protected key file" >&2
  exit 1
fi
if [[ -z "$archive" || ! -f "$archive" ]]; then
  echo "Usage: RESTORE_CONFIRM=restore npm run restore:db -- /exact/path/to/backup.archive" >&2
  exit 1
fi
if [[ "${RESTORE_CONFIRM:-}" != "restore" ]]; then
  echo "Restore refused. Set RESTORE_CONFIRM=restore after verifying the target database." >&2
  exit 1
fi
if ! command -v mongorestore >/dev/null 2>&1; then
  echo "mongorestore is required (MongoDB Database Tools)" >&2
  exit 1
fi
if [[ -f "$archive.hmac" ]]; then
  expected_mac="$(awk '{print $1}' "$archive.hmac")"
  actual_mac="$(node --input-type=module -e '
    import { readFileSync } from "node:fs";
    import { createHmac } from "node:crypto";
    const [ciphertext, keyFile] = process.argv.slice(1);
    process.stdout.write(createHmac("sha256", readFileSync(keyFile)).update(readFileSync(ciphertext)).digest("hex"));
  ' "$archive" "$BACKUP_ENCRYPTION_KEY_FILE")"
  if [[ ! "$expected_mac" =~ ^[[:xdigit:]]{64}$ || "$actual_mac" != "$expected_mac" ]]; then
    echo "Authenticated backup MAC mismatch; restore refused." >&2
    exit 1
  fi
else
  echo "Authenticated MAC file missing at $archive.hmac; restore refused." >&2
  exit 1
fi

temporary_archive="$(mktemp -t tra-da-mentor-restore.XXXXXX.archive)"
trap 'rm -f "$temporary_archive"' EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass "file:$BACKUP_ENCRYPTION_KEY_FILE" \
  -in "$archive" -out "$temporary_archive"
mongorestore --uri="$DATABASE_URL" --archive="$temporary_archive" --gzip --drop
echo "Restore completed from: $archive"
