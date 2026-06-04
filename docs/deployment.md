# Deployment Guide

## 1. Create GitHub Repository

1. Commit this source code to a GitHub repository.
2. Keep `.env.local` out of Git.
3. Push the main branch to GitHub.

## 2. Create PostgreSQL Database

Use Neon PostgreSQL Free or Supabase Free for the first deployment. Copy the pooled or direct PostgreSQL connection string with SSL enabled.

## 3. Configure Vercel

1. Import the GitHub repository into Vercel.
2. Set framework preset to Next.js.
3. Add environment variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
AUTH_SECRET=long-random-production-secret
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

4. Set build command:

```bash
npm run build
```

5. Deploy.

## 4. Initialize Database

For the first demo deployment:

```bash
npm run db:push
npm run db:seed
```

For production with controlled schema history, replace `db:push` with Prisma migrations.

## 5. Verify

- Visit `/login`.
- Login with `owner@nss.local` and `Namdhari@123` after seeding.
- Confirm `/dashboard`, `/invoices`, `/inventory`, `/farmers`, `/employees`, `/reports`, and `/business-settings` load.
- Download a PDF and CSV report.
- Update production passwords after first login.
