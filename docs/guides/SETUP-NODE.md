# Cài Node.js để chạy project

Khi gặp lỗi **`zsh: command not found: npm`** nghĩa là máy chưa có Node.js trong PATH (hoặc chưa cài).

## Cách 1: Cài Node bằng Homebrew (Mac)

Mở Terminal và chạy:

```bash
brew install node
```

Sau đó **đóng Terminal, mở lại**, rồi vào thư mục project và chạy:

```bash
cd "/Users/macbookofhien/Documents/Web Trà đá/tra-da-mentor"
npm run dev:all
```

## Cách 2: Cài Node bằng NVM (nên dùng nếu hay đổi phiên bản Node)

Chạy lần lượt:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Đóng Terminal, mở lại, rồi chạy:

```bash
nvm install 20
nvm use 20
cd "/Users/macbookofhien/Documents/Web Trà đá/tra-da-mentor"
npm run dev:all
```

## Cách 3: Tải bộ cài từ nodejs.org

1. Vào https://nodejs.org
2. Tải bản **LTS**, cài đặt
3. Đóng Terminal, mở lại
4. Chạy: `cd "/Users/macbookofhien/Documents/Web Trà đá/tra-da-mentor"` rồi `npm run dev:all`

---

## Nếu đã cài Node (qua NVM) nhưng vẫn báo "command not found"

Thử load NVM trước rồi mới chạy npm:

```bash
source ~/.nvm/nvm.sh
nvm use default
npm run dev:all
```

Hoặc dùng script có sẵn:

```bash
./start-dev.sh
```
