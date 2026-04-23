# Auth Setup

This storefront now uses a simple database-backed authentication flow with OTP and server-side sessions.

Current real login method:

- email OTP

Prepared in the architecture:

- phone OTP via pluggable transport
- optional magic link later
- optional Google login later

## Required local env

For local development in `apps/web/.env`:

```env
DATABASE_URL=file:./dev.db
AUTH_EMAIL_TRANSPORT=mock
AUTH_EMAIL_FROM=auth@example.com
AUTH_SMS_TRANSPORT=mock
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## Transport modes

### Email

- `AUTH_EMAIL_TRANSPORT=mock`
  - default local-first mode
  - no paid service required
  - OTP is logged on the server and also shown on the login page in development mode

- `AUTH_EMAIL_TRANSPORT=smtp`
  - sends real email through SMTP
  - requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### SMS

- `AUTH_SMS_TRANSPORT=mock`
  - current development-friendly fallback
  - architecture is ready for a real provider later

## Current auth flow

1. User enters email on `/login`
2. Server creates a hashed OTP record in the database
3. OTP is delivered through the configured transport
4. User submits the code
5. If the account does not exist yet, it is created automatically
6. A database-backed session is created and stored in an `httpOnly` cookie

## Security defaults

- OTP expiry:
  - email: 10 minutes
  - sms: 5 minutes
- resend cooldown: 60 seconds
- max invalid attempts per OTP: 5
- identifier window limit: 5 OTP requests per 15 minutes
- IP window limit: 20 OTP requests per 15 minutes

## Notes

- Contentful is still only for content/CMS.
- Auth and session data live in Prisma/SQLite.
- The account page now depends on a real authenticated session.
