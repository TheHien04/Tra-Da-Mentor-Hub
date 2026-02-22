# So sánh Spec MVP vs Codebase hiện tại

Tài liệu so sánh yêu cầu từ spec (hình) với codebase Trà Đá Mentor, kèm gợi ý cho các điểm cần discuss.

---

## 0. Trạng thái sau khi bổ sung (đã code vào đồ án)

| Hạng mục | Đã code vào đồ án? | Chi tiết |
|----------|--------------------|----------|
| **Auth** | ❌ Chưa | Vẫn email/password. Google SSO + Admin invite chưa làm. |
| **Matching** | ✅ Một phần | **Đã có:** trang Đơn mentee (`/applications`), trạng thái PV (Chờ / Mời PV / Đã PV / Accept / Từ chối), nút Mời PV, Accept. **Chưa:** slot (Google Calendar), link Google Meet, backend field `applicationStatus` (đang cập nhật local). |
| **CRM session** | ✅ Có | **Đã có:** model `SessionLog`, API `GET/POST /api/session-logs`, `GET /api/session-logs/needs-support`, trang Session log (`/session-logs`) – form date, topic, score 1–5, “cần hỗ trợ?” + lý do. |
| **Notification** | ✅ Cấu trúc | **Đã có:** trang Gửi thông báo (`/admin/notifications`) – chọn đối tượng, kênh Email/Zalo, nội dung. **Chưa:** gửi thật (API + SMTP/Zalo). |
| **Reports / Export** | ✅ Có | **Đã có:** trang Export CSV (`/admin/export`) – xuất CSV Mentors, Mentees, Session logs. |
| **Video call** | ❌ Chưa | Schedule vẫn mock, chưa tích hợp Google Meet / slot. |
| **RBAC + Theme** | ✅ Có | Role + ProtectedRoute; theme màu theo role (Mentor cam, Mentee xanh, Admin xanh dương). |

**Kết luận:** Đã đưa vào đồ án: CRM session (session log), Matching (đơn mentee + trạng thái PV), Export CSV, Gửi thông báo (form), theme theo role. Chưa: Google SSO, Admin invite, slot + Google Meet, gửi thật Email/Zalo.

---

## 1. Tổng quan nhanh (Spec vs Codebase gốc)

| Hạng mục | Spec MVP | Codebase hiện tại | Ghi chú |
|----------|----------|-------------------|---------|
| **Auth** | Google SSO; Admin invite qua email | Email/password login + register | Thiếu Google OAuth, thiếu invite |
| **Matching** | Mentor xem form mentee → chọn PV → slot → Google Meet → Accept | Có CRUD + **trang Đơn mentee, trạng thái PV** (slot/Meet chưa) | Đã có UI matching; thiếu slot + Meet |
| **CRM session** | Sau mỗi session: date, topic, score 1–5, "needs support" | **Đã có SessionLog + API + form Session log** | ✅ Đã bổ sung |
| **Notification** | Email + Zalo | **Đã có form Gửi thông báo (admin)**; gửi thật chưa | Cấu trúc sẵn |
| **Reports / Export** | KPI + export CSV | **Đã có Export CSV (mentors, mentees, session logs)** | ✅ Đã bổ sung |
| **Video call** | Google Meet (tích hợp module có sẵn) | Schedule có text "Google Meet", chưa tích hợp | Chưa |
| **RBAC** | Mentee / Mentor / Admin | Có role + ProtectedRoute + **theme theo role** | ✅ Đã bổ sung |

---

## 2. Chi tiết từng phần

### 2.1 Authentication / SSO

**Spec:**
- Login bằng Google (OAuth2).
- Admin mời user mới qua email.

**Codebase:**
- Login/register bằng email + password.
- User model: email, password, name, role, isActive, refreshTokens.
- Không có Google OAuth, không có flow “invite by email” (token invite, set password/SSO).

**Kết luận:** Cần bổ sung Google SSO và “Admin invite user by email”.

---

### 2.2 Matching (Mentor ↔ Mentee)

**Spec:**
- Mentor xem form/đơn mentee trên web.
- Mentor chọn mentee để mời phỏng vấn, chọn slot (tích hợp module chọn giờ có sẵn).
- Tạo/dùng link Google Meet cho buổi PV.
- Sau PV: mentor chọn Accept; Admin có quyền override.
- Admin theo dõi trạng thái: “interview invited”, “interviewed”, “accepted”, “not accepted”.

**Codebase:**
- Có Mentor, Mentee, Group (CRUD, assign mentee ↔ mentor).
- Không có:
  - Trạng thái mentee theo giai đoạn matching (invited / interviewed / accepted / not accepted).
  - Luồng “xem đơn → chọn PV → chọn slot → Meet → Accept”.
  - Tích hợp module chọn giờ hoặc tạo link Google Meet.

