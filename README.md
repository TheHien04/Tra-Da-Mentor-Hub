# Trà Đá Mentor Hub

<p align="center">
  <strong>Nền tảng quản lý mentoring</strong> — kết nối Mentor & Mentee, lịch phỏng vấn, nhật ký buổi học, analytics và công cụ admin.
</p>

<p align="center">
  <a href="#tính-năng-chính">Tính năng</a> ·
  <a href="#giao-diện-screenshots">Screenshots</a> ·
  <a href="#cài-đặt">Cài đặt</a> ·
  <a href="#bảo-mật">Bảo mật</a> ·
  <a href="#triển-khai-production">Deploy</a>
</p>

---

## Giới thiệu

**Trà Đá Mentor Hub** là ứng dụng web full-stack giúp chương trình mentoring vận hành end-to-end: quản lý hồ sơ mentor/mentee, nhóm, đơn đăng ký, slot phỏng vấn, session logs (CRM), broadcast thông báo, testimonials, xuất CSV và dashboard phân tích.

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19, TypeScript, Vite, TanStack Query, i18n (EN / VI / JP / KR / CN) |
| Backend | Node.js 20+, Express 5, Mongoose, JWT + refresh token |
| Tích hợp (tùy chọn) | SendGrid, Zalo OA, Google Calendar, OpenAI, Stripe, Sentry |

---

## Tính năng chính

- **Xác thực & phân quyền** — Đăng nhập, đăng ký (kèm invite link), Google OAuth, JWT refresh, role Admin / Mentor / Mentee.
- **Quản lý Mentor & Mentee** — CRUD, avatar, track/chuyên môn, tìm kiếm nhanh, chi tiết hồ sơ.
- **Nhóm & đơn đăng ký** — Nhóm mentoring, duyệt application status.
- **Lịch & slot** — Schedule tổng quan, slot trống, đặt lịch phỏng vấn, đồng bộ Google Calendar (khi cấu hình).
- **Session logs** — Ghi nhận sau mỗi buổi mentoring, điểm, flag cần hỗ trợ, KPI & lọc.
- **Admin** — Gửi thông báo in-app (+ email/Zalo nếu server đã bật), mời user, export CSV, testimonials.
- **Analytics & AI** — KPI, biểu đồ xu hướng, Smart Match / AI Insights (OpenAI tùy chọn).
- **Production-ready** — Mongo bắt buộc khi `NODE_ENV=production`, health check, Docker, script `create:admin`, E2E Playwright.

---

## Giao diện (Screenshots)

> Ảnh demo nằm trong thư mục [`Images/`](./Images/). Giao diện hỗ trợ **light / dark mode**.

### Đăng nhập & đăng ký

| Đăng nhập (light) | Đăng nhập (dark) |
|:---:|:---:|
| ![Login light](./Images/Login%20light.jpg) | ![Login dark](./Images/Login%20dark.jpg) |

| Tạo tài khoản (light) | Tạo tài khoản (dark) |
|:---:|:---:|
| ![Create account light](./Images/Create%20account%20light.jpg) | ![Create account dark](./Images/Create%20account%20dark.jpg) |

### Dashboard

| Tổng quan (light) | Chi tiết (light) |
|:---:|:---:|
| ![Dashboard light 1](./Images/Dashboard%20light%201.jpg) | ![Dashboard light 2](./Images/Dashboard%20light%202.jpg) |

| Dashboard (dark) |
|:---:|
| ![Dashboard dark](./Images/Dashboard%20dark%201.jpg) |

### Mentor & Mentee

| Danh sách Mentor (light) | Danh sách Mentor (dark) |
|:---:|:---:|
| ![Mentor light](./Images/Mentor%20light.jpg) | ![Mentor dark](./Images/Mentor%20dark.jpg) |

| Danh sách Mentee | Thêm Mentor | Thêm Mentee |
|:---:|:---:|:---:|
| ![Mentees](./Images/Mentees.jpg) | ![Add mentor](./Images/Add%20mentor.jpg) | ![Add mentee](./Images/Add%20mentee.jpg) |

| Sửa Mentor | Sửa Mentee | Chi tiết Mentee |
|:---:|:---:|:---:|
| ![Edit mentor](./Images/Edit%20mentor.jpg) | ![Edit mentee](./Images/Edit%20mentee.jpg) | ![Mentee details](./Images/Mentee%20details.jpg) |

| Tìm kiếm nhanh |
|:---:|
| ![Quick search](./Images/Quick%20search.jpg) |

### Đơn đăng ký, lịch & slot

| Applications | Schedule | Free slots |
|:---:|:---:|:---:|
| ![Application](./Images/Application.jpg) | ![Schedule](./Images/Schedule.jpg) | ![Free slots](./Images/Free%20slots.jpg) |

### Session logs

| Nhật ký buổi mentoring |
|:---:|
| ![Session logs](./Images/Session%20logs.jpg) |

### Analytics & AI Insights

| Analytics (light) | Analytics (dark) |
|:---:|:---:|
| ![Analytics light](./Images/Analytics%20light.jpg) | ![Analytics dark 1](./Images/Analytics%20dark%201.jpg) |

| Analytics chi tiết (light) | Analytics chi tiết (dark) |
|:---:|:---:|
| ![Analytics light 2](./Images/Analytics%20light%202.jpg) | ![Analytics Dark 2](./Images/Analytics%20Dark%202.jpg) |

