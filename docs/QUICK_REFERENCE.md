# 🎯 QUICK REFERENCE CHEAT SHEET
## Commands & Common Tasks

---

## 🚀 DEVELOPMENT

### **Start Development Servers**
```bash
# Both frontend + backend
npm run dev:all

# Frontend only (port 5173)
npm run dev

# Backend only (port 5000)
npm run dev:server
```

### **Database**
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb/brew/mongodb-community@8.0

# Stop MongoDB
brew services stop mongodb/brew/mongodb-community@8.0

# Seed database with sample data
npm run seed
```

### **Testing**
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🔧 COMMON TASKS

### **Add a New User**
```bash
# Via API (after server running)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "mentor"
  }'
```

### **Generate JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Check Server Health**
```bash
curl http://localhost:5000/api/health
```

---

## 📁 PROJECT STRUCTURE

```
tra-da-mentor/
├── backend/              # Node.js/Express API
│   ├── config/          # Env, database, logger
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, security
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── schemas/         # Validation schemas
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── src/                 # React/TypeScript frontend
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route pages
│   ├── services/        # API client
│   ├── context/         # React Context (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   └── utils/           # Frontend utilities
│
└── docs/                # Documentation
    ├── EXECUTIVE_SUMMARY.md        # 📝 START HERE!
    ├── SENIOR_SE_REVIEW.md         # 🔍 Detailed review
    ├── IMPLEMENTATION_ROADMAP.md   # 🗺️ Implementation guide
    └── ...
```

---

## 🔐 ENVIRONMENT VARIABLES

### **Required (Backend):**
```env
DATABASE_URL=mongodb://localhost:27017/tra-da-mentor
JWT_SECRET=your-64-char-secret-here
JWT_REFRESH_SECRET=your-different-secret-here
CORS_ORIGIN=http://localhost:5173
```

### **Optional (Backend):**
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=info
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENDGRID_API_KEY=...
STRIPE_SECRET_KEY=...
SENTRY_DSN=...
```

### **Frontend:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Tra Da Mentor
VITE_ENVIRONMENT=development
```

---

## 🎨 USER ROLES & THEMING

| Role | Color | Access |
|------|-------|--------|
| **Admin** | Blue (#4299e1) | Full access to all features |
| **Mentor** | Orange (#ff6b35) | Manage mentees, sessions, schedule |
| **Mentee** | Green (#4caf50) | View mentors, book sessions, logs |
| **User** | Default | Basic access |

---

## 📡 API ENDPOINTS

### **Authentication**
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login with email/password
POST   /api/auth/logout            # Logout (clear refresh token)
POST   /api/auth/refresh           # Refresh access token
GET    /api/auth/me                # Get current user
GET    /api/auth/google            # Google OAuth (to implement)
GET    /api/auth/google/callback   # OAuth callback
```

### **Mentors**
```
GET    /api/mentors                # List all mentors
POST   /api/mentors                # Create mentor (admin only)
GET    /api/mentors/:id            # Get mentor details
PUT    /api/mentors/:id            # Update mentor
DELETE /api/mentors/:id            # Delete mentor (admin only)
```

### **Mentees**
```
GET    /api/mentees                # List all mentees
POST   /api/mentees                # Create mentee
GET    /api/mentees/:id            # Get mentee details
PUT    /api/mentees/:id            # Update mentee
DELETE /api/mentees/:id            # Delete mentee
```

### **Groups**
```
GET    /api/groups                 # List all groups
POST   /api/groups                 # Create group
GET    /api/groups/:id             # Get group details
PUT    /api/groups/:id             # Update group
DELETE /api/groups/:id             # Delete group
POST   /api/groups/:id/assign      # Assign mentee to group
```

### **Session Logs** (CRM)
```
GET    /api/session-logs           # List all session logs
POST   /api/session-logs           # Create session log
GET    /api/session-logs/needs-support  # Get logs needing support
```

### **Slots** (Scheduling)
```
GET    /api/slots                  # List available slots
POST   /api/slots                  # Create slot (mentor only)
PATCH  /api/slots/:id/book         # Book slot (mentee)
```