**Kết luận:** Cần thiết kế luồng matching (status, API, UI) và tích hợp module slot + Google Meet.

---

### 2.3 CRM – Ghi nhận session 1:1

**Spec:**
- Sau mỗi session: mentor và mentee đều nhập (1) ngày session, (2) chủ đề, (3) điểm 1–5, (4) tùy chọn “needs admin support” + lý do.
- Admin: dashboard số session/cặp, tiến độ cohort, danh sách “needs support”, xem mọi feedback.

**Codebase:**
- Mentee có `feedback[]`: mentorId, feedback, rating, createdAt — không đủ cấu trúc (thiếu topic, needsSupport, đồng bộ 2 phía mentor/mentee).
- Activities: mock, không lưu session thật.
- Không có model “Session log” (date, topic, score 1–5, needsSupport, mentorId, menteeId).

**Kết luận:** Cần model Session (hoặc MentoringSession) đúng spec + API + form điền cho cả mentor và mentee + màn “needs support” cho Admin.

---

### 2.4 Notifications

**Spec:** Nhắc lịch PV/session, nhắc điền CRM, cảnh báo tiến độ chậm; gửi qua Email và Zalo.

**Codebase:** Không có gửi email, không tích hợp Zalo.

**Kết luận:** Cần thiết kế kênh (email + Zalo), template, và chi phí (xem phần discuss bên dưới).

---

### 2.5 Reports / Export

**Spec:** Màn KPI (số session, điểm TB, cặp chậm tiến độ); export CSV theo cohort / mentor / mentee.

**Codebase:** AnalyticsPage dùng data mock; không có API export CSV.

**Kết luận:** Cần API export CSV + UI nút export (và nếu cần, API KPI thật từ DB).

---

### 2.6 Schedule / Time slot / Video call

**Spec:** Dùng module chọn giờ có sẵn; interview trên Google Meet (link từ hệ thống hoặc module có sẵn).

**Codebase:** ScheduleList hiển thị session (mock), có ghi “Online - Google Meet” / “Zoom”; không có tích hợp calendar thật, không tạo link Meet.

**Kết luận:** Cần tích hợp “existing free time selection module” + tạo/hiển thị link Google Meet cho từng buổi PV/session.

---

## 3. Các điểm cần discuss (theo câu hỏi anh đưa)

### 3.1 Mentee điền form trên web hay giữ Google Form?

**So sánh nhanh:**

| | Form trên web | Giữ Google Form |
|--|----------------|------------------|
| Mentor xem đơn | Có thể xem ngay trên platform, filter, sort | Phải xem sheet/export hoặc sync qua API |
| Link backend | Tạo mentee + user từ email khi “accepted”, một nguồn dữ liệu | Cần sync/import hoặc duplicate (form → sheet → DB) |
| Trải nghiệm mentee | Một nơi: đăng ký → (sau này) login cùng hệ thống | Quen thuộc, không cần tài khoản lúc nộp đơn |
| Công sức dev | Form + validation + API + permission (mentor chỉ xem đơn chưa match) | Tích hợp Google Form API + sync/import; có thể đơn giản hơn nếu đã có quy trình |

**Gợi ý:**  
- **Nếu mục tiêu dài hạn là mentor xem đơn ngay, assign trạng thái (invited/interviewed/accepted) và tạo tài khoản từ email khi accept** → form trên web sẽ “link backend tiện hơn” và cập nhật real-time cho mentor.  
- **Nếu hiện tại quy trình đã ổn với Google Form và muốn MVP nhanh** → có thể giữ Form, bổ sung API import/sync (hoặc admin nhập tay) + trạng thái matching trên web; sau đó có thể chuyển dần sang form trên web.

Có thể **finalize**: “MVP: hỗ trợ cả hai – (1) Import mentee từ Google Form (email + link sheet), (2) Tùy chọn cho mentee điền form trên web; mentor luôn xem danh sách đơn và trạng thái trên platform.”

---

### 3.2 Push notification – ngoài platform, đẩy qua Email / Zalo? Chi phí?

**Spec:** Admin gửi thông báo cho mentor/mentee; ngoài trong platform thì đẩy qua Email và Zalo.

**Khả năng kỹ thuật:**
- **Email:** SMTP (SendGrid, Mailgun, SES…) hoặc API email; chi phí thường theo số email/tháng; dễ tích hợp.
- **Zalo:** Zalo OA (Official Account) + ZNS (Zalo Notification Service); template phải duyệt; có giới hạn tin/tháng và chi phí (cần báo giá từ đối tác Zalo / team Biz).

