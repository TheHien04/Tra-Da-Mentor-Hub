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

## � Screenshots & Features

### 🔐 Authentication

<table>
  <tr>
    <td width="50%">
      <h4>Login Page</h4>
      <img src="Images/Login.jpg" alt="Login" />
      <p>Modern login interface with email/password and Google OAuth</p>
    </td>
    <td width="50%">
      <h4>Registration</h4>
      <img src="Images/Create account.jpg" alt="Register" />
      <p>User registration with role selection and validation</p>
    </td>
  </tr>
</table>

### 🌐 Multi-language Support

<table>
  <tr>
    <td align="center">
      <img src="Images/Language.jpg" alt="Language Switcher" width="600" />
      <p><strong>Language Switcher</strong> - Support for 5 languages (EN, VI, JP, KR, CN)</p>
    </td>
  </tr>
</table>

### 📊 Dashboard

<table>
  <tr>
    <td width="50%">
      <img src="Images/Dashboard1.jpg" alt="Dashboard Overview" />
      <p><strong>Dashboard Overview</strong> - Statistics and quick actions</p>
    </td>
    <td width="50%">
      <img src="Images/Dashboard2.jpg" alt="Dashboard Analytics" />
      <p><strong>Dashboard Details</strong> - Recent activities and progress tracking</p>
    </td>
  </tr>
</table>

### 👨‍🏫 Mentor Management

<table>
  <tr>
    <td width="50%">
      <img src="Images/ManageMentor.jpg" alt="Mentor List" />
      <p><strong>Mentor Directory</strong> - Browse all mentors with filtering</p>
    </td>
    <td width="50%">
      <img src="Images/MentorDetails.jpg" alt="Mentor Details" />
      <p><strong>Mentor Profile</strong> - Detailed information and expertise</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="Images/Addnewmentor.jpg" alt="Add Mentor" />
      <p><strong>Add New Mentor</strong> - Create mentor profile with expertise</p>
    </td>
    <td width="50%">
      <img src="Images/EditMentor.jpg" alt="Edit Mentor" />
      <p><strong>Edit Mentor</strong> - Update mentor information and skills</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="Images/Mentor1.jpg" alt="Mentor Management" />
      <p><strong>Mentor Overview</strong> - Track mentees and groups</p>
    </td>
    <td width="50%">
      <img src="Images/Mentor2.jpg" alt="Mentor Analytics" />
      <p><strong>Mentor Statistics</strong> - Performance and engagement metrics</p>
    </td>
  </tr>
</table>

### 👨‍🎓 Mentee Management

<table>
  <tr>
    <td width="50%">
      <img src="Images/ManageMentees.jpg" alt="Mentee List" />
      <p><strong>Mentee Directory</strong> - View and manage all mentees</p>
    </td>
    <td width="50%">
      <img src="Images/Addnewmentee.jpg" alt="Add Mentee" />
      <p><strong>Add New Mentee</strong> - Register new mentee with profile</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="Images/EditMentee.jpg" alt="Edit Mentee" />
      <p><strong>Edit Mentee</strong> - Update mentee information and status</p>
    </td>
    <td width="50%">
      <img src="Images/Applications.jpg" alt="Applications" />
      <p><strong>Mentee Applications</strong> - Review and approve applications</p>
    </td>
  </tr>
</table>

### 👥 Group Management

<table>
  <tr>
    <td width="50%">
      <img src="Images/Groups.jpg" alt="Groups List" />
      <p><strong>Groups Overview</strong> - Manage mentoring groups</p>
    </td>
    <td width="50%">
      <img src="Images/CreateGroup.jpg" alt="Create Group" />
      <p><strong>Create Group</strong> - Form new mentoring groups</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="Images/EditGroup.jpg" alt="Edit Group" width="600" />
      <p><strong>Edit Group</strong> - Modify group members and settings</p>
    </td>
  </tr>
</table>

### 📅 Schedule & Sessions

<table>
  <tr>
    <td width="50%">
      <img src="Images/Schedule.jpg" alt="Schedule" />
      <p><strong>Mentoring Schedule</strong> - View and manage sessions</p>
    </td>
    <td width="50%">
      <img src="Images/MentoringSchedule.jpg" alt="Calendar View" />
      <p><strong>Calendar View</strong> - Weekly schedule overview</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="Images/Session Log.jpg" alt="Session Logs" />
      <p><strong>Session Logs</strong> - Track completed sessions</p>
    </td>
    <td width="50%">
      <img src="Images/Session Log 2.jpg" alt="Session Details" />
      <p><strong>Session Details</strong> - Notes and attendance tracking</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="Images/AddNewSession.jpg" alt="Add Session" />
      <p><strong>Add Session</strong> - Create new mentoring session</p>
    </td>
    <td width="50%">
      <img src="Images/Form Logs.jpg" alt="Session Form" />
      <p><strong>Session Form</strong> - Detailed session logging</p>
    </td>
  </tr>
</table>

### 🕐 Slots Management

<table>
  <tr>
    <td width="50%">
      <img src="Images/Slots Manage.jpg" alt="Slots Overview" />
      <p><strong>Available Slots</strong> - View and book free time slots</p>
    </td>
    <td width="50%">
      <img src="Images/Slot Manage2.jpg" alt="Slot Details" />
      <p><strong>Slot Management</strong> - Configure mentor availability</p>
    </td>
  </tr>
</table>

### 📊 Analytics & Reports

<table>
  <tr>
    <td width="50%">
      <img src="Images/Analytics.jpg" alt="Analytics Dashboard" />
      <p><strong>Analytics Overview</strong> - Key performance indicators</p>
    </td>
    <td width="50%">
      <img src="Images/Analytics 2.jpg" alt="Detailed Analytics" />
      <p><strong>Detailed Reports</strong> - Charts and trends analysis</p>
    </td>
  </tr>
</table>

### 💬 Testimonials & Reviews

<table>
  <tr>
    <td width="50%">
      <img src="Images/Testimonials.jpg" alt="Testimonials" />
      <p><strong>Testimonials Page</strong> - Success stories and feedback</p>
    </td>
    <td width="50%">
      <img src="Images/Testimonials list.jpg" alt="Reviews List" />
      <p><strong>Reviews Management</strong> - Manage testimonials</p>
    </td>
  </tr>
</table>

### 🔧 Admin Features

<table>
  <tr>
    <td width="33%">
      <img src="Images/Export Data.jpg" alt="Export Data" />
      <p><strong>Export Data</strong> - Download reports as CSV</p>
    </td>
    <td width="33%">
      <img src="Images/Invite Users.jpg" alt="Invite Users" />
      <p><strong>Invite Users</strong> - Send email invitations</p>
    </td>
    <td width="33%">
      <img src="Images/Notifications.jpg" alt="Notifications" />
      <p><strong>Send Notifications</strong> - Broadcast messages</p>
    </td>
  </tr>
</table>

---

## 🎨 Design Features

- ✨ **Modern UI** with Tailwind CSS
- 🎭 **Glass Morphism** effects and smooth animations
- 📱 **Responsive Design** for all screen sizes
- 🌈 **Role-based Color Schemes** (Mentor: Orange, Mentee: Green, Admin: Indigo)
- 🔔 **Toast Notifications** for user feedback
- ⚡ **Fast Loading** with optimized components

## �📄 License

MIT

## 👥 Contributors

Trà Đá Community
