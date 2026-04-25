# Local Database Setup

This project uses Prisma + PostgreSQL for operational data.

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
# Neon pooled URL (host contains "-pooler")
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@EP-XXXX-POOLER.REGION.aws.neon.tech/DB_NAME?sslmode=require&pgbouncer=true&connect_timeout=15

# Neon direct URL (host does NOT contain "-pooler")
DIRECT_URL=postgresql://DB_USER:DB_PASSWORD@EP-XXXX.REGION.aws.neon.tech/DB_NAME?sslmode=require&connect_timeout=15
```

There is also an `apps/web/.env.example` file with the same placeholder value.

If you use Neon (recommended free option), copy both connection strings from Neon dashboard:

- pooled connection -> `DATABASE_URL`
- direct connection -> `DIRECT_URL`

If your pooled URL does not include `pgbouncer=true` and `connect_timeout=15`, append them.

## Local commands

Install dependencies:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm db:generate
```

Create or update the PostgreSQL database with migrations:

```bash
pnpm db:migrate
```

Apply committed migrations in production/staging environments:

```bash
pnpm db:deploy
```

Seed a small local development dataset:

```bash
pnpm db:seed
```

Open Prisma Studio:

```bash
pnpm db:studio
```

## Command behavior (important)

- `pnpm db:generate`: generates Prisma client from schema and uses env loading from `apps/web/.env`
- `pnpm db:migrate`: runs Prisma Migrate and uses `DIRECT_URL` (through `directUrl` in schema)
- `pnpm db:seed`: runs your seed script through Prisma Client and uses `DATABASE_URL`

## P1001 quick checklist

If `pnpm db:migrate` fails with `P1001: Can't reach database server`:

1. Make sure `DIRECT_URL` uses the non-pooler Neon host (without `-pooler` in hostname).
2. Make sure `DATABASE_URL` uses the pooler host (with `-pooler` in hostname).
3. Ensure both URLs include `sslmode=require`.
4. Add `connect_timeout=15` to both URLs.
5. Confirm endpoint is not paused in Neon dashboard, then retry.

## Notes for beginners

- PostgreSQL works for both local development and hosted deployments.
- Keep one dedicated development database and one production database.
- Contentful remains the content/CMS layer. The database is for operational data.
- The current UI is still only partially wired to this database. This pass adds the foundation, not the full product workflow.
- Existing SQLite data is not copied automatically. If you need old data, export/import it manually once.
