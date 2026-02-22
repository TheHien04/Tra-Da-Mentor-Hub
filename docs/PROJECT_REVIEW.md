# Project Review – Trà Đá Mentor

Đánh giá tổng quan đồ án: chức năng từ đầu đến cuối, giao diện, quy trình phần mềm, cấu trúc file và đề xuất bổ sung.

---

## 1. Chức năng từ đầu đến cuối

### 1.1 Đã làm ổn

| Chức năng | Trạng thái | Ghi chú |
|-----------|------------|--------|
| **Auth (email/password)** | ✅ Ổn | Login, Register, JWT, refresh, logout, ProtectedRoute, role (admin/mentor/mentee). |
| **RBAC + theme** | ✅ Ổn | Phân quyền theo role; theme màu theo role (Mentor cam, Mentee xanh, Admin xanh dương). |
| **CRUD Mentors / Mentees / Groups** | ✅ Ổn | API + UI đầy đủ; validation backend (schemas); frontend forms. |
| **Session Log (CRM)** | ✅ Ổn | Model SessionLog, API GET/POST, GET needs-support; trang Session Log với form + bảng + empty state + About. |
| **Mentee Applications (matching)** | ✅ Ổn | Trạng thái: pending → invited_for_interview → interviewed → accepted/rejected; API PATCH application-status; trang Applications với filter, actions. |
| **Free Slots** | ✅ Ổn | API slots (GET, POST, PATCH book); trang Free Slots: mentor thêm slot + meeting link, mentee book; filter; How to use (For Mentors / For Mentees). |
| **Admin Invite** | ✅ Ổn | API POST /invites (tạo link), GET /invites/validate/:token; trang Invite User (form + About bên phải + Invite flow 4 steps dưới). |
| **Admin Export CSV** | ✅ Ổn | Xuất Mentors, Mentees, Session logs; trang Export CSV (nút + About bên phải + When to export what dưới). |
| **Admin Send Notification** | ✅ Cấu trúc ổn | Form audience, channel (Email/Zalo), subject, message; chưa gửi thật (cần API + SMTP/Zalo). |
| **Dashboard** | ✅ Ổn | Stats theo role, quick actions (Add Mentor, Add Mentee, Session log), upcoming sessions (mock), trending skills, welcome text. |
| **Schedule** | ⚠️ Mock | Trang có; dữ liệu mock; chưa tích hợp Google Calendar/Meet. |
| **Analytics / Testimonials** | ✅ Có | Trang có; dữ liệu mock/static. |
| **Error handling** | ✅ Ổn | ErrorBoundary, NotFound, toast (react-toastify), API interceptor. |
| **UI đồng bộ** | ✅ Ổn | Toàn bộ UI tiếng Anh; empty states; About/How to use bên phải hoặc dưới; illustration/icon trên các trang. |

### 1.2 Chưa hoàn thiện / cần triển khai sau

| Hạng mục | Hiện trạng | Đề xuất |
|----------|------------|--------|
| **Google SSO** | Route `/api/auth/google` redirect; callback chưa exchange code → JWT | Hoàn thiện callback: exchange code, tạo/liên kết User, trả JWT; xem docs/GOOGLE_SSO_SETUP.md. |
| **Gửi thông báo thật** | Chỉ form; không API gửi Email/Zalo | Thêm API + cấu hình SMTP (SendGrid/SES) và/hoặc Zalo OA/ZNS. |
| **Video call / Meet** | Schedule + Slots dùng link paste; chưa tạo Meet tự động | Tích hợp Google Calendar API + tạo Meet link (hoặc module có sẵn). |
| **Invite lưu trữ** | Token invite lưu trong Map (mất khi restart server) | Lưu vào DB (collection Invite) nếu cần persist. |
| **Register với invite** | Frontend chưa đọc `?invite=TOKEN` và gọi validate | Trang Register: đọc query, gọi GET /invites/validate/:token, pre-fill email/role. |

---

## 2. Giao diện và trải nghiệm

- **Nhất quán:** Layout hai cột (form trái, About phải) cho Invite User, Export CSV, Send Notification; phần dưới (steps / use cases) cho Invite và Export; Session Log / Free Slots có phần About hoặc How to use phía dưới.
- **Empty states:** Các trang list/form có empty state (icon + text + CTA) khi chưa có dữ liệu.
- **Ngôn ngữ:** Toàn bộ UI tiếng Anh (trang, nút, label, toast, ErrorBoundary, NotFound).
- **Illustration:** Các trang chính có SVG/icon nhỏ phía trên tiêu đề.
- **Responsive:** Grid hai cột có media query 768px chuyển 1 cột.
- **Theme:** CSS variables theo role; Navbar, Dashboard, buttons dùng `var(--primary-color)` / `var(--accent-color)`.

---

## 3. Quy trình phần mềm (từ đầu đến cuối)

### 3.1 Đã có

| Bước | Có trong đồ án |
|------|-----------------|
| **Yêu cầu / spec** | docs/SPEC_VS_CODEBASE.md – so sánh spec MVP vs codebase. |
| **Sitemap / user flow** | docs/SITEMAP_AND_USAGE.md – sitemap, flow, hướng dẫn sử dụng. |
| **Thiết kế kỹ thuật** | Cấu trúc backend (routes, models, middleware, config), frontend (pages, components, services, context, types). |
| **Mã nguồn** | Backend (Node/Express, Mongoose), Frontend (React/TypeScript, Vite). |
| **Validation** | Backend: express-validator, schemas (auth, mentor, mentee, group). Frontend: Zod (schemas/forms.ts). |
| **Bảo mật** | Helmet, CORS, rate limit, sanitize, JWT, bcrypt; .env.example đầy đủ. |
| **Logging** | Winston (backend); cấu hình qua env. |
| **Test** | Jest; backend __tests__ (auth, utils); script test, test:watch, test:coverage. |
| **Tài liệu** | README (cài đặt, chạy, cấu trúc, script, auth, security); .env.example; docs GOOGLE_SSO_SETUP, SPEC_VS_CODEBASE, SITEMAP_AND_USAGE. |
| **Cấu trúc thư mục** | backend: config, controllers, middleware, models, routes, schemas, scripts, utils; src: components, context, hooks, pages, services, types, utils, config. |