| AI Insights |
|:---:|
| ![AI Insights](./Images/AI%20Insights.jpg) |

### Testimonials

| Testimonials | Quản lý testimonials |
|:---:|:---:|
| ![Testimonials 1](./Images/Testimonials%201.jpg) | ![Testimonials 2](./Images/Testimonials%202.jpg) |

### Admin

| Gửi thông báo | Mời user | Export dữ liệu |
|:---:|:---:|:---:|
| ![Notifications](./Images/Notifications.jpg) | ![Invite user](./Images/Invitie%20user.jpg) | ![Export data](./Images/Export%20data.jpg) |

---

## Cài đặt

### Yêu cầu

- **Node.js** ≥ 20  
- **MongoDB** (local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas))  
- **npm** ≥ 9  

### Bước 1 — Clone & cài dependency

```bash
git clone https://github.com/TheHien04/Tra-Da-Mentor-Hub.git
cd Tra-Da-Mentor-Hub
npm install
```

### Bước 2 — Biến môi trường

```bash
cp .env.example .env
```

Chỉnh `.env` — **không commit file này**. Tối thiểu cho dev:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/tra-da-mentor
JWT_SECRET=<openssl rand -hex 64>
JWT_REFRESH_SECRET=<openssl rand -hex 64 khác>
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
ENABLE_DEMO_AUTH=true
```

Tạo secret mạnh:

```bash
openssl rand -hex 64
```

### Bước 3 — Chạy dev

```bash
# Frontend :5173 + Backend :5000
npm run dev:all
```

Tùy chọn seed dữ liệu demo:

```bash
npm run seed
```

Demo admin (khi `ENABLE_DEMO_AUTH=true`): `admin@example.com` / `AdminPass123`

### Scripts hữu ích

| Lệnh | Mô tả |
|------|--------|
| `npm run build` | Build production frontend |
| `npm run start:prod` | Build + chạy server production |
| `npm run test:unit` | Unit tests backend |
| `npm run test:frontend` | Vitest frontend |
| `npm run test:e2e` | Playwright E2E |
| `npm run verify:env` | Kiểm tra biến môi trường production |
| `npm run check:secrets` | Đảm bảo không track file nhạy cảm |
| `npm run create:admin` | Tạo admin production (Mongo) |
| `npm run docker:up` | Docker Compose (app + Mongo) |

---

## Triển khai production

1. Đặt `NODE_ENV=production`, `ENABLE_DEMO_AUTH=false`.
2. Dùng MongoDB Atlas (hoặc cluster riêng) — **bắt buộc**; server sẽ không chạy memory fallback.
3. Chạy `npm run verify:env` trước khi deploy.
4. Tạo admin đầu tiên:  
   `npm run create:admin -- admin@your.org "Admin Name" 'YourSecurePass123!'`
5. Volume cho avatar: mount `backend/uploads` (đã có trong `docker-compose.yml`).

Chi tiết Railway / Render: xem [DEPLOY.md](./DEPLOY.md) (nếu có trong repo).

---

## Bảo mật

Dự án được cấu hình **không đưa secrets lên Git**:

| Không commit | Được commit |
|--------------|-------------|
| `.env`, `.env.*` | `.env.example` |
| `deploy/*.generated`, JWT thật | `deploy/*.template` |
| `*.pem`, `credentials.json` | Mã nguồn, screenshots |
| `backend/uploads/*` (avatar user) | `backend/uploads/avatars/.gitkeep` |

Trước khi push, chạy:

```bash
npm run check:secrets
```

**Khuyến nghị production**

- JWT ≥ 64 ký tự hex, `JWT_SECRET` ≠ `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` chỉ domain frontend
- Tắt `ENABLE_DEMO_AUTH`
- Bật HTTPS; cấu hình `SENTRY_DSN` / `VITE_SENTRY_DSN` nếu dùng Sentry
- SendGrid / Stripe / Google keys chỉ trên server env

---

## Cấu trúc thư mục

```
Tra-Da-Mentor-Hub/
├── Images/                 # Screenshots README (không chứa dữ liệu user)
├── backend/
│   ├── controllers/        # Auth, analytics, uploads, calendar…
│   ├── models/             # User, Mentor, Mentee, Slot, Invite…
│   ├── routes/             # REST API /api/*
│   ├── services/           # Stores, matching AI, invites
│   └── server.js
├── src/                    # React SPA
├── e2e/                    # Playwright tests
├── scripts/                # deploy, locales, create-admin, verify-env
├── .env.example            # Mẫu biến môi trường (an toàn commit)
└── docker-compose.yml
```

---

## API (tóm tắt)

Base URL: `/api` · Auth: `Authorization: Bearer <accessToken>`

| Nhóm | Ví dụ |
|------|--------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `register`, `refresh` |
| CRM | `/api/mentors`, `/api/mentees`, `/api/groups` |
| Vận hành | `/api/slots`, `/api/session-logs`, `/api/activities` |
| Admin | `/api/admin/broadcast`, `/api/invites`, `/api/analytics/summary` |

---

## Testing

```bash
npm run test:unit
npm run test:frontend
npm run check:locales
npm run test:e2e          # cần Mongo + dev:all hoặc CI
```

---

## License

MIT — see repository license file.

## Contributors

Trà Đá Community · [TheHien04](https://github.com/TheHien04)
