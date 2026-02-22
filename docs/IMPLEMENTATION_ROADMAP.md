# 🗺️ IMPLEMENTATION ROADMAP - TRÀ ĐÁ MENTOR
## Chi tiết từng tasks với estimate time và priority

---

## 📋 SPRINT 1: SECURITY & STABILITY (2 weeks)
**Goal:** Make it production-ready and secure

### Week 1: Critical Security Fixes

#### Task 1.1: Email Verification System
**Priority:** 🔴 Critical | **Estimate:** 2 days | **Difficulty:** Medium

```javascript
// Backend additions needed:
1. Add email verification token to User model
2. Create /api/auth/verify-email/:token endpoint
3. Create /api/auth/resend-verification endpoint
4. Send verification email on registration

// Files to modify:
- backend/models/User.js (add emailVerified, verificationToken)
- backend/routes/auth.js (add verify endpoints)
- backend/controllers/authController.js (add logic)
- src/pages/RegisterPage.tsx (add "check your email" message)

// Email template:
Subject: Verify your Trà Đá Mentor account
Body: Click here to verify: {FRONTEND_URL}/verify-email?token={TOKEN}
```

**Acceptance Criteria:**
- [ ] User receives email after registration
- [ ] Clicking link verifies account
- [ ] Unverified users cannot login
- [ ] Resend verification works
- [ ] Token expires after 24h

---

#### Task 1.2: Password Reset Flow
**Priority:** 🔴 Critical | **Estimate:** 1.5 days | **Difficulty:** Medium

```javascript
// Endpoints needed:
POST /api/auth/forgot-password
  Body: { email }
  → Sends reset email

POST /api/auth/reset-password/:token
  Body: { password, confirmPassword }
  → Updates password

// Files to create/modify:
- backend/controllers/authController.js (forgotPassword, resetPassword)
- backend/routes/auth.js
- src/pages/ForgotPasswordPage.tsx (NEW)
- src/pages/ResetPasswordPage.tsx (NEW)

// Email template:
Subject: Reset your password
Body: Click here within 1 hour: {FRONTEND_URL}/reset-password?token={TOKEN}
```

**Acceptance Criteria:**
- [ ] Email sent with reset link
- [ ] Token valid for 1 hour only
- [ ] Password validated (min 8 chars)
- [ ] Old password invalidated
- [ ] Success message shown
- [ ] User can login with new password

---

#### Task 1.3: SendGrid Email Integration
**Priority:** 🔴 Critical | **Estimate:** 1 day | **Difficulty:** Easy

```bash
# Installation
npm install @sendgrid/mail

# Environment variables
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@tradamentor.com
SENDGRID_FROM_NAME=Trà Đá Mentor
```

```javascript
// Create backend/utils/emailService.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME,
    },
    subject,
    text,
    html,
  };
  
  try {
    await sgMail.send(msg);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
};

// Create email templates
export const templates = {
  welcome: (name, verificationUrl) => ({
    subject: `Welcome to Trà Đá Mentor, ${name}!`,
    html: `<h1>Welcome!</h1><p>Click to verify: <a href="${verificationUrl}">Verify Email</a></p>`,
  }),
  
  passwordReset: (name, resetUrl) => ({
    subject: 'Reset your password',
    html: `<h1>Password Reset</h1><p>Click within 1 hour: <a href="${resetUrl}">Reset Password</a></p>`,
  }),
  
  sessionReminder: (mentorName, menteeName, sessionDate) => ({
    subject: 'Session Reminder - Tomorrow!',
    html: `<h1>Don't forget!</h1><p>Session with ${mentorName} tomorrow at ${sessionDate}</p>`,
  }),
};
```

**Acceptance Criteria:**
- [ ] SendGrid API key configured
- [ ] Email service utility created
- [ ] 5 templates created (welcome, reset, reminder, etc.)
- [ ] Error handling for failed sends
- [ ] Logging for all emails
- [ ] Test emails sent successfully

---

### Week 2: Monitoring & Testing

#### Task 1.4: Sentry Error Tracking
**Priority:** 🔴 Critical | **Estimate:** 0.5 day | **Difficulty:** Easy

```bash
npm install @sentry/node @sentry/react
```

```javascript
// backend/server.js - Add at top
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.nodeEnv,
  tracesSampleRate: 1.0,
});

