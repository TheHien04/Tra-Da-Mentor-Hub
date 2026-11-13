# Trà Đá Mentor Hub

_A production-oriented mentoring operations platform for administrators, mentors, and mentees._

---

Trà Đá Mentor Hub centralizes mentor and mentee lifecycle management, availability, scheduling, session CRM, notifications, analytics, and administration in one role-aware workspace.

The public `/programs` page mirrors the official [Trà Đá Mentor service catalogue](https://www.tradamentor.com/dich-vu) and routes prospective mentees to the official application process. See the [product content source of truth](./docs/PRODUCT_CONTENT.md) for provenance and update rules.

Product decisions and metrics are governed by the [product operating model](./docs/PRODUCT_OPERATING_MODEL.md) and [data governance contract](./docs/DATA_GOVERNANCE.md).

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## 📋 Product overview

### Who it serves

| Role | Responsibilities |
| --- | --- |
| **Administrator** | Manage users, invitations, cohorts, broadcasts, exports, testimonials, analytics, and audit history. |
| **Mentor** | Maintain a profile, publish availability, review mentees, manage sessions, and record outcomes. |
| **Mentee** | Apply to the program, discover mentors, book slots, view sessions, and track progress. |

### Core capabilities

- Role-based access control across UI routes and API resources.
- Mentor and mentee directories with profile, group, and relationship views.
- Availability slots, booking, schedule management, session logs, and support flags.
- In-app notifications with Socket.IO and optional email/Zalo delivery.
- Analytics, demand signals, explainable rule-based matching, and operational insights.
- Optional Google Calendar/Meet, Stripe, SendGrid, Zalo OA, OpenAI, Google OAuth, and Sentry integrations.
- Complete Vietnamese and English locale support. Chinese, Japanese, and Korean catalogs are staged for future translation review.
- Responsive desktop/mobile navigation, dark mode, keyboard quick search, PWA metadata, and accessible route structure.

## 🏛️ Architecture

The application is intentionally deployable as a single service: the Express server exposes `/api`, serves protected uploads, and serves the compiled Vite SPA in production.

```mermaid
flowchart TB
    accTitle: Trà Đá Mentor Hub Architecture
    accDescr: A React single-page application calls the Node and Express API, which enforces authentication and authorization before accessing MongoDB or optional integrations.

    browser["🌐 Browser<br/>React + Vite + TanStack Query"]
    api["🖥️ Application server<br/>Node.js + Express + Socket.IO"]
    auth["🔐 Security boundary<br/>JWT cookies + CSRF + RBAC"]
    data[("💾 MongoDB<br/>Persistent production store")]
    memory[("💾 In-memory store<br/>Development fallback")]
    integrations["🔌 Optional services<br/>Calendar · Email · Zalo · Stripe · AI · Sentry"]
    ci["⚙️ Quality gates<br/>TypeScript · ESLint · Vitest · Jest · Playwright"]

    browser -->|HTTPS / REST| api
    browser <-->|WebSocket| api
    api --> auth
    auth --> data
    auth -.-> memory
    api -.-> integrations
    ci -.-> browser
    ci -.-> api
```

### Request and authorization flow

```mermaid
sequenceDiagram
    accTitle: Authenticated API Request Flow
    accDescr: The client sends a cookie-authenticated mutation, the server validates CSRF and JWT identity, applies role and ownership rules, then writes an audit record before returning the response.

    participant client as Browser
    participant middleware as Security middleware
    participant route as API route
    participant store as Domain store
    participant audit as Audit log

    client->>middleware: Mutation + CSRF token
    middleware->>middleware: Validate origin, body size, rate limit, CSRF, JWT
    middleware->>route: Authenticated request
    route->>route: Resolve actor, role, and resource ownership
    route->>store: Execute validated domain operation
    store-->>route: Domain result
    route->>audit: Record mutation metadata
    route-->>client: JSON response
```

### Repository layout

```text
tra-da-mentor-hub/
├── backend/
│   ├── controllers/        HTTP handlers and integration orchestration
│   ├── config/             Environment and application configuration
│   ├── domain/             Framework-independent business rules/state machines
│   ├── middleware/         Authentication, CSRF, security, audit, errors
│   ├── models/             Mongoose models
│   ├── routes/             REST resource routes + central route registry
│   ├── services/           MongoDB and development stores
│   └── server.js           Production entrypoint
├── src/
│   ├── app/                Route table and shared application shell
│   ├── components/         Shared UI and domain component modules
│   ├── content/            Typed, source-traceable public product content
│   ├── context/            Auth, theme, confirmation, notifications
│   ├── hooks/queries/      TanStack Query hooks and cache keys
│   ├── pages/              Route-level screens
│   ├── services/api/       HTTP client, contracts, and domain API modules
│   └── lib/                Client-side utilities and policy helpers
├── e2e/                    Playwright browser tests
├── docs/                   OpenAPI, architecture, runbooks, testing
├── scripts/                Quality, locale, deployment, and environment tools
├── docs/screenshots/       Playwright-captured product evidence
└── docker-compose.yml      Local production simulation
```

Dependency direction is kept one-way: route screens use feature components and query hooks; query hooks use the typed API boundary; backend routes delegate to controllers/services and never import frontend code. `src/App.tsx` and `backend/createApp.js` remain small composition roots rather than feature containers.

## 🖼️ Product walkthrough

The gallery below was captured from the running application with Playwright using the development demo account and synthetic data. It is intentionally kept under version control so the README documents the product that is actually built, not a separate design mockup.

### Public and authentication surfaces

<p align="center">
  <img src="./docs/screenshots/public-programs.png" alt="Program catalogue" width="920" />
</p>

The public catalogue gives prospective mentees a clear entry point.

<p align="center">
  <img src="./docs/screenshots/auth-login.png" alt="Login screen" width="920" />
</p>

The authentication surface supports localized email/password login, theme switching, password visibility, and development-only demo access.

### Operational workspace

<p align="center">
  <img src="./docs/screenshots/product/dashboard.png" alt="Dashboard" width="920" />
</p>

The dashboard is the operational command centre: capacity KPIs, next actions, Smart Match signals, quick navigation, and role-aware administration links are visible without hiding the primary workflow.

<p align="center">
  <img src="./docs/screenshots/product/mentors.png" alt="Mentor directory" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/mentees.png" alt="Mentee directory" width="920" />
</p>

### Lifecycle and scheduling

<p align="center">
  <img src="./docs/screenshots/product/applications.png" alt="Applications workflow" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/availability-slots.png" alt="Availability slots" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/schedule.png" alt="Schedule" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/session-logs.png" alt="Session logs" width="920" />
</p>

### Intelligence and administration

<p align="center">
  <img src="./docs/screenshots/product/analytics.png" alt="Analytics" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/matching-insights.png" alt="Explainable matching insights" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/admin-audit.png" alt="Audit history" width="920" />
</p>

<p align="center">
  <img src="./docs/screenshots/product/admin-export.png" alt="Data export" width="920" />
</p>

### Responsive experience

<p align="center">
  <img src="./docs/screenshots/mobile/login.png" alt="Mobile login" width="280" />
  <img src="./docs/screenshots/mobile/dashboard.png" alt="Mobile dashboard" width="280" />
  <img src="./docs/screenshots/mobile/schedule.png" alt="Mobile schedule" width="280" />
</p>

### Product surface map

| Product area | Route | What it supports |
| --- | --- | --- |
| Mentor directory | `/mentors` | Search, filters, profile detail, skills, capacity, and mentor lifecycle actions. |
| Mentee directory | `/mentees` | Applicant profile, application status, group assignment, progress, and ownership-aware editing. |
| Applications | `/applications` | Governed workflow: pending → interview invite → interviewed → accepted/rejected, with audit history. |
| Groups | `/groups` | Cohort creation, member assignment, capacity enforcement, detail views, and cross-group safety rules. |
| Availability and booking | `/slots` | Create, update, lock, cancel, and book mentor slots with conflict protection. |
| Session CRM | `/session-logs` | Record valid mentoring sessions, outcomes, support flags, and follow-up notes. |
| Analytics and insights | `/analytics`, `/insights` | Governed KPIs, demand signals, explainable matching, and operational trends. |
| Administration | `/admin/audit`, `/admin/export`, `/admin/notifications`, `/admin/invite` | Audit trail, data export, broadcasts, integrations status, and secure invitations. |
| Account and legal | `/account`, `/privacy-policy`, `/terms-of-service` | Profile/security controls, account deletion/export, privacy, and terms. |

## 🚀 Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 7 for persistence and backend integration tests
- Docker Desktop if you prefer the containerized local stack

### Install

```bash
git clone https://github.com/TheHien04/Tra-Da-Mentor-Hub.git
cd Tra-Da-Mentor-Hub
npm ci
cp .env.example .env
```

For a local demo, set development JWT secrets in `.env` and keep `NODE_ENV=development`. The server can use the in-memory store when MongoDB is unavailable; production always requires MongoDB.

### Run the demo

```bash
npm run dev:all
```

Open:

- Frontend: <http://localhost:5173>
- API health: <http://localhost:5000/api/health>
- API readiness: <http://localhost:5000/api/ready>
- API documentation: <http://localhost:5000/api/docs>

Demo credentials:

```text
Email: admin@example.com
Password: AdminPass123
```

Demo authentication and integrations are development-only. Never enable demo authentication in production.

### Run with Docker

```bash
npm run docker:up
```

Stop the stack:

```bash
npm run docker:down
```

## 🧪 Quality engineering

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint validation |
| `npm run build` | TypeScript project build and Vite production bundle |
| `npm run test:frontend` | Frontend Vitest suite |
| `npm run test:unit` | Jest unit and API integration suite |
| `npm run test:e2e` | Playwright browser suite |
| `npm run quality` | Repository quality gate |
| `npm run check:locales` | Locale parity check |
| `npm run check:openapi` | OpenAPI contract check |
| `npm run check:structure` | Architecture and file-placement guardrail |
| `npm run check:secrets` | Secret tracking check |

The CRM/admin integration tests require a reachable MongoDB instance:

```bash
docker run -d --name tra-da-mongo -p 27017:27017 mongo:7
export TEST_DATABASE_URL=mongodb://127.0.0.1:27017/tra-da-mentor-test
npm run test:unit
```

## 🔒 Security model

- Access and refresh tokens are stored in `httpOnly` cookies.
- Cookie-authenticated mutations require a matching readable CSRF token.
- Production enables Helmet, CSP, HSTS, strict CORS allowlisting, rate limits, and request size limits.
- MongoDB operators are sanitized before persistence.
- Uploads require authentication and are served through a protected route.
- API authorization validates both role and resource ownership.
- Calendar synchronization is limited to administrators, the owning mentor, or the mentee who booked the slot.
- Production refuses to start without MongoDB and strong JWT secrets.

Report a vulnerability privately according to [SECURITY.md](./SECURITY.md). Do not open a public issue containing exploit details.

## 📦 Deployment

The project supports Railway, Render, and Docker-based deployments. See:

- [Deployment guide](./DEPLOY.md)
- [Production readiness checklist](./PRODUCTION_READINESS.md)
- [Operational runbook](./docs/RUNBOOK.md)
- [Staging guide](./docs/STAGING.md)
- [Architecture documentation](./docs/ARCHITECTURE.md)
- [Repository structure rules](./docs/STRUCTURE.md)
- [Product content source of truth](./docs/PRODUCT_CONTENT.md)

Required production configuration includes:

```text
NODE_ENV=production
HOST=0.0.0.0
DATABASE_URL=<mongodb connection string>
JWT_SECRET=<strong secret>
JWT_REFRESH_SECRET=<different strong secret>
ENABLE_DEMO_AUTH=false
```

Optional integrations remain disabled unless their server-side credentials are configured.

## 🤝 Contributing

1. Create a focused branch from the default branch.
2. Make a small, reviewable change with tests.
3. Run lint, build, relevant unit tests, and E2E smoke tests.
4. Update documentation and OpenAPI when behavior or contracts change.
5. Open a pull request using the repository template.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete workflow.

## 📄 License

This project is released under the [MIT License](./LICENSE).