### **Invites** (Admin)
```
POST   /api/invites                # Create invite link
GET    /api/invites/validate/:token  # Validate invite token
```

---

## 🐛 DEBUGGING

### **View Logs**
```bash
# Backend logs (Winston)
tail -f logs/app.log

# Or view in JSON format
cat logs/app.log | jq

# Filter errors only
grep ERROR logs/app.log
```

### **MongoDB Shell**
```bash
# Connect to MongoDB
mongosh

# Use database
use tra-da-mentor

# View collections
show collections

# Query users
db.users.find()

# Query mentors
db.mentors.find().pretty()

# Count documents
db.users.countDocuments()
```

### **Clear Database**
```bash
mongosh tra-da-mentor --eval "db.dropDatabase()"
npm run seed  # Re-seed with fresh data
```

---

## 🔒 SECURITY CHECKLIST

### **Before Launch:**
- [ ] Change JWT secrets (not default)
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly (not *)
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (not hardcoded)
- [ ] Add CSRF protection
- [ ] Security audit completed

---

## 📦 DEPLOYMENT

### **Build for Production**
```bash
# Build frontend
npm run build

# Output: dist/ folder
```

### **Run Production Server**
```bash
# Set environment
export NODE_ENV=production

# Start server
node backend/server.js

# Or with PM2 (recommended)
pm2 start backend/server.js --name tra-da-mentor
pm2 startup  # Auto-start on reboot
pm2 save
```

### **Docker**
```bash
# Build image
docker build -t tra-da-mentor .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🧪 TESTING USERS

After running `npm run seed`, these users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | admin |
| mentor1@test.com | mentor123 | mentor |
| mentor2@test.com | mentor123 | mentor |
| mentee1@test.com | mentee123 | mentee |
| mentee2@test.com | mentee123 | mentee |

---

## 💡 TIPS & TRICKS

### **Hot Reload Not Working?**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
```

### **Port Already in Use?**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Or use different port
export PORT=5001
```

### **TypeScript Errors?**
```bash
# Check TypeScript
npx tsc --noEmit

# Restart VS Code TypeScript server
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### **MongoDB Connection Issues?**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check connection
mongosh --eval "db.runCommand({ ping: 1 })"

# View MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

---

## 📚 USEFUL RESOURCES

### **Documentation**
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **Tools**
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for MongoDB
- [Postman](https://www.postman.com/) - API testing
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace):
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - Thunder Client (API testing)

### **Learning**
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [JWT.io](https://jwt.io/) - Decode JWTs

---

## 🆘 TROUBLESHOOTING

### **Issue: "Cannot find module"**
```bash
npm install
# If still fails:
rm -rf node_modules package-lock.json
npm install
```

### **Issue: Database connection failed**
```bash
# Check DATABASE_URL in .env
# Check MongoDB is running
brew services start mongodb/brew/mongodb-community@8.0
```

### **Issue: CORS errors**
```bash
# Check CORS_ORIGIN in backend/.env
# Should match frontend URL (http://localhost:5173)
```

### **Issue: JWT expired**
```bash
# Use refresh token endpoint
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

---

## 🎯 QUICK WINS (Easy Improvements)

1. **Add Favicon** (5 min)
   - Create `public/favicon.ico`
   - Update `index.html`

2. **Improve Loading States** (30 min)
   - Add more Skeleton components
   - Add progress bars

3. **Better Error Messages** (1 hour)
   - User-friendly messages
   - Actionable suggestions

4. **Add Keyboard Shortcuts** (1 hour)
   - Ctrl+K for search
   - ESC to close modals

5. **Dark Mode** (2 hours)
   - Add theme toggle
   - Save preference

---

## 📞 NEED HELP?

- **Bug Report:** Create GitHub issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots
  - Environment (OS, Node version)

- **Feature Request:** Open discussion with:
  - Use case
  - Expected behavior
  - Why it's important

---

**Last Updated:** February 16, 2026  
**Version:** 1.0.0  

**Happy Coding! 🚀**
