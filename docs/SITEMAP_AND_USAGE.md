# Sitemap & User flow – Đã bổ sung vào project

Tài liệu này mô tả **sitemap**, **user flow** (theo flow diagram) và **cách sử dụng** các chức năng đã được bổ sung vào code. Các điểm cần discuss (form mentee, push notification, video call) có gợi ý ở cuối.

---

## 1. Sitemap (theo flow)

### Đăng nhập
- **Login:** `/login` – Email + password (Google SSO sẽ bổ sung sau).
- **Register:** `/register` – Đăng ký tài khoản (role: user / mentor / mentee).

### Giao diện Mentor (theme cam)
- **Dashboard:** `/` – Số buổi mentoring, mentee còn lại (subtitle theo role).
- **Manage Mentors:** `/mentors`, `/mentors/add`, `/mentors/:id`, `/mentors/:id/edit`.
- **Đơn mentee:** `/applications` – Xem form mentee, chọn mời PV, chọn Accept sau interview.
- **Schedule:** `/schedule` – Lịch session (Google Calendar / Meet tích hợp sau).
- **Session log:** `/session-logs` – Điền thông tin sau buổi mentoring (ngày, chủ đề, điểm 1–5, cần hỗ trợ?).
- **Analytics:** `/analytics`.
- **Reviews:** `/testimonials`.

### Giao diện Mentee (theme xanh lá)
- **Dashboard:** `/` – Số buổi mentoring, mentor được kết nối.
- **Manage Mentees:** `/mentees`, `/mentees/add`, `/mentees/:id`, `/mentees/:id/edit` (nếu có quyền).
- **Schedule:** `/schedule`.
- **Session log:** `/session-logs` – Điền log sau buổi mentoring.
- **Analytics, Reviews:** như trên.

### Giao diện Admin (theme xanh dương)
- **Dashboard:** `/` – Số mentor và mentee đã kết nối.
- **Manage Mentors / Mentees / Groups:** CRUD đầy đủ.
- **Đơn mentee:** `/applications` – Gợi ý đơn, xem mentor chọn ai, trạng thái matching.
- **Session log:** `/session-logs` – Xem tất cả log; API `GET /api/session-logs/needs-support` cho danh sách “cần hỗ trợ”.
- **Export CSV:** `/admin/export` – Xuất mentors, mentees, session logs.
- **Gửi thông báo:** `/admin/notifications` – Form gửi nhắc qua Email/Zalo (cấu trúc sẵn, tích hợp gửi sau).
- **Analytics, Reviews:** như trên.

### Video call (flow)
- Hiện tại: **Schedule** có mục session, text “Google Meet” – chưa tích hợp tạo link/calendar thật.
- Sau: tích hợp Google Calendar + Google Meet (hoặc module có sẵn); pop-up điền session log khi kết thúc meeting sẽ bổ sung khi có video call trên platform.

---

## 2. User flow tóm tắt

1. **Đăng nhập** → Email/password (sau: Gmail SSO).
2. **Matching:** Mentee điền form trên web → Mentor xem đơn tại **Đơn mentee** → Chọn mời PV → (sau: chọn slot, gửi lịch Google Calendar) → PV qua Google Meet → Mentor chọn Accept → Admin có thể xem/kết nối 2 tài khoản.
3. **CRM:** Sau mỗi buổi mentoring → Mentor & Mentee vào **Session log** → Điền ngày, chủ đề, điểm 1–5, “cần team hỗ trợ?” + lý do.
4. **Admin:** Dashboard, xem log, export CSV, **Gửi thông báo** (nhắc deadline, lịch rảnh, interview, lịch gặp qua Zalo/email – form sẵn, gửi thật sau).

---

## 3. Cách sử dụng từng chức năng đã bổ sung

### 3.1 Theme theo role (Mentor cam, Mentee xanh, Admin xanh dương)
- **Cách dùng:** Đăng nhập bằng tài khoản có role `mentor` / `mentee` / `admin`. Sidebar, nút, stat card, title dùng màu theo role.
- **Kỹ thuật:** `App` set `data-role` và class `role-{role}`; CSS dùng `var(--primary-color)`, `var(--accent-color)`.

### 3.2 Session log (CRM sau buổi mentoring)
- **Vào:** Menu **Session log** hoặc Dashboard → quick action **Điền log sau buổi**.
- **Thao tác:**
  1. Bấm **Điền log sau buổi mentoring**.
  2. Chọn Mentor, Mentee, Ngày session, Chủ đề (bắt buộc).
  3. Điểm mentor / mentee (1–5), tùy chọn “Mentor/Mentee cần team hỗ trợ?” + lý do.
  4. Bấm **Lưu log**.
- **API:** `GET /api/session-logs`, `POST /api/session-logs`. Admin xem “needs support”: `GET /api/session-logs/needs-support`.