// Add before error handlers
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add after all routes
app.use(Sentry.Handlers.errorHandler());
```

```typescript
// src/main.tsx - Add at top
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Acceptance Criteria:**
- [ ] Sentry project created
- [ ] Backend errors tracked
- [ ] Frontend errors tracked
- [ ] User context attached to errors
- [ ] Source maps uploaded
- [ ] Test error sent successfully

---

#### Task 1.5: Comprehensive Health Check
**Priority:** 🟡 Important | **Estimate:** 0.5 day | **Difficulty:** Easy

```javascript
// backend/routes/health.js (NEW)
import express from 'express';
import mongoose from 'mongoose';
import { version } from '../package.json';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version,
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.checks.database = 'connected';
    } else {
      health.checks.database = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'down';
  }

  // Check memory
  const used = process.memoryUsage();
  health.checks.memory = {
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

export default router;
```

**Acceptance Criteria:**
- [ ] /api/health endpoint returns detailed status
- [ ] /api/ready for readiness checks
- [ ] /api/live for liveness checks
- [ ] Database connection status
- [ ] Memory usage metrics
- [ ] Response time < 100ms

---

#### Task 1.6: Critical Path Testing
**Priority:** 🟡 Important | **Estimate:** 2 days | **Difficulty:** Medium

```javascript
// backend/__tests__/auth.test.js - Expand
describe('Auth Flow', () => {
  test('Complete registration flow', async () => {
    // Register
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'test1234', name: 'Test' });
    expect(res.status).toBe(201);
    
    // Should have verification token (not verified yet)
    const user = await User.findOne({ email: 'test@test.com' });
    expect(user.emailVerified).toBe(false);
    expect(user.verificationToken).toBeTruthy();
    
    // Verify email
    const verifyRes = await request(app)
      .get(`/api/auth/verify-email/${user.verificationToken}`);
    expect(verifyRes.status).toBe(200);
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test1234' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();
  });
  
  test('Password reset flow', async () => {
    // Request reset
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(200);
    
    // Get reset token from DB
    const user = await User.findOne({ email: 'test@test.com' });
    expect(user.resetPasswordToken).toBeTruthy();
    
    // Reset password
    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
      .send({ password: 'newpass123', confirmPassword: 'newpass123' });
    expect(resetRes.status).toBe(200);
    
    // Login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'newpass123' });
    expect(loginRes.status).toBe(200);
  });
});

// backend/__tests__/mentors.test.js - NEW
describe('Mentor CRUD', () => {
  let authToken;
  let adminToken;
  
  beforeAll(async () => {
    // Create test users
    const mentorUser = await User.create({ 
      email: 'mentor@test.com', 
      password: 'test1234', 
      name: 'Test Mentor',
      role: 'mentor',
    });
    
    const adminUser = await User.create({ 
      email: 'admin@test.com', 
      password: 'test1234', 
      name: 'Test Admin',
      role: 'admin',
    });
    
    authToken = generateToken(mentorUser._id);
    adminToken = generateToken(adminUser._id);
  });
  
  test('Create mentor (admin only)', async () => {
    const res = await request(app)
      .post('/api/mentors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: mentorUser._id,
        expertise: ['JavaScript', 'React'],
        track: 'tech',
        maxMentees: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body.expertise).toContain('JavaScript');
  });
  
  test('Cannot create mentor without auth', async () => {
    const res = await request(app)
      .post('/api/mentors')
      .send({ expertise: ['test'] });
    expect(res.status).toBe(401);
  });
  
  // Add more tests...
});

// Target: 60% coverage in Sprint 1
```

**Acceptance Criteria:**
- [ ] Auth flow tests (register, login, verify, reset)
- [ ] Mentor CRUD tests
- [ ] Mentee CRUD tests
- [ ] Session log tests
- [ ] Test coverage > 60%
- [ ] All tests pass in CI

