# FreightFlow SaaS - Professional Project Folder Structure

This document defines the **recommended professional folder structure** for the FreightFlow SaaS project. It is designed for clarity, maintainability, scalability, and ease of collaboration between frontend, backend, and design teams.

---

## Root Structure
```
freightflow-saas/
├── README.md
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── public/
```

### Description
- `README.md`: Project overview, setup instructions, documentation.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `.env`: Environment variables for development, staging, and production.
- `.gitignore`: Files and folders to ignore in Git.
- `next.config.js`: Next.js configuration.
- `postcss.config.js` & `tailwind.config.js`: Styling and utility configurations.
- `public/`: Static assets like images, icons, and fonts.

---

## Frontend Structure
```
freightflow-saas/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── [routes]/
├── components/
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Footer/
│   ├── DashboardCards/
│   ├── Tables/
│   └── Modals/
├── hooks/
├── context/
├── styles/
│   ├── globals.css
│   └── components.css
└── utils/
```

### Description
- `app/`: Next.js pages and route components.
- `components/`: Reusable UI components (Navbar, Sidebar, Cards, Modals, Tables).
- `hooks/`: Custom React hooks.
- `context/`: React context providers for global state.
- `styles/`: Global and component-specific CSS or Tailwind directives.
- `utils/`: Helper functions, constants, and utilities.

---

## Backend Structure
```
freightflow-saas/
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.ts
│   │   │   └── login.ts
│   │   ├── loads/
│   │   ├── shipments/
│   │   └── payments/
│   ├── db/
│   │   ├── schema.prisma
│   │   └── client.ts
│   ├── middleware/
│   ├── services/
│   └── routes/
```

### Description
- `server/api/`: API route handlers and endpoints.
- `auth/`: Registration, login, and JWT/session handling.
- `loads/`, `shipments/`, `payments/`: Feature-specific API logic.
- `db/`: Prisma schema and database client.
- `middleware/`: Authentication, authorization, logging, and error handling.
- `services/`: Business logic and external API integrations.
- `routes/`: API route definitions (if using Express/NestJS).

---

## Admin Dashboard Structure
```
freightflow-saas/
├── admin/
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── utils/
```

### Description
- `admin/pages/`: Admin-specific pages and routes.
- `components/`: Reusable admin UI components (tables, charts, modals).
- `context/`: Admin-specific state providers.
- `utils/`: Admin helper functions.

---

## Assets & Static Files
```
freightflow-saas/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
```

### Description
- `images/`: Logo, product images, cargo images.
- `icons/`: UI icons and SVGs.
- `fonts/`: Custom fonts used across the application.

---

## Documentation & DevOps
```
freightflow-saas/
├── docs/
│   ├── architecture.md
│   ├── api_spec.md
│   └── ui_ux_blueprint.md
├── scripts/
│   ├── seed_db.ts
│   └── deploy.sh
```

### Description
- `docs/`: Architecture, API specs, and UI/UX blueprints for internal/external reference.
- `scripts/`: Database seeders, deployment scripts, automation utilities.

---

**This folder structure ensures clarity, maintainability, scalability, and professional organization for the FreightFlow SaaS project, supporting development, design, and deployment teams efficiently.**

