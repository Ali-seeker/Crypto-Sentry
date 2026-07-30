# Troubleshooting Guide

This guide covers common issues you might encounter while developing, deploying, or running Crypto-Sentry.

## 1. Prisma Migration Fails to Connect to Supabase
**Symptom**: Running `npx prisma migrate dev` fails with a connection error or times out when connecting to Supabase.
**Cause**: Supabase uses IPv6 for direct connections or might have the connection pooler configured on a different port.
**Fix**: Ensure your `DATABASE_URL` in `.env` uses the transaction connection pooler string (port 6543) and append `?pgbouncer=true` if required, or ensure you are on a network that supports IPv6 if using the direct connection string. 
Example: `postgres://[user]:[password]@aws-0-[region].pooler.supabase.com:6543/[db]?connection_limit=10`

## 2. Password with Special Characters Breaks DATABASE_URL
**Symptom**: Prisma complains about an invalid connection string or cannot connect to the database.
**Cause**: If your database password contains special characters like `@`, `#`, or `?`, the URL parser gets confused.
**Fix**: URL-encode your password in the `DATABASE_URL`. For example, `@` becomes `%40` and `#` becomes `%23`.

## 3. Watchlist API Returns 401 Even When Logged In
**Symptom**: Calling `fetch('/api/watchlist')` returns a 401 Unauthorized error in the Network tab, despite being authenticated on the frontend.
**Cause**: Using `getServerSession()` without arguments in App Router API routes returns `null`.
**Fix**: You must pass the auth options to `getServerSession`.
```typescript
import { authOptions } from "@/lib/auth"
// Incorrect
const session = await getServerSession()
// Correct
const session = await getServerSession(authOptions)
```

## 4. Login Succeeds But Doesn't Redirect
**Symptom**: Submitting the login form logs the user in, but they remain stuck on the `/login` page instead of redirecting to `/dashboard`.
**Cause**: NextAuth `signIn` was not awaited properly, or the `callbackUrl` was not explicitly handled in the component.
**Fix**: Await the `signIn` call and check for `result?.ok`. If successful, manually push to the dashboard.
```typescript
const result = await signIn("credentials", {
  redirect: false,
  email,
  password,
})
if (result?.ok) {
  router.push("/dashboard")
}
```

## 5. Dashboard Shows Stale/Missing Data for Most Assets
**Symptom**: The Live Price Feed shows "stable" and a static price, or only a few assets have data when the Surveillance Engine is down.
**Cause**: This is a **known limitation** of the fallback mechanism. The `CryptoAlert` table only records flash crashes. When the live Express engine is down, the dashboard falls back to querying the `CryptoAlert` table to retrieve the last known prices. Assets that have never crashed will not have a price record in the fallback database.
**Fix**: Start the Surveillance Engine (`npm run dev:server` or `npm run dev:all`).

## 6. Spotlight Tour / Guide Repeats After Relogin
**Symptom**: After completing the onboarding tour and relogging in, the tour starts again.
**Cause**: The UI component that triggers the API call to `/api/user/guide-completed` was unmounting before the `fetch` request completed, cancelling the request.
**Fix**: Ensure `await fetch(...)` is fully resolved before unmounting the React component.

## 7. Build Fails with TypeScript Errors on `process.env`
**Symptom**: TypeScript complains about `process.env.NEXTAUTH_SECRET` being undefined.
**Cause**: Strict mode in TypeScript expects explicit type definitions or non-null assertions for environment variables.
**Fix**: Use the non-null assertion operator (`!`) when passing required environment variables to NextAuth config: `secret: process.env.NEXTAUTH_SECRET!`.
