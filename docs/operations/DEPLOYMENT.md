# Deploy — Railway + MongoDB Atlas (đã chọn sẵn)

**Quyết định:** một app Docker trên **Railway**, database **MongoDB Atlas** (free tier). Không cần tách frontend/backend.

---

## Bước 0 — Tạo file biến môi trường (trên máy bạn)

```bash
npm run setup:deploy
```

Mở file `deploy/railway.env.generated` — đã có sẵn `JWT_SECRET` / `JWT_REFRESH_SECRET` ngẫu nhiên an toàn.

Nếu đã có URI Atlas:

```bash
npm run setup:deploy -- --database-url "mongodb+srv://USER:PASS@cluster.mongodb.net/tra-da-mentor"
```

---

## Bước 1 — MongoDB Atlas (~5 phút)

1. Vào https://www.mongodb.com/cloud/atlas/register  
2. **Build a Database** → M0 FREE  
3. **Database Access** → Add user (username + password)  
4. **Network Access** → Add IP → **Allow Access from Anywhere** (`0.0.0.0/0`)  
5. **Connect** → Drivers → copy chuỗi `mongodb+srv://...`  
6. Thay `<password>` bằng mật khẩu user → dán vào `DATABASE_URL` trong file Railway

---

## Bước 2 — Railway (~5 phút)

1. https://railway.app → đăng nhập GitHub  
2. **New Project** → **Deploy from GitHub repo** → chọn repo **Tra-Da-Mentor-Hub**  
3. Railway tự nhận `Dockerfile` + `railway.toml`  
4. Service → **Settings** → **Networking** → **Generate Domain** (ví dụ `tra-da-mentor-production.up.railway.app`)  
5. **Variables** → **RAW Editor** → dán toàn bộ `deploy/railway.env.generated`  
6. Thêm/sửa dòng:

```env
DATABASE_URL=mongodb+srv://...
```

7. **Không bắt buộc** set `CORS_ORIGIN` / `BASE_URL` — Railway tự nhận qua `RAILWAY_PUBLIC_DOMAIN`  
8. **Deploy** (hoặc push lên `main` nếu đã bật auto-deploy)

---

## Bước 3 — Kiểm tra

Mở:

`https://<domain-của-bạn>.up.railway.app/api/health`

Kỳ vọng:

```json
{
  "status": "ok",
  "storage": "mongodb",
  "features": { ... }
}
```

Mở app: `https://<domain>/login` → đăng ký tài khoản thật (demo đã tắt: `ENABLE_DEMO_AUTH=false`).

---

## Tùy chọn sau khi live

| Tính năng | Biến môi trường |
|-----------|-----------------|
| Email | `SENDGRID_API_KEY` |
| Thanh toán | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` → webhook URL: `https://<domain>/api/payments/webhook` |
| Google login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` → redirect: `https://<domain>/api/auth/google/callback` |
| Zalo | `ZALO_OA_ACCESS_TOKEN` |

Sau khi đổi domain tùy chỉnh: cập nhật `CORS_ORIGIN`, `BASE_URL`, `FRONTEND_URL` = URL mới (hoặc để auto nếu vẫn dùng domain Railway).

---

## Local test trước khi đẩy

```bash
docker compose up --build
# http://localhost:5000
```

---

## CI

- `ci.yml` — build, lint, unit, E2E, verify env  
- `docker.yml` — build image + smoke `/api/health` + `/login`

---

## Checklist go-live

- [ ] `ENABLE_DEMO_AUTH=false`  
- [ ] `/api/health` → `"storage":"mongodb"`  
- [ ] Đăng ký + đăng nhập user thật  
- [ ] Atlas backup bật  
- [ ] Privacy/Terms đã đọc qua  

---

## Bảo mật production (đã tích hợp trong code)

Trước deploy chạy:

```bash
NODE_ENV=production npm run verify:env
```

| Lớp | Chi tiết |
|-----|----------|
| **API** | Mọi `/api/*` yêu cầu JWT, trừ login/register/health/webhook/OAuth |
| **Admin** | `/api/admin/*` chỉ role `admin` + rate limit |
| **JWT** | Tối thiểu 48 ký tự, secret khác nhau, server **từ chối khởi động** nếu yếu hoặc bật demo auth |
| **Rate limit** | Auth, forgot-password, API chung |
| **Headers** | Helmet (CSP, HSTS), tắt `X-Powered-By`, `trust proxy` trên Railway |
| **Input** | `express-mongo-sanitize`, XSS filter, body ≤ 1MB |
| **OAuth Google** | CSRF `state` một lần |
| **Socket.io** | Bắt buộc token; chỉ join room của chính user |
| **Client** | Access token trong `sessionStorage`, refresh trong `localStorage` |
| **Health** | Production không lộ `environment` / feature flags chi tiết |

**Bắt buộc trên Railway:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `ENABLE_DEMO_AUTH=false`.
