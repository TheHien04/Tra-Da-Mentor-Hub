#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
if [[ -z "${BACKUP_ENCRYPTION_KEY_FILE:-}" || ! -f "${BACKUP_ENCRYPTION_KEY_FILE}" ]]; then
  echo "BACKUP_ENCRYPTION_KEY_FILE must point to a protected key file" >&2
  exit 1
fi
if ! command -v mongodump >/dev/null 2>&1; then
  echo "mongodump is required (MongoDB Database Tools)" >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$backup_dir/tra-da-mentor-$timestamp.archive"
encrypted="$archive.enc"

mongodump --uri="$DATABASE_URL" --archive="$archive" --gzip
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
  -pass "file:$BACKUP_ENCRYPTION_KEY_FILE" \
  -in "$archive" -out "$encrypted"
rm -f "$archive"
# Keep an authenticated MAC beside the ciphertext. A plain SHA-256 checksum
# would allow an attacker who can replace both files to tamper undetected.
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import { createHmac } from "node:crypto";
  const [ciphertext, keyFile] = process.argv.slice(1);
  const key = readFileSync(keyFile);
  const mac = createHmac("sha256", key).update(readFileSync(ciphertext)).digest("hex");
  process.stdout.write(`${mac}  ${ciphertext}\n`);
' "$encrypted" "$BACKUP_ENCRYPTION_KEY_FILE" > "$encrypted.hmac"

echo "Encrypted backup created: $encrypted"
echo "Authenticated MAC: $encrypted.hmac"
