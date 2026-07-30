# Crypto-Sentry

Crypto-Sentry is a real-time cryptocurrency surveillance engine and dashboard. It continuously monitors live market data from CoinGecko, detects sudden price drops (flash crashes), and alerts users in real-time. Users can manage their own watchlists, explore live market data, and receive guided onboarding tours.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Express.js (Surveillance Engine), Next.js API Routes
- **Database**: PostgreSQL (via Supabase), Prisma ORM
- **Authentication**: NextAuth.js (Credentials & Google Providers)

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (e.g., Supabase)
- CoinGecko API key (optional but recommended for higher rate limits)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ali-seeker/Crypto-Sentry.git
   cd bitbash-crypto-sentry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and populate it with your configuration (see Environment Variable Reference below).

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev:all
   ```
   This command starts both the Next.js frontend (on port 3000) and the Express Surveillance Engine (on port 4000).

## Running in Production

To run the application in a production environment:

1. **Build the Next.js app**
   ```bash
   npm run build
   ```

2. **Start the Next.js app**
   ```bash
   npm start
   ```

3. **Start the Surveillance Engine**
   It's highly recommended to use a process manager like `pm2` to keep the Express engine running persistently in the background.
   ```bash
   npm install -g pm2
   pm2 start npm --name "crypto-sentry-engine" -- run dev:server
   ```

## Environment Variable Reference

| Name | Required? | Example Value | Description |
|---|---|---|---|
| `COINGECKO_API_KEY` | No | `CG-xxxxx` | Optional CoinGecko API key to prevent rate limits. |
| `PORT` | Yes | `4000` | Port for the Express Surveillance Engine. |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000` | URL of the Next.js frontend. |
| `DATABASE_URL` | Yes | `postgres://user:password@host:port/db?connection_limit=10` | Prisma connection string. Note the `connection_limit=10` param to avoid pool exhaustion. |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Base URL for NextAuth. |
| `NEXTAUTH_SECRET` | Yes | `supersecret` | Secret for NextAuth. **Must be regenerated for production!** |
| `GOOGLE_CLIENT_ID` | No | `123-xyz.apps.googleusercontent.com` | Google OAuth Client ID. |
| `GOOGLE_CLIENT_SECRET` | No | `GOCSPX-...` | Google OAuth Client Secret. |

## Security Notes
- **NEXTAUTH_SECRET**: Never reuse the development secret in production. Generate a strong, unique secret using `openssl rand -base64 32`.
- **HTTPS**: The application MUST be served over HTTPS in production.
- **Cookies**: When `NEXTAUTH_URL` uses `https://`, NextAuth automatically applies `Secure` and `HttpOnly` flags to authentication cookies. Ensure this is configured correctly.