**Gợi ý:**  
- Trong spec đã ghi “Email và Zalo” → **đẩy qua email và Zalo là đúng yêu cầu**, không chỉ trong platform.  
- Cần **làm rõ với team/bên báo giá**: (1) Giới hạn số tin Zalo/tháng và chi phí; (2) Email: dùng SMTP nội bộ hay dịch vụ (ước lượng 400 MAU, ~1000 session/tháng → số email nhắc nhở/tháng để ước cost).

Có thể **finalize**: “Notification: trong app (inbox/alert) + Email (bắt buộc cho MVP) + Zalo (nếu báo giá và template ổn); ghi rõ giới hạn và chi phí Zalo trong báo giá.”

---

### 3.3 Video call – bên nào rẻ hơn, quality, customize, chat khi call? (100 cặp, 200 người, weekly 1 tiếng)

**Spec:** Phỏng vấn trên Google Meet; không có in-platform call/call recording trong MVP.

**So sánh nhanh (cho 100 cặp, ~200 người, 1h/tuần):**

| | Google Meet | Zoom | Twilio / custom |
|--|-------------|------|------------------|
| **Chi phí** | Có gói free (giới hạn 1h, số người); Gói trả phí theo host | Tương tự, gói Pro/Business | Trả theo phút + số participant; thường đắt hơn cho 100 cặp |
| **Chất lượng** | Ổn định, quen thuộc | Ổn định | Phụ thuộc tích hợp |
| **Customize** | Nhúng iframe/link; ít customize giao diện trong app | API tạo meeting, deep link | Custom UI, branding, tích hợp sâu |
| **Chat khi call** | Có chat trong Meet | Có chat trong Zoom | Tùy implementation |

**Gợi ý:**  
- **Rẻ và đủ dùng cho MVP:** Google Meet hoặc Zoom (tạo meeting/link từ backend hoặc từ “module có sẵn”), gửi link qua email/Zalo.  
- **Chat khi video call:** Cả Meet và Zoom đều có chat trong call; spec không yêu cầu chat riêng trong platform → dùng chat trong Meet/Zoom là đủ.  
- **Customize:** Nếu chỉ cần “tạo link → gửi cho mentee” thì Meet/Zoom đủ; nếu sau này cần gọi nhúng trong app, branding, recording… thì cần đánh giá lại (Twilio, Daily.co, etc.) và chi phí.

Có thể **finalize**: “Video call MVP: Google Meet (hoặc Zoom) – tạo link từ module/backend, gửi qua email/Zalo; chat dùng trong Meet/Zoom; không custom call trong app cho MVP. Scale 100 cặp ~ 100 buổi/tuần nằm trong khả năng Meet/Zoom.”

---

## 4. Sitemap & User flow gợi ý (để mọi người cân nhắc)

### 4.1 Sitemap (high-level)

- **Public:** Login (Google SSO), Register (nếu không dùng invite-only).
- **Admin:** Dashboard, User management (invite, list), Mentee applications (list, status, override), Session/CRM overview, Needs support list, Reports & Export CSV, (sau này) Notification config.
- **Mentor:** Dashboard, Mentee applications (xem form, trạng thái), Chọn mentee + slot (link module), Xem lịch PV / session, CRM – điền session log, (sau này) Notifications.
- **Mentee:** Dashboard, Form đăng ký (nếu làm trên web), Chọn slot phỏng vấn (link module), Xem lịch PV / session, CRM – điền session log, (sau này) Notifications.

### 4.2 User flow chính (tóm tắt)

1. **Onboarding:** Admin invite (email) → User login Google SSO → Hoàn thành profile (nếu cần).
2. **Matching:** Mentor xem form mentee → Chọn mentee + slot (module) → Interview (Google Meet) → Accept; Admin xem/override trạng thái.
3. **CRM:** Sau mỗi session → Mentor & Mentee vào màn “Session log” → Nhập date, topic, score 1–5, “needs support” (optional).
4. **Monitoring:** Admin xem dashboard, danh sách needs support, gửi nhắc (Email/Zalo), Export CSV.

---

## 5. Checklist triển khai so với spec

- [ ] Google SSO (OAuth2).
- [ ] Admin invite user (email).
- [ ] Mentee form (trên web và/or import từ Google Form) + mentor xem đơn.
- [ ] Trạng thái mentee: interview invited / interviewed / accepted / not accepted.
- [ ] Tích hợp module chọn slot + tạo/lưu link Google Meet (hoặc Zoom).
- [ ] Model + API Session log (date, topic, score 1–5, needsSupport).
- [ ] UI điền session log (mentor + mentee).
- [ ] Admin: dashboard, needs support list, xem feedback.
- [ ] Notification: Email (+ Zalo nếu có báo giá).
- [ ] Reports: KPI thật + Export CSV (cohort / mentor / mentee).

Tài liệu này có thể dùng để review với team và finalize spec (form mentee, notification, video call) trước khi estimate chi tiết từng hạng mục.