---

#### Task 1.7: Docker Setup
**Priority:** 🟡 Important | **Estimate:** 1 day | **Difficulty:** Medium

```dockerfile
# Dockerfile (root)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./dist
COPY backend ./backend
COPY package*.json ./

USER appuser

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:8.0
    restart: always
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=${NODE_ENV}
      - DATABASE_URL=mongodb://mongodb:27017/tra-da-mentor
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./logs:/app/logs

volumes:
  mongodb_data:
  redis_data:
```

```bash
# .dockerignore
node_modules
npm-debug.log
.env
.env.local
dist
.git
.gitignore
README.md
.vscode
.DS_Store
logs/*.log
```

**Acceptance Criteria:**
- [ ] Dockerfile builds successfully
- [ ] docker-compose up runs all services
- [ ] App accessible on localhost:5000
- [ ] MongoDB persists data in volume
- [ ] Logs mounted to host
- [ ] Documentation updated

---

## 📋 SPRINT 2: GOOGLE INTEGRATION (2 weeks)

### Week 3-4: OAuth & Calendar

#### Task 2.1: Google OAuth Login
**Priority:** 🔴 Critical | **Estimate:** 2 days | **Difficulty:** Medium

```javascript
// backend/routes/authGoogle.js - Complete implementation
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
          // Create new user
          user = await User.create({
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            googleId: profile.id,
            emailVerified: true, // Google email already verified
            password: crypto.randomBytes(32).toString('hex'), // Random password
          });
        } else if (!user.googleId) {
          // Link existing account
          user.googleId = profile.id;
          user.emailVerified = true;
          await user.save();
        }
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${env.frontendUrl}/auth/callback?token=${token}&refresh=${refreshToken}`);
  }
);
```

```typescript
// src/pages/GoogleCallbackPage.tsx (NEW)
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    
    if (token && refresh) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh);
      
      // Fetch user and redirect
      login().then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, []);
  
  return <div>Logging you in...</div>;
};
```

**Acceptance Criteria:**
- [ ] Google OAuth credentials configured
- [ ] Login with Google button on LoginPage
- [ ] Redirect flow works
- [ ] New users created automatically
- [ ] Existing users linked
- [ ] Email verified automatically
- [ ] User redirected to dashboard

---

#### Task 2.2: Google Calendar Integration
**Priority:** 🟡 Important | **Estimate:** 3 days | **Difficulty:** Hard

```javascript
// backend/utils/googleCalendar.js (NEW)
import { google } from 'googleapis';
import User from '../models/User.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
};

