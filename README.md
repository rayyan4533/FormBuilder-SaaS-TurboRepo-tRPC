# 📝 FormBuilder SaaS

> A modern, production-ready form creation and analytics platform built with end-to-end type safety, modular monorepo architecture, and high-performance rendering.

![Next.js](https://img.shields.io/badge/Next.js-14%2F15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=flat-square&logo=turborepo)
![tRPC](https://img.shields.io/badge/tRPC-v10%2Fv11-2563eb?style=flat-square&logo=trpc)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ⚡ Overview

**FormBuilder SaaS** provides a flexible drag-and-drop workspace for designing, deploying, and analyzing dynamic forms without writing code. Engineered as a Turborepo monorepo, the application shares validation schemas, UI components, and database models across isolated services, ensuring complete end-to-end type safety from the database to the client interface.

---

## ✨ Features

- **Intuitive Visual Builder**: Drag-and-drop interface supporting text inputs, select dropdowns, multi-step layouts, checkboxes, and file uploads.
- **End-to-End Type Safety**: Single-source-of-truth validation powered by **Zod** and **tRPC** eliminates API drift.
- **Form Publishing & Sharing**: Instantly generate public-facing, responsive submission URLs for published forms.
- **Real-Time Analytics**: Track views, total submissions, bounce rates, and field-level conversion rates.
- **Modular Monorepo Structure**: Shared UI components, configuration presets, database clients, and API routers orchestrated with **Turborepo**.
- **Data Export**: Export collected form entries to CSV and JSON formats for external processing.
- **Responsive Layout**: Tailored for desktop workflows and mobile form respondents using Tailwind CSS and Radix UI primitives.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo Engine** | [Turborepo](https://turbo.build/repo) |
| **Framework** | [Next.js](https://nextjs.org/) (App Router / Pages) |
| **API Layer** | [tRPC](https://trpc.io/) |
| **Database & ORM** | PostgreSQL / MySQL via [Prisma ORM](https://www.prisma.io/) |
| **Validation** | [Zod](https://zod.dev/) |
| **State & Drag-and-Drop** | `@dnd-kit` / `react-hook-form` |
| **Styling & UI** | Tailwind CSS, Radix UI, Lucide Icons |
| **Package Manager** | `pnpm` (recommended) or `npm` |

---

## 📁 Repository Architecture

```text
FormBuilder-SaaS-TurboRepo-tRPC/
├── apps/
│   └── web/                 # Primary Next.js application (builder, dashboard, viewer)
├── packages/
│   ├── api/                 # tRPC routers, context, and procedure definitions
│   ├── db/                  # Prisma schema, client instance, and migrations
│   ├── ui/                  # Shared, accessible design system components
│   ├── eslint-config/       # Shared linting rules
│   └── typescript-config/   # Shared tsconfig definitions
├── turbo.json               # Pipeline build and caching rules
└── package.json
