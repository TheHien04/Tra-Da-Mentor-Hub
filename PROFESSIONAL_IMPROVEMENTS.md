# Trà Dá Mentor Platform

**Nền tảng kết nối Mentor và Mentee, hỗ trợ phát triển sự nghiệp và kỹ năng mềm**

## 🌟 Tính Năng Chính

- **Quản Lý Mentor**: Tạo, chỉnh sửa, xóa và xem chi tiết thông tin mentor
- **Quản Lý Mentee**: Quản lý thông tin học viên, theo dõi tiến độ
- **Nhóm Học Tập**: Tạo và quản lý nhóm học tập có cấu trúc
- **Lịch Trình**: Xem lịch meeting dưới dạng danh sách và lịch
- **Phân Tích**: Dashboard với thống kê và biểu đồ
- **Đánh Giá**: Hệ thống đánh giá và nhận xét
- **Giao Diện Đẹp**: Thiết kế hiện đại với animations mượt mà

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** - UI Library
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 6.3.5** - Build tool
- **React Router 7.6.0** - Routing
- **Axios** - HTTP Client
- **React Icons** - Icon library
- **Recharts** - Charts & Visualizations
- **React Toastify** - Notifications

### Backend

- **Node.js + Express 5.1.0** - Server
- **MongoDB + Mongoose 8.15.0** - Database
- **CORS** - Cross-origin support
- **Dotenv** - Environment variables

## 📋 Requirements

- Node.js 18+
- MongoDB local hoặc cloud

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd tra-da-mentor
npm install
```

### 2. Cấu Hình Environment

```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Chạy Development Server

```bash
# Terminal 1: Frontend (Port 5173)
npm run dev

# Terminal 2: Backend (Port 5000)
npm run dev:server

# Hoặc chạy cả hai cùng lúc
npm run dev:all
```

### 4. Truy Cập

- Frontend: http://localhost:5173
- API: http://localhost:5000/api

## 📁 Project Structure

```
tra-da-mentor/
├── src/
│   ├── components/          # React components
│   ├── services/           # API services
│   ├── config/             # Configuration
│   ├── utils/              # Utilities & helpers
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── backend/
│   ├── server.js           # Express server
│   ├── models/             # MongoDB schemas
│   └── routes/             # API routes
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏗️ Architecture

### Frontend Architecture

- **Component-based**: Reusable React components
- **API Service Layer**: Centralized axios instance với error handling
- **Type Safety**: Full TypeScript coverage
- **Responsive Design**: Mobile-first approach

### Backend Architecture

- **RESTful API**: Standard REST endpoints
- **MongoDB Models**: Mongoose schemas
- **Express Routes**: Organized route handlers
- **CORS**: Configured for development

## 🔐 Improvements Made

✅ **SEO & Meta Tags**: Updated title, description, og:tags
✅ **Environment Config**: Support VITE_API_URL environment variable
✅ **Error Handling**: Centralized error handler với toast notifications
✅ **Type Safety**: Fixed TypeScript `any` types
✅ **404 Page**: Professional not-found page
✅ **API Timeout**: 10s timeout cho requests
✅ **Request Interceptors**: Centralized error handling

## 📝 API Endpoints

### Mentors

```
GET    /api/mentors              # Get all mentors
GET    /api/mentors/:id          # Get mentor by ID
POST   /api/mentors              # Create mentor
PATCH  /api/mentors/:id          # Update mentor
DELETE /api/mentors/:id          # Delete mentor
```

### Mentees

```
GET    /api/mentees              # Get all mentees
GET    /api/mentees/:id          # Get mentee by ID
POST   /api/mentees              # Create mentee
PATCH  /api/mentees/:id          # Update mentee
DELETE /api/mentees/:id          # Delete mentee
```

### Groups

```
GET    /api/groups               # Get all groups
GET    /api/groups/:id           # Get group by ID
POST   /api/groups               # Create group
PATCH  /api/groups/:id           # Update group
DELETE /api/groups/:id           # Delete group
```

## 🎯 Performance

- **Bundle Size**: ~452 KB (JS + CSS)
- **Build Time**: ~2s
- **Type Checking**: 0 errors
- **Modules**: 121

## 💡 Best Practices Implemented

1. **Responsive Design** - Mobile-first approach
2. **Type Safety** - Full TypeScript coverage
3. **Error Handling** - Centralized error management
4. **Component Reusability** - Shared UI components
5. **Code Organization** - Separation of concerns
6. **Environment Management** - Environment-based config
7. **API Layer** - Abstracted API calls
8. **Animations** - Smooth, professional transitions

## 🔄 Future Improvements

- [ ] Authentication & Authorization
- [ ] Form validation library (Zod/Yup)
- [ ] State management (Zustand/Redux)
- [ ] Unit & E2E tests
- [ ] Pagination for large datasets
- [ ] Real-time notifications
- [ ] File uploads
- [ ] Advanced search & filters
- [ ] User roles & permissions
- [ ] Dark mode support

## 👨‍💻 Development Tips

### Add a new component

```tsx
// src/components/NewComponent.tsx
import { useState } from "react";

const NewComponent = () => {
  const [state, setState] = useState("");

  return <div>{/* Component JSX */}</div>;
};

export default NewComponent;
```

### Add a new API endpoint

```typescript
// src/services/api.ts
export const newApi = {
  getAll: () => api.get("/endpoint"),
  getById: (id: string) => api.get(`/endpoint/${id}`),
  create: (data: any) => api.post("/endpoint", data),
  update: (id: string, data: any) => api.patch(`/endpoint/${id}`, data),
  delete: (id: string) => api.delete(`/endpoint/${id}`),
};
```

### Handle errors properly

```typescript
import { handleError } from "../utils/errorHandler";

try {
  const response = await mentorApi.getAll();
  // Use response
} catch (error) {
  const apiError = handleError(error); // Shows toast + logs
}
```

## 📄 License

MIT

## 👥 Contributors

- Trà Dá Community

---

**Last Updated**: December 27, 2025
