#!/bin/bash
# Trà Đá Mentor - Chạy FE + BE (macOS/Linux)
# Cách dùng: mở Terminal trong Cursor, chạy: ./start-dev.sh

cd "$(dirname "$0")"

# Load nvm nếu có (để có node/npm)
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
[ -s "$HOME/.fnm/fnm" ] && eval "$("$HOME/.fnm/fnm" env)"

echo "========================================"
echo "   Trà Đá Mentor - Starting..."
echo "========================================"
echo ""

if ! command -v node &>/dev/null; then
  echo "❌ Không tìm thấy Node.js. Hãy cài Node (nvm, fnm hoặc https://nodejs.org)."
  exit 1
fi

echo "Node: $(node -v) | npm: $(npm -v)"
echo ""

npm run dev:all
