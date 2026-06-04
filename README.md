# Namdhari Swaich Sweets Business Suite

Production-style personalized business management PWA for a sweets and dairy shop. It covers invoices, inventory, employees, salaries, farmer milk collection, ledgers, supplier/customer/farmer payments, expenses, profit reporting, exports, audit logs, and owner-editable business settings.

## Tech Stack

- Next.js App Router with TypeScript strict mode
- Tailwind CSS and shadcn-style reusable UI primitives
- React Hook Form and Zod validation
- Prisma ORM with PostgreSQL
- Neon PostgreSQL or Supabase PostgreSQL deployment path
- Signed HTTP-only cookie authentication with role-based permissions
- PDF and CSV exports for reports
- PWA manifest and service worker

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Demo password for seeded users: `Namdhari@123`

Seeded users:

- `agency@nss.local`
- `owner@nss.local`
- `manager@nss.local`
- `cashier@nss.local`
- `inventory@nss.local`
- `accountant@nss.local`
- `viewer@nss.local`

If `DATABASE_URL` is not configured, the app still allows demo login and renders fallback sample rows so the UI can be reviewed before database setup.

## Modules

- Authentication, protected routes, user roles, and permissions
- Owner-editable business settings, invoice identity, logo URL, tax defaults, and branch fields
- Dashboard summary queries for sales, expenses, profit, dues, milk, salary, stock alerts, and quick actions
- Product catalogue with SKU, unit, category, prices, tax, image URL, and low-stock fields
- Invoice system with customer dues, payment status, PDF route, exports, and ledger integration
- Customer, farmer, and supplier ledgers
- Raw material and finished product inventory with movement-ready schema
- Farmer milk collection with morning/evening sessions and raw milk stock-in hook
- Employee profiles, attendance schema, and salary payment schema
- Expenses, payments, profit/loss reporting, and cash closing report definitions
- Reports catalogue with PDF and CSV export endpoints
- Audit logs and report export logs
- Backup/export documentation and restore placeholder

## Change Management Policy

Minor UI/content changes can be collected and released together.

Bug fixes are tracked and released in combined updates after verification.

Major new features should be treated as separate paid modules.

QR menu, deals, loyalty, coupons, online ordering, WhatsApp API, payment gateway, promotional campaigns, and native mobile apps are not included in this version. They are intentionally reserved for future upsell phases.

## Production Notes

- Use a long random `AUTH_SECRET` in production.
- Configure `DATABASE_URL` from Neon or Supabase with SSL enabled.
- Run `npm run db:push` for a first demo deployment or Prisma migrations for a managed production release flow.
- Run `npm run db:seed` only for demo data or initial controlled setup.
- Use Vercel environment variables for production configuration.
- Uploaded image/file storage is represented by URL fields and should be backed by Supabase Storage, S3, or another managed provider before production upload features are enabled.

## Optional MongoDB Note

MongoDB is not recommended for this version because invoices, ledger entries, stock movement, salaries, farmers, and reports are structured relational data. PostgreSQL with Prisma is the preferred low-cost path.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run db:generate
npm run db:push
npm run db:seed
```

## Documentation

- [Deployment guide](docs/deployment.md)
- [Database setup guide](docs/database-setup.md)
- [Backup and restore notes](docs/backup-restore.md)
- [Performance notes](docs/performance.md)
- [Internal checklist](docs/internal-checklist.md)