### 3.3 Đơn mentee (Matching)
- **Vào:** Menu **Đơn mentee** (chỉ Mentor & Admin).
- **Thao tác:**
  1. Xem danh sách mentee với trạng thái: Chờ xử lý / Đã mời PV / Đã PV / Đã nhận / Không nhận.
  2. Lọc theo trạng thái.
  3. **Mời PV** → **Đã PV** → **Accept** hoặc **Từ chối**.
- **Lưu ý:** Trạng thái đang cập nhật local; khi backend có field `applicationStatus` sẽ gắn API PATCH mentee.

### 3.4 Export CSV (Admin)
- **Vào:** Menu **Export CSV** (chỉ Admin).
- **Thao tác:** Bấm từng nút: **Xuất danh sách Mentors**, **Xuất danh sách Mentees**, **Xuất Session logs (CRM)**. File CSV tải về theo từng loại.

### 3.5 Gửi thông báo (Admin)
- **Vào:** Menu **Gửi thông báo** (chỉ Admin).
- **Thao tác:** Chọn đối tượng (tất cả / mentors / mentees), kênh (Email + Zalo / chỉ Email / chỉ Zalo), nhập tiêu đề và nội dung, bấm **Gửi thông báo**.
- **Lưu ý:** Chưa gửi thật; tích hợp Email/Zalo sẽ bổ sung sau (API + cấu hình + chi phí).

---

## 4. Ba điểm cần discuss (và gợi ý)

### 4.1 Mentee điền form trên web hay giữ Google Form?
- **Flow diagram:** “Điền form mentee” trên platform → mentor “Đọc form mentee” → nên **form trên web**.
- **Lợi ích form trên web:** Cập nhật ngay cho mentor, link backend (ví dụ mentee được chọn → lấy email tạo tài khoản). Đồng bộ trạng thái matching (mời PV, đã PV, accept).
- **Gợi ý:** Form mentee trên web cho MVP; nếu cần, vẫn hỗ trợ import từ Google Form (email + link sheet) rồi đồng bộ trạng thái.

### 4.2 Push notification – đẩy qua Email/Zalo? Chi phí?
- **Flow:** “Nhắc deadline chọn đơn, chọn lịch rảnh, đi interview, lịch gặp mentee qua **Zalo hoặc/và email**”.
- **Đã làm:** Trang **Gửi thông báo** (Admin) – chọn đối tượng, kênh Email/Zalo, nội dung; gửi thật sẽ tích hợp sau.
- **Chi phí:** Email (SMTP/SendGrid/SES – theo số mail/tháng); Zalo (OA + ZNS – template duyệt, giới hạn tin/tháng, cần báo giá). Nên ghi rõ trong báo giá/scope.

### 4.3 Video call – bên nào rẻ, quality, customize, chat? (100 cặp, 200 người, weekly 1h)
- **Flow:** “Interview qua Google Meet”, “Có thể gọi video call trên platform”, “Chỗ chat khi video call (không phải tính năng chat trong app)”.
- **Gợi ý:**
  - **Provider:** Google Meet (hoặc Zoom) – tạo link từ backend/module có sẵn, gửi qua email/Zalo; 100 cặp ~ 100 buổi/tuần nằm trong khả năng.
  - **Chat khi call:** Dùng chat trong Meet/Zoom (không cần chat riêng trong app).
  - **Customize:** Nếu chỉ cần “tạo link + gửi” thì Meet/Zoom đủ; nếu sau cần call nhúng trong app, branding, recording thì xem thêm (Twilio, Daily.co, chi phí).
- **Đã làm:** Schedule có UI session; tích hợp Google Calendar + Meet (tạo link, pop-up điền session log khi kết thúc) sẽ bổ sung khi có module/API.

---

## 5. Tóm tắt đã bổ sung vào code

| Hạng mục | Trạng thái | Cách dùng |
|----------|------------|-----------|
| Theme theo role (Mentor cam, Mentee xanh, Admin xanh dương) | ✅ | Đăng nhập → màu sidebar/card/button theo role |
| Session log (sau buổi mentoring, score 1–5, cần hỗ trợ) | ✅ | Menu **Session log** → form điền → lưu |
| Đơn mentee (mentor xem, mời PV, Accept/Từ chối) | ✅ | Menu **Đơn mentee** (mentor/admin) → lọc trạng thái → Mời PV / Đã PV / Accept |
| Dashboard theo role (subtitle + quick action Session log) | ✅ | Dashboard → subtitle + nút “Điền log sau buổi” |
| Export CSV (mentors, mentees, session logs) | ✅ | Menu **Export CSV** (admin) → bấm từng nút xuất |
| Gửi thông báo (Admin, Email/Zalo) | ✅ Cấu trúc | Menu **Gửi thông báo** (admin) → form; gửi thật sau |
| Google SSO / Invite / Google Calendar / Meet / Gửi thật Email-Zalo | ⏳ Sau | Theo flow khi finalize và có API/keys |

File này dùng để gửi team: sitemap, user flow, cách dùng từng tính năng và gợi ý cho 3 điểm discuss.
