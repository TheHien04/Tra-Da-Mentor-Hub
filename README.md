# Trà Đá Mentor Platform

Nền tảng kết nối Mentor và Mentee, hỗ trợ phát triển sự nghiệp và kỹ năng mềm.

## 🚀 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Zod** - Schema validation
- **React Toastify** - Notifications
- **Recharts** - Data visualization

### Backend
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Bcrypt** - Password hashing

## � Documentation

**NEW!** Comprehensive review and roadmap documents:

- **[📝 EXECUTIVE SUMMARY](./docs/EXECUTIVE_SUMMARY.md)** - Đọc CÁI NÀY TRƯỚC! Quick overview & verdict
- **[🔍 SENIOR SE REVIEW](./docs/SENIOR_SE_REVIEW.md)** - Đánh giá chi tiết từ góc nhìn Senior SE
- **[🗺️ IMPLEMENTATION ROADMAP](./docs/IMPLEMENTATION_ROADMAP.md)** - Step-by-step guide với code samples
- [📋 PROJECT REVIEW](./docs/PROJECT_REVIEW.md) - Feature checklist & structure
- [🔄 SPEC VS CODEBASE](./docs/SPEC_VS_CODEBASE.md) - Spec comparison
- [🗺️ SITEMAP & USAGE](./docs/SITEMAP_AND_USAGE.md) - User flows & how to use
- [🔐 GOOGLE SSO SETUP](./docs/GOOGLE_SSO_SETUP.md) - OAuth configuration

## �📋 Prerequisites

- Node.js >= 18
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. Clone repository:
```bash
git clone <repository-url>
cd tra-da-mentor
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
# Copy .env.example to .env and fill in values
cp .env.example .env
```

Required environment variables:
```env
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DATABASE_URL=mongodb://localhost:27017/tra-da-mentor

# Auth
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
```

4. Seed database (optional):
```bash
npm run seed
```

## 🎯 Usage

### Development

Run frontend and backend concurrently:
```bash
npm run dev:all
```

Or run separately:
```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

### Production Build

```bash
# Build frontend
npm run build

# Start backend
npm run server
```

For a full review of features, UI, and software process, see [docs/PROJECT_REVIEW.md](docs/PROJECT_REVIEW.md).

## 📁 Project Structure

```
tra-da-mentor/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── schemas/         # Validation schemas
│   ├── scripts/         # Utility scripts
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── src/
│   ├── components/      # React components
│   ├── context/         # React context
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── config/          # Frontend config
└── public/              # Static assets
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📝 Scripts

- `npm run dev` - Start frontend dev server
- `npm run dev:server` - Start backend dev server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run server` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🔐 Authentication

The platform supports role-based access control:
- **Admin** - Full access
- **Mentor** - Can manage mentees and groups
- **Mentee** - Can view assigned mentors and groups

## 📚 API Documentation

API base: `/api`. All protected routes require `Authorization: Bearer <accessToken>`.

| Area | Endpoints |
|------|------------|
| **Health** | `GET /api/health` |
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`, `GET /api/auth/profile`, `POST /api/auth/logout`, `GET /api/auth/google`, `GET /api/auth/google/callback` |
| **Mentors** | `GET/POST /api/mentors`, `GET/PATCH/DELETE /api/mentors/:id`, `GET /api/mentors/:id/mentees`, `GET /api/mentors/:id/groups` |
| **Mentees** | `GET/POST /api/mentees`, `GET/PATCH/DELETE /api/mentees/:id`, `PATCH /api/mentees/:id/application-status` |
| **Groups** | `GET/POST /api/groups`, `GET/PATCH/DELETE /api/groups/:id`, `GET /api/groups/:id/full`, `GET /api/groups/:id/mentees`, `POST/DELETE /api/groups/:groupId/mentees/:menteeId` |
| **Activities** | `GET/POST /api/activities` |
| **Session logs** | `GET/POST /api/session-logs`, `GET /api/session-logs/needs-support` |
| **Slots** | `GET/POST /api/slots`, `PATCH /api/slots/:id`, `PATCH /api/slots/:id/book` |
| **Invites** | `POST /api/invites` (admin), `GET /api/invites/validate/:token` |

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input sanitization
- XSS protection

## 📄 License

MIT

## 👥 Contributors

Trà Đá Community
