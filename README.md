# RestoQR - Multi-Tenant Restaurant QR Menu SaaS

A modern, production-ready foundation for a multi-tenant restaurant QR menu SaaS built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (Authentication & PostgreSQL Database with Row Level Security)**.

---

## 🚀 Features

### 1. Three Distinct Roles & Access Control
- **Super Admin (`admin`)**:
  - Access to Super Admin Console at `/admin`.
  - Monitor all restaurant tenants, owner accounts, and platform metrics.
  - Manage and update tenant subscription statuses (`trialing`, `active`, `past_due`, `canceled`, `inactive`).
  - Strict Edge Middleware protection preventing unauthorized owner/customer access.
- **Restaurant Owner (`owner`)**:
  - Access to Owner Dashboard at `/dashboard`.
  - Self-service registration at `/register` with automatic 14-day free trial.
  - Configure restaurant profile (Name, URL slug, phone, address, logo).
  - Real-time SVG & PNG QR code generator linking to live customer menu.
- **Customer (Public)**:
  - Frictionless public access at `/[slug]` (e.g. `/la-piazza`).
  - Zero login, signup, or app download required.

### 2. Modern Stripe/Vercel Aesthetic
- Sleek typography, subtle borders, card elevations, and responsive sidebar navigation.
- Loading skeletons, toast/alert feedback, and comprehensive error handling.
- Mobile-first responsive layouts for dashboards and customer menus.

### 3. Production Supabase & Interactive Demo Fallback
- **Production Mode**: Full integration with `@supabase/ssr` and Supabase Auth.
- **Demo / Offline Mode**: Built-in interactive store enabling instant evaluation without configuring keys upfront.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) with Row Level Security (RLS)
- **QR Engine**: `qrcode.react` (SVG + PNG Export)
- **Deployment**: Vercel ready

---

## 📁 Project Structure

```
qr-menu-saas/
├── app/
│   ├── [slug]/          # Public customer QR menu view
│   ├── admin/           # Super Admin Console (Tenant oversight & RBAC)
│   ├── dashboard/       # Restaurant Owner Portal (Profile & QR)
│   ├── login/           # Unified role-aware authentication page
│   ├── register/        # Restaurant owner onboarding page
│   ├── globals.css      # Design tokens & base styles
│   ├── layout.tsx       # Root layout with connection banner
│   └── page.tsx         # Modern SaaS landing page
├── components/
│   ├── admin/           # Super Admin tables & metric components
│   ├── auth/            # Login & Register forms with validation
│   ├── dashboard/       # Restaurant profile editor & QR generator
│   ├── layout/          # Sidebars, headers, navigation
│   └── ui/              # Button, Input, Card, Badge, Skeleton
├── lib/
│   ├── supabase/        # Browser, Server, & Middleware Supabase clients
│   ├── auth-service.ts  # Unified auth & data access layer
│   ├── mock-data.ts     # Initial seed & demo datasets
│   └── types.ts         # TypeScript schema definitions
├── supabase/
│   └── schema.sql       # PostgreSQL schema, RLS policies, triggers & indexes
└── middleware.ts        # Next.js Edge Middleware for RBAC route protection
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: If you leave these blank, the app will smoothly run in interactive Demo Mode.

### 3. Run Supabase Database Migrations
Open your Supabase project's **SQL Editor** and execute the entire contents of:
[`supabase/schema.sql`](supabase/schema.sql)

This will create:
- `public.users` table with auto-sync trigger from `auth.users`.
- `public.restaurants` table with unique slug constraint and subscription status check.
- Complete Row Level Security (RLS) policies for tenant isolation.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts for Quick Testing

| Role | Email | Password | Description |
|---|---|---|---|
| **Super Admin** | `admin@demo.com` | `password123` | Inspect all tenants, toggle subscription status, view all accounts |
| **Restaurant Owner** | `owner@demo.com` | `password123` | Manage "La Piazza Trattoria", edit profile, view QR code |
| **Customer** | *(No login)* | *(No password)* | Visit `http://localhost:3000/la-piazza` directly |

---

## 🔒 Route Protection Matrix

| Route | Role Permitted | Unauthorized Behavior |
|---|---|---|
| `/admin` | `admin` only | Non-admins redirected to `/dashboard`; Unauthenticated to `/login?redirect=/admin` |
| `/dashboard` | `owner` only | Admins redirected to `/admin`; Unauthenticated to `/login?redirect=/dashboard` |
| `/login`, `/register` | Public / Guests | Logged-in owners redirected to `/dashboard`; Admins to `/admin` |
| `/[slug]`, `/` | Public (All) | Accessible by everyone including customers |

---

## 🚢 Vercel Deployment

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click **Deploy**. Zero configuration required!
