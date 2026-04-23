# Local Database Setup

This project now includes a simple local-first operational database foundation using Prisma + SQLite.

Scope:

- operational data only
- Contentful stays the CMS source for marketing/content pages
- no payment logic
- no future marketplace or API-sales tables in this phase

## What the database covers

- users
- user profiles
- auth identities
- OTP codes
- sessions
- carts
- cart items
- orders
- order items
- customer addresses
- audit logs
- support requests

## Environment

Add this to `apps/web/.env` for local Prisma and Next.js commands:

```env
DATABASE_URL=file:./dev.db
```

There is also an `apps/web/.env.example` file with the same value for convenience.

## Local commands

Install dependencies:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm db:generate
```

Create or update the local SQLite database with migrations:

```bash
pnpm db:migrate
```

Seed a small local development dataset:

```bash
pnpm db:seed
```

Open Prisma Studio:

```bash
pnpm db:studio
```

## Notes for beginners

- SQLite is local and file-based, so it is easy to use in development.
- Prisma keeps the schema migration-friendly for a later PostgreSQL move.
- Contentful remains the content/CMS layer. The database is for operational data.
- The current UI is still only partially wired to this database. This pass adds the foundation, not the full product workflow.
- The local SQLite database file is ignored by git.
