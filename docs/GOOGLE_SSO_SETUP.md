# Cấu hình Google SSO (Đăng nhập bằng Gmail)

Đăng nhập bằng Google chỉ hoạt động sau khi cấu hình. **Toàn bộ có thể làm trong Cursor** (code + .env); cần thêm **Google Cloud Console** (trình duyệt) để tạo OAuth Client.

## 1. Google Cloud Console (làm ngoài Cursor)

1. Vào [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo project (hoặc chọn project có sẵn).
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
4. Nếu chưa có OAuth consent screen: chọn **External** → điền app name, support email → Save.
5. Application type: **Web application**.
6. **Authorized redirect URIs** thêm:
   - Local: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
7. Tạo xong → copy **Client ID** và **Client secret**.

## 2. Trong project (Cursor)

1. Thêm vào **.env** (hoặc .env.example rồi copy sang .env):

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
FRONTEND_URL=http://localhost:5173
```

2. (Tùy chọn) Callback đổi code lấy token: hiện tại GET `/api/auth/google/callback` chưa đổi `code` lấy access_token Google. Để hoàn chỉnh cần:
   - Gọi `POST https://oauth2.googleapis.com/token` với `code`, `client_id`, `client_secret`, `redirect_uri`, `grant_type=authorization_code`.
   - Lấy email/name từ Google (GET `https://www.googleapis.com/oauth2/v2/userinfo` với access_token).
   - Tìm hoặc tạo User trong DB, tạo JWT (generateAccessToken, generateRefreshToken), redirect về frontend với token trong URL (ví dụ `FRONTEND_URL/login?token=JWT`).
3. Frontend: đọc `?token=...` từ URL, lưu token và chuyển vào app (đã có nút "Đăng nhập bằng Google" → mở `/api/auth/google`).

## 3. Cài dependency (nếu dùng Passport)

```bash
npm install passport passport-google-oauth20
```

Có thể thay luồng hiện tại (redirect thủ công tới Google) bằng Passport strategy; khi đó trong callback dùng `req.user` (profile từ Google) để tạo/find User và JWT.

## 4. Kiểm tra

- Vào `/login` → bấm **Đăng nhập bằng Google**.
- Nếu chưa cấu hình: có thể thấy JSON lỗi 501 hoặc redirect lỗi.
- Sau khi thêm Client ID/Secret và implement callback (đổi code lấy token + tạo JWT): bấm nút → chuyển sang Google đăng nhập → sau khi đồng ý quay lại app đã đăng nhập.