### 3.2 Có thể bổ sung (để chuẩn hơn)

| Hạng mục | Gợi ý |
|----------|--------|
| **Tài liệu yêu cầu** | Một file REQUIREMENTS.md hoặc bản mô tả use case ngắn (actor – action – outcome) cho từng tính năng chính. |
| **API documentation** | File API.md hoặc OpenAPI/Swagger: danh sách endpoint, method, body, response (README đã liệt kê cơ bản; có thể mở rộng). |
| **CHANGELOG** | CHANGELOG.md ghi version và thay đổi lớn (tùy quy định đồ án). |
| **Deploy** | Ghi chú deploy (ví dụ: build frontend, env production, chạy server) trong README hoặc DEPLOY.md. |
| **Test frontend** | Thêm test React (Vitest/Jest + Testing Library) cho vài trang hoặc component quan trọng. |
| **E2E** | Nếu cần: Playwright/Cypress cho flow đăng nhập, tạo mentor, session log (tùy yêu cầu đồ án). |

---

## 4. File và tổ chức

### 4.1 Cấu trúc hiện tại (tóm tắt)

```
tra-da-mentor/
├── backend/
│   ├── config/       # database, env, logger
│   ├── controllers/  # authController
│   ├── middleware/   # auth, errorHandler, security, validation
│   ├── models/       # User, Mentor, Mentee, Group, SessionLog
│   ├── routes/       # auth, authGoogle, mentors, mentees, groups, activities, sessionLogs, slots, invites
│   ├── schemas/      # auth, mentor, mentee, group (validation)
│   ├── scripts/      # seed
│   ├── utils/        # jwt
│   ├── __tests__/    # auth.test, utils.test
│   └── server.js
├── src/
│   ├── components/   # Dashboard, Navbar, CRUD mentors/mentees/groups, Schedule, Analytics, Testimonials, ErrorBoundary, NotFound, ...
│   ├── context/      # AuthContext
│   ├── hooks/        # useAuth
│   ├── pages/        # Login, Register, SessionLog, Applications, Slots, AdminExport, AdminInvite, AdminNotification, Unauthorized
│   ├── services/     # api.ts, authService
│   ├── types/        # index, models, auth, api
│   ├── utils/        # errorHandler
│   ├── config/       # env, index
│   ├── schemas/      # forms (Zod)
│   ├── App.tsx, App.css, main.tsx
│   └── vite-env.d.ts
├── docs/             # SPEC_VS_CODEBASE, SITEMAP_AND_USAGE, GOOGLE_SSO_SETUP, PROJECT_REVIEW
├── public/
├── .env.example
├── package.json
├── README.md
└── ...
```

### 4.2 Đánh giá tổ chức

- **Backend:** Tách rõ routes, models, middleware, config, schemas; có controllers cho auth. Có thể thêm controllers cho các route khác nếu route file quá dài.
- **Frontend:** Pages cho từng màn hình; components tái sử dụng (Avatar, Badge, Skeleton, EmptyState, …); services/api.ts gom API; types tập trung; context Auth. Cách tổ chức phù hợp quy mô đồ án.
- **Types:** types/index.ts re-export; models, auth, api tách file – ổn.
- **Docs:** docs/ có spec, sitemap, Google SSO; thêm PROJECT_REVIEW (file này) giúp tổng kết.

### 4.3 Gợi ý nhỏ (tùy chọn)

- Thêm **constants** frontend (ví dụ route paths, role keys) nếu tránh magic string.
- Backend: thống nhất **response format** (ví dụ `{ success, data, message }`) và ghi trong API docs.
- Invite: lưu token vào **DB** thay vì Map nếu cần persist qua restart.

---

## 5. Kết luận và checklist nhanh

### Đã làm ổn

- Chức năng core: Auth, RBAC, CRUD, Session Log, Applications, Slots, Invite, Export CSV, form Notification.
- Giao diện: tiếng Anh, empty states, About/How to use, layout hai cột, theme theo role, responsive.
- Quy trình: spec vs codebase, sitemap/flow, cấu trúc thư mục, validation, bảo mật, logging, test backend, README và .env.example.

### Cần thêm (theo mức độ ưu tiên)

1. **Register + invite:** Đọc `?invite=TOKEN`, gọi validate, pre-fill email/role.
2. **Google SSO callback:** Exchange code → User → JWT (nếu cần SSO).
3. **API + SMTP/Zalo:** Gửi thông báo thật (khi có yêu cầu).
4. **API docs:** Mở rộng README hoặc API.md với đầy đủ endpoint.
5. **Invite persist:** Lưu invite token vào DB (nếu cần).
6. **Deploy note:** Ghi lại cách build và chạy production.

Nhìn chung đồ án **đã ổn** theo quy trình phần mềm từ đầu đến cuối: có yêu cầu/spec, thiết kế, cấu trúc rõ ràng, validation, bảo mật, test cơ bản, tài liệu. Các mục “cần thêm” chủ yếu là hoàn thiện tính năng (SSO, gửi thông báo, invite register) và tài liệu/deploy cho chuẩn hơn.
