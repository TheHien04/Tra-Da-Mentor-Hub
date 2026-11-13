# Repository structure and ownership

This document is the placement contract for Trà Đá Mentor Hub. New files should
follow these boundaries so the repository remains predictable as the product grows.

## Frontend

```text
src/
├── app/                 composition, routing, shared application shell
├── pages/               one route-level screen per `*Page.tsx` file
├── components/
│   ├── admin/           reusable administration components
│   ├── analytics/       charts, KPI cards, and analytics controls
│   ├── features/        cross-page product features
│   ├── motion/          animation and visual-transition primitives
│   └── ui/              domain-neutral accessible UI primitives
├── hooks/
│   └── queries/         TanStack Query hooks and cache-key ownership
├── services/
│   └── api/             transport client, API contracts, domain clients
├── context/             narrowly scoped React context providers
├── content/             typed, source-traceable public product copy
├── lib/                 pure client utilities and policy functions
├── schemas/             client-side validation schemas
├── i18n/                locale catalogs and translation setup
└── types/               generated or shared type declarations
```

Placement rules:

1. A React component rendered directly by `AppRoutes` belongs in `pages` and is
   named `SomethingPage.tsx`.
2. Reusable visual primitives belong in `components/ui`; they must not import a
   page or a domain API.
3. Components tied to a product area belong in a named component subdirectory.
4. Server state is fetched through `hooks/queries`; pages should not create
   independent cache keys.
5. HTTP configuration and refresh behavior exist only in `services/api/client.ts`.
6. Generated OpenAPI types are never edited manually.
7. Public program facts live in `content`; record their provenance in
   `docs/PRODUCT_CONTENT.md` and re-verify time-sensitive claims before release.

## Backend

```text
backend/
├── routes/               URL, middleware, validation, controller binding
├── controllers/          HTTP orchestration and response mapping
├── services/             business operations and persistence adapters
├── models/               Mongoose schemas and indexes
├── schemas/              request validation contracts
├── middleware/           cross-cutting HTTP policies
├── config/               validated environment and infrastructure config
├── lib/                  small framework-independent policies/helpers
├── utils/                external delivery adapters
├── data/                 development/demo seed catalogs
├── createApp.js          Express composition root
└── server.js             process and database bootstrap
```

Placement rules:

1. Routes stay declarative. They may compose middleware and validators but do
   not coordinate stores, send notifications, or implement ownership rules.
2. Controllers map HTTP input/output and delegate persistence to services.
3. Services must not depend on Express request or response objects.
4. Models contain persistence structure and indexes, not HTTP behavior.
5. External credentials are read through `config/env.js`; no client-facing code
   receives secrets.
6. Cross-cutting helpers remain focused. A helper that grows into a workflow
   should become a service.

## Size and naming guidance

- Prefer a focused extraction when a production source file passes roughly 400
  lines or owns multiple independently testable UI sections/workflows.
- Large static seed catalogs and generated files are exceptions.
- Route screens use `*Page.tsx`; React hooks use `use*`; API modules use a domain
  noun; backend HTTP handlers use verb-first names.
- Use index barrels only for intentional public boundaries such as
  `components/ui` and `services/api`. Avoid barrels that hide circular imports.

These are maintainability signals rather than mechanical gates. Cohesion and a
clear dependency direction take priority over splitting files solely by line count.
