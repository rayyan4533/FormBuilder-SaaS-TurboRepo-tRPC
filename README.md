# ⚡ FormBuilder SaaS — Modern Monorepo & tRPC Engine

<div align="center">

![FormBuilder SaaS Banner](https://img.shields.io/badge/FormBuilder-Dark%20Yellow%20Neon-eab308?style=for-the-badge&logo=react&logoColor=black)

### A Next-Generation, End-to-End Type-Safe Form Building Platform

_Engineered with Turborepo, Next.js 16, tRPC v11, Express 5, Drizzle ORM, and PostgreSQL._

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-monorepo-structure">Monorepo Structure</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api--documentation">API & Docs</a> •
  <a href="#-database--schema">Database</a> •
  <a href="#-environment-variables">Environment</a>
</p>

---

[![Turborepo](https://img.shields.io/badge/Turborepo-v2.7-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build)
[![Next.js](<https://img.shields.io/badge/Next.js-16.1_(App_Router)-000000?style=flat-square&logo=next.js&logoColor=white>)](https://nextjs.org)
[![tRPC](https://img.shields.io/badge/tRPC-v11-2563EB?style=flat-square&logo=trpc&logoColor=white)](https://trpc.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Scalar API Docs](https://img.shields.io/badge/API_Reference-Scalar-FF6B6B?style=flat-square)](https://github.com/scalar/scalar)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

</div>

---

## 🌟 Executive Overview

**FormBuilder SaaS** is a production-grade, fullstack monorepo application for visually creating, managing, and distributing interactive digital forms and collecting validated submissions in real-time.

Built with an **end-to-end type-safe** philosophy, the system connects a reactive Next.js 16 front-end to a modular Express 5 API server via a shared tRPC routing layer. Every mutation, query, schema, and database relation is strictly validated with TypeScript and Zod from the browser UI down to the PostgreSQL persistence layer.

---

## 🚀 Key Features

### 🎨 Visual Form Builder Studio

- **3-Pane Studio Layout**: Component Palette on the left, Live Canvas in the center, and a Real-Time Property Inspector on the right.
- **Rich Field Palette**:
  - 📝 **Short Text**: Single-line text for names, titles, and handles.
  - 🔒 **Password**: Masked inputs with secure credential validation.
  - ✉️ **Email Address**: Automated format validation and sanitation.
  - 🔢 **Number Input**: Numeric values, ages, and quantities.
  - 🔘 **Radio Choice (Yes/No)**: Boolean and binary decision selectors.
  - 📅 **Date Picker & File Upload**: Ready for date selection and dropzone attachments.
- **Fractional Indexing System**: Reordering and field sequence management powered by numeric fractional scale positioning (`index: numeric('index', { scale: 2 })`).
- **Live Reactive Inspector**: Edit field labels, placeholders, helper hints, and mandatory/required constraints with instant canvas preview.

### 🌐 Public Form Runner & Submissions

- **Shareable Respondent Links**: Clean, branded public URLs (`/forms/[id]`) for frictionless form completion.
- **Client-Side Validation**: Dynamic field verification and error handling powered by React Hook Form and Zod schemas.
- **Submissions Dashboard**: Real-time response table (`/dashboard/forms/[id]/submissions`) featuring timestamps, per-field dynamic columns, and one-click data refetching.

### 🔐 Security & Identity

- **Custom Auth Engine**: Salted cryptographic password hashing (`crypto.randomBytes` + HMAC SHA-256).
- **Session Tokens**: JWT-authenticated state with HTTP-only cookie transport.
- **Protected Procedures**: Context-aware tRPC middleware enforcing authenticated sessions across user operations.

### ⚡ Developer-First Architecture

- **Dual API Protocols**: Native tRPC RPC layer for Next.js web application + automatic OpenAPI 3.0 REST generation via `trpc-to-openapi`.
- **Interactive API Documentation**: Embedded [Scalar](https://scalar.com) API documentation runner hosted directly at `/docs`.
- **Cyberpunk Dark-Neon Aesthetics**: Custom Dark Yellow Neon theme with tailored glassmorphism, fluid glowing borders, and collapsible sidebar.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        A[Next.js 16 Web App\nReact 19, Tailwind v4, TanStack Query]
        PR[Public Form Runner\n/forms/:id]
        DB[Dashboard & Builder Studio\n/dashboard/forms/:id]
    end

    subgraph Transport ["Communication Layer"]
        TRPC_C["@repo/trpc Client\nType-safe RPC Client"]
        REST_C["REST / OpenAPI Consumers\nThird-Party Clients"]
    end

    subgraph Server ["Server Layer (Express 5 @ :8000)"]
        TRPC_S["tRPC Express Middleware\n/trpc"]
        OPENAPI["OpenAPI Middleware\n/api"]
        SCALAR["Scalar API Reference\n/docs & /openapi.json"]
    end

    subgraph Core ["Shared Monorepo Packages"]
        ROUTER["@repo/trpc Server Routers\nauth | form | health"]
        SERVICE["@repo/services\nUser, Form, Field, Submission Services"]
        DB_PKG["@repo/database\nDrizzle ORM + PostgreSQL"]
        LOGGER["@repo/logger\nWinston Structured Logger"]
    end

    subgraph Storage ["Persistence"]
        PG[(PostgreSQL Database\nusers, forms, form_fields, form_submissions)]
    end

    A --> TRPC_C
    PR --> TRPC_C
    DB --> TRPC_C
    TRPC_C -->|HTTP /trpc| TRPC_S
    REST_C -->|HTTP /api| OPENAPI
    SCALAR -.->|Reflects Router Schema| ROUTER

    TRPC_S --> ROUTER
    OPENAPI --> ROUTER
    ROUTER --> SERVICE
    SERVICE --> DB_PKG
    SERVICE --> LOGGER
    DB_PKG --> PG
```

---

## 📂 Monorepo Structure

This project uses [Turborepo](https://turbo.build/repo) and `pnpm workspaces`:

```text
trpc-monorepo/
├── apps/
│   ├── api/                      # Standalone Express 5 backend server
│   │   ├── src/
│   │   │   ├── env.ts            # API runtime environment validation (Zod)
│   │   │   ├── server.ts         # Express server, CORS, Scalar & tRPC setup
│   │   │   └── index.ts          # Server listener entrypoint (Port 8000)
│   │   └── tsup.config.ts        # Bundler configuration
│   └── web/                      # Next.js 16 frontend application (React 19)
│       ├── app/
│       │   ├── (auth)/           # Authentication routes (login & signup)
│       │   ├── dashboard/        # Dashboard, Form list, Studio, Submissions
│       │   ├── forms/[id]/       # Public form runner for respondents
│       │   └── globals.css       # Tailwind v4 theme & Dark Yellow Neon styles
│       ├── components/           # UI components, Sidebar, Form Canvas, Dialogs
│       ├── hooks/                # React Query & tRPC hooks
│       └── trpc/                 # Client tRPC provider & react-query hydration
│
├── packages/
│   ├── database/                 # Drizzle ORM models, relations, migrations
│   │   ├── models/               # user.ts, form.ts, form-fields.ts, form-submission.ts
│   │   ├── drizzle/              # Generated SQL migrations
│   │   └── schema.ts             # Consolidated relational database schema
│   ├── trpc/                     # Unified tRPC routers & contract definitions
│   │   ├── client/               # Frontend client definitions
│   │   └── server/
│   │       ├── routes/           # auth/, form/, health/ route implementations
│   │       ├── context.ts        # Request context & JWT authentication extractor
│   │       └── trpc.ts           # publicProcedure & authenticatedProcedure
│   ├── services/                 # Pure domain business logic & database mutations
│   │   ├── user/                 # Registration, authentication, token issuance
│   │   ├── form/                 # Form CRUD & ownership verification
│   │   ├── form-field/           # Field creation, fractional sorting, patching
│   │   └── form-submission/      # Response ingestion & submission retrieval
│   ├── logger/                   # Winston logging utility (colorized & JSON formats)
│   ├── eslint-config/            # Monorepo-wide ESLint presets
│   └── typescript-config/        # Monorepo-wide tsconfig base rules
│
├── turbo.json                    # Turborepo task pipeline & cache rules
├── pnpm-workspace.yaml           # Workspace definitions
└── setup.sh                      # Shell script for symlinking .env across packages
```

---

## 🛠️ Tech Stack & Tooling

| Domain             | Technology                                                                                   | Description                                                                   |
| :----------------- | :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Monorepo**       | [Turborepo](https://turbo.build) + [pnpm](https://pnpm.io)                                   | High-speed build pipeline, topological task execution, and workspace caching. |
| **Frontend**       | [Next.js 16](https://nextjs.org) (App Router)                                                | React 19 server/client components, optimized fonts, dynamic routes.           |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com) + Radix UI                                        | Modern atomic styling, CSS variables theme, accessible unstyled primitives.   |
| **Backend API**    | [Express 5](https://expressjs.com) + Node.js                                                 | Fast, modern web framework running tRPC and OpenAPI middlewares.              |
| **Communication**  | [tRPC v11](https://trpc.io)                                                                  | End-to-end type-safe queries and mutations without codegen overhead.          |
| **OpenAPI & Docs** | [trpc-to-openapi](https://github.com/jlalmes/trpc-to-openapi) + [Scalar](https://scalar.com) | Interactive OpenAPI 3.0 interactive documentation portal at `/docs`.          |
| **ORM & Database** | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL                                         | Lightweight, edge-ready TypeScript ORM with schema migrations and Studio.     |
| **State & Forms**  | TanStack Query v5 + React Hook Form + Zod                                                    | Robust data synchronization, optimistic UI, and runtime schema validation.    |
| **Logging**        | [Winston](https://github.com/winstonjs/winston)                                              | Structured console logging with timestamps and development colorizing.        |

---

## 🚦 Quick Start

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (`node -v`)
- **Package Manager**: `pnpm` v9 or higher (`npm install -g pnpm`)
- **PostgreSQL**: Local PostgreSQL instance or hosted service (e.g. Neon, Supabase)

### 2. Clone Repository

```bash
git clone https://github.com/rayyan4533/FormBuilder-SaaS-TurboRepo-tRPC.git
cd FormBuilder-SaaS-TurboRepo-tRPC
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory (you can run `bash setup.sh` on Unix or create it manually):

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:root@localhost:5432/formbuild"

# JWT Secret for Session Hashing
JWT_SECRET="super-secret-jwt-key-replace-me"

# API Server Configuration
PORT=8000
NODE_ENV=development
BASE_URL="http://localhost:8000"

# Web Client Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

> **Symlink Helper**: Run `./setup.sh` to automatically symlink or propagate the `.env` file across all workspaces in `apps/` and `packages/`.

### 5. Database Setup & Migrations

Generate Drizzle artifacts and execute migrations against your database:

```bash
# Generate SQL migration files from schema models
pnpm db:generate

# Apply migrations to your PostgreSQL database
pnpm db:migrate
```

_(Optional)_ Launch Drizzle Studio to inspect and edit your database tables visually:

```bash
pnpm --filter @repo/database db:studio
```

### 6. Run the Development Environment

Launch both the **Web Client** (`apps/web` on port `3000`) and the **API Server** (`apps/api` on port `8000`) concurrently:

```bash
pnpm dev
```

Visit the applications in your browser:

- 💻 **Web App**: [http://localhost:3000](http://localhost:3000)
- 📊 **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- 🔌 **API Health**: [http://localhost:8000/health](http://localhost:8000/health)
- 📖 **Interactive Scalar API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📋 **OpenAPI Specification**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 📜 Available Scripts

Run these commands from the root directory:

| Command            | Action                                                                           |
| :----------------- | :------------------------------------------------------------------------------- |
| `pnpm dev`         | Starts all applications and background watches concurrently via Turborepo.       |
| `pnpm build`       | Compiles all packages and builds production bundles (`apps/api` and `apps/web`). |
| `pnpm db:generate` | Inspects schema models and generates new migration SQL scripts.                  |
| `pnpm db:migrate`  | Runs all pending Drizzle migrations on the PostgreSQL instance.                  |
| `pnpm check-types` | Executes static type validation across all workspaces via `tsc --noEmit`.        |
| `pnpm lint`        | Runs ESLint across all packages and apps to enforce code quality.                |
| `pnpm format`      | Formats TypeScript, TSX, JSON, and Markdown files using Prettier.                |

---

## 📚 API & Documentation

The API server provides dual-protocol support:

### 1. tRPC Server (`http://localhost:8000/trpc`)

Enables direct, end-to-end type-safe procedure calling with automatic autocomplete in the frontend.

| Router   | Procedure                        | Type       | Description                                                     |
| :------- | :------------------------------- | :--------- | :-------------------------------------------------------------- |
| `auth`   | `createUserWithEmailAndPassword` | `Mutation` | Registers a new user account with hashed password.              |
| `auth`   | `signInUserWithEmailAndPassword` | `Mutation` | Authenticates credentials and sets HTTP-only auth cookie.       |
| `auth`   | `getLoggedInUserInfo`            | `Query`    | Retrieves current session user info (`protect: true`).          |
| `form`   | `createForm`                     | `Mutation` | Creates a new form container under the active user.             |
| `form`   | `listForms`                      | `Query`    | Lists all forms owned by the authenticated user.                |
| `form`   | `getForm`                        | `Query`    | Public query to fetch form metadata and field schema.           |
| `form`   | `updateForm`                     | `Mutation` | Modifies form title or description.                             |
| `form`   | `createField`                    | `Mutation` | Appends a field with calculated fractional index.               |
| `form`   | `getFields`                      | `Query`    | Fetches ordered fields for a given form ID.                     |
| `form`   | `updateField`                    | `Mutation` | Updates label, placeholder, required flag, or index.            |
| `form`   | `deleteField`                    | `Mutation` | Deletes a field from the form.                                  |
| `form`   | `submitForm`                     | `Mutation` | Public endpoint for submitting respondent values.               |
| `form`   | `getFormSubmissions`             | `Query`    | Fetches all submissions collected for a form (`protect: true`). |
| `health` | `getHealth`                      | `Query`    | Server status and health ping.                                  |

### 2. Scalar Interactive OpenAPI Docs (`http://localhost:8000/docs`)

Every tRPC procedure marked with `.meta({ openapi: { ... } })` is translated into a RESTful OpenAPI 3.0 specification available at `/openapi.json` and rendered via Scalar UI.

---

## 🗄️ Database & Schema

The database is built on PostgreSQL using **Drizzle ORM**.

```mermaid
erDiagram
    USERS ||--o{ FORMS : "creates"
    FORMS ||--o{ FORM_FIELDS : "contains"
    FORMS ||--o{ FORM_SUBMISSIONS : "collects"

    USERS {
        uuid id PK
        varchar full_name
        varchar email UK
        boolean email_verified
        text profile_image_url
        text salt
        text password
        timestamp created_at
        timestamp updated_at
    }

    FORMS {
        uuid id PK
        varchar title
        varchar description
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    FORM_FIELDS {
        uuid id PK
        varchar label
        varchar label_key
        text description
        text placeholder
        boolean is_required
        numeric index
        field_type_enum type
        uuid form_id FK
        timestamp created_at
        timestamp updated_at
    }

    FORM_SUBMISSIONS {
        uuid id PK
        uuid form_id FK
        json values
        timestamp created_at
        timestamp updated_at
    }
```

---

## 🔒 Security Practices

- **Password Protection**: Passwords are never stored in plaintext. They are salted with a 16-byte cryptographically secure random string and hashed using HMAC-SHA256.
- **Cookie Security**: Authentication tokens are transmitted in `httpOnly` secure cookies to mitigate Cross-Site Scripting (XSS) token theft.
- **Strict Input Validation**: All mutations and queries pass through runtime Zod validators before entering business services.
- **Parameterized Queries**: Drizzle ORM utilizes prepared, parameterized queries to defend against SQL injection vectors.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please make sure to run `pnpm check-types` and `pnpm lint` before submitting a PR.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Engineered with precision by <a href="https://github.com/rayyan4533">Rayyan</a> and powered by modern web technologies.</sub>
</div>