export const getTokenFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const createMeetingEvent = async (userId, { mentorName, menteeName, startTime, duration = 60 }) => {
  // Get user's calendar tokens
  const user = await User.findById(userId);
  if (!user.googleCalendarTokens) {
    throw new Error('User has not connected Google Calendar');
  }
  
  oauth2Client.setCredentials(user.googleCalendarTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const endTime = new Date(new Date(startTime).getTime() + duration * 60000);
  
  const event = {
    summary: `Mentoring Session: ${mentorName} & ${menteeName}`,
    description: `One-on-one mentoring session between ${mentorName} (Mentor) and ${menteeName} (Mentee).`,
    start: {
      dateTime: startTime,
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    conferenceData: {
      createRequest: {
        requestId: `${Date.now()}-${userId}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    attendees: [
      { email: user.email },
      // Add mentor/mentee emails based on role
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });
  
  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
    htmlLink: response.data.htmlLink,
  };
};

export const updateMeetingEvent = async (userId, eventId, updates) => {
  const user = await User.findById(userId);
  oauth2Client.setCredentials(user.googleCalendarTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    resource: updates,
  });
  
  return response.data;
};

export const cancelMeetingEvent = async (userId, eventId) => {
  const user = await User.findById(userId);
  oauth2Client.setCredentials(user.googleCalendarTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
  });
};
```

```javascript
// backend/routes/calendar.js (NEW)
import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAuthUrl, getTokenFromCode, createMeetingEvent } from '../utils/googleCalendar.js';
import User from '../models/User.js';

const router = express.Router();

// Get authorization URL
router.get('/connect', protect, (req, res) => {
  const authUrl = getAuthUrl();
  res.json({ authUrl });
});

// OAuth callback
router.get('/callback', protect, async (req, res) => {
  const { code } = req.query;
  
  try {
    const tokens = await getTokenFromCode(code);
    
    // Save tokens to user
    await User.findByIdAndUpdate(req.user._id, {
      googleCalendarTokens: tokens,
    });
    
    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=connected`);
  } catch (error) {
    logger.error('Calendar connection failed:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error`);
  }
});

// Create meeting
router.post('/create-meeting', protect, async (req, res) => {
  const { mentorId, menteeId, startTime, duration } = req.body;
  
  try {
    const meeting = await createMeetingEvent(req.user._id, {
      mentorName: req.body.mentorName,
      menteeName: req.body.menteeName,
      startTime,
      duration,
    });
    
    res.json(meeting);
  } catch (error) {
    logger.error('Meeting creation failed:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

export default router;
```

**Acceptance Criteria:**
- [ ] User can connect Google Calendar
- [ ] Create meeting with Google Meet link
- [ ] Send calendar invites to both parties
- [ ] Update meeting time
- [ ] Cancel meeting
- [ ] Sync meetings to Schedule page
- [ ] Handle token refresh

---

## 📋 SPRINT 3: PAYMENT & I18N (2 weeks)

### Week 5-6: Monetization

#### Task 3.1: Stripe Payment Integration
**Priority:** 🔴 Critical | **Estimate:** 3 days | **Difficulty:** Medium

```bash
npm install stripe
```

```javascript
// backend/utils/stripe.js (NEW)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    maxMentors: 1,
    maxSessions: 2,
    features: ['Basic matching', 'Email notifications', 'Session logs'],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    maxMentors: 3,
    maxSessions: -1, // Unlimited
    features: ['Smart matching', 'Priority support', 'Advanced analytics', 'Video recording'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 49,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    maxMentors: -1,
    maxSessions: -1,
    features: ['Everything in Pro', 'AI insights', 'Custom learning path', 'Certificate'],
  },
};

export const createCheckoutSession = async (userId, planId) => {
  const plan = Object.values(PLANS).find(p => p.id === planId);
  if (!plan || plan.id === 'free') {
    throw new Error('Invalid plan');
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/settings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/settings?payment=cancelled`,
  });
  
  return session;
};

export const handleWebhook = async (body, signature) => {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;
      
      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        subscription: {
          stripeSubscriptionId: subscriptionId,
          status: 'active',
          plan: 'pro', // Determine from price_id
          startedAt: new Date(),
        },
      });
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      // Downgrade user to free
      await User.updateOne(
        { 'subscription.stripeSubscriptionId': subscription.id },
        {
          'subscription.status': 'cancelled',
          'subscription.endedAt': new Date(),
        }
      );
      
      break;
    }
    
    // Handle other events...
  }
};
```

```typescript
// src/pages/PricingPage.tsx (NEW)
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    
    try {
      const { data } = await api.post('/payments/create-checkout', { planId });
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      
      <div className="plans">
        <PlanCard plan="free" onSelect={() => {}} />
        <PlanCard plan="pro" onSelect={() => handleSubscribe('pro')} loading={loading} />
        <PlanCard plan="premium" onSelect={() => handleSubscribe('premium')} loading={loading} />
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Stripe account connected
- [ ] Pricing page created
- [ ] Checkout flow works
- [ ] Webhook handles subscription events
- [ ] User subscription status updated
- [ ] Feature limits enforced
- [ ] Cancel subscription works
- [ ] Invoice emails sent

---

#### Task 3.2: Internationalization (i18n)
**Priority:** 🟡 Important | **Estimate:** 3 days | **Difficulty:** Medium

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

```typescript
// src/i18n/config.ts (NEW)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

```json
// src/i18n/locales/en.json
{
  "common": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "nav": {
    "dashboard": "Dashboard",
    "mentors": "Mentors",
    "mentees": "Mentees",
    "schedule": "Schedule",
    "analytics": "Analytics"
  },
  "dashboard": {
    "welcome": "Welcome back, {{name}}!",
    "totalMentors": "Total Mentors",
    "totalMentees": "Total Mentees",
    "activeSessions": "Active Sessions"
  },
  "mentor": {
    "add": "Add Mentor",
    "edit": "Edit Mentor",
    "expertise": "Expertise",
    "track": "Track",
    "maxMentees": "Max Mentees",
    "bio": "Biography"
  }
}
```

```json
// src/i18n/locales/vi.json
{
  "common": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "logout": "Đăng xuất",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa"
  },
  "nav": {
    "dashboard": "Bảng điều khiển",
    "mentors": "Mentors",
    "mentees": "Mentees",
    "schedule": "Lịch học",
    "analytics": "Phân tích"
  },
  "dashboard": {
    "welcome": "Chào mừng trở lại, {{name}}!",
    "totalMentors": "Tổng số Mentors",
    "totalMentees": "Tổng số Mentees",
    "activeSessions": "Buổi học đang diễn ra"
  }
}
```

```typescript
// Usage in components
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <h1>{t('dashboard.welcome', { name: user.name })}</h1>
      
      <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] i18next configured
- [ ] English translations complete
- [ ] Vietnamese translations complete
- [ ] Language switcher in navbar
- [ ] Language persisted in localStorage
- [ ] Date/time formatted by locale
- [ ] All pages translated
- [ ] Tests pass in both languages

---

## 📋 SPRINT 4: ADVANCED FEATURES (3 weeks)

### Task 4.1: Smart Matching Algorithm
**Priority:** 🟡 Important | **Estimate:** 5 days | **Difficulty:** Hard

[Detailed implementation for ML-based matching...]

### Task 4.2: In-app Messaging
**Priority:** 🟢 Nice to have | **Estimate:** 4 days | **Difficulty:** Hard

[Socket.io implementation...]

### Task 4.3: Mobile App Foundation
**Priority:** 🟢 Nice to have | **Estimate:** 5 days | **Difficulty:** Hard

[React Native setup...]

---

## 📊 ESTIMATED TIMELINE & RESOURCES

### **Total Timeline:** 9 weeks (2.25 months)

| Sprint | Duration | Focus | Man-hours |
|--------|----------|-------|-----------|
| Sprint 1 | 2 weeks | Security & Stability | 80h |
| Sprint 2 | 2 weeks | Google Integration | 80h |
| Sprint 3 | 2 weeks | Payment & i18n | 80h |
| Sprint 4 | 3 weeks | Advanced Features | 120h |
| **Total** | **9 weeks** | **Ready for Global Launch** | **360h** |

### **Team Recommendation:**

#### **Option A: Solo Developer** (You)
- Timeline: 9 weeks (full-time work)
- Cost: $0 (your time)
- Risk: High (single point of failure)

#### **Option B: Small Team** (Recommended)
- 1 Senior Full-stack Dev (you)
- 1 Frontend Dev (UI/UX focus)
- 1 Part-time QA
- Timeline: 6 weeks (faster, parallel work)
- Cost: ~$10,000

#### **Option C: Agency**
- Full team + PM
- Timeline: 4 weeks
- Cost: ~$30,000
- Quality: High (but less control)

---

## 🎯 SUCCESS METRICS

Track these KPIs after each sprint:

- [ ] Test coverage > 80%
- [ ] API response time < 200ms (p95)
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Lighthouse score > 90
- [ ] Security audit: 0 critical issues
- [ ] User satisfaction: NPS > 8

---

**Next Steps:**
1. Review this roadmap
2. Prioritize features based on budget/timeline
3. Setup project management (Jira, Linear, or Trello)
4. Create GitHub Issues for each task
5. Start Sprint 1!

**Questions? Let's discuss! 🚀**
