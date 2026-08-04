# Crypto-Sentry 🛡️

Crypto-Sentry is a real-time cryptocurrency surveillance engine and interactive dashboard. It continuously monitors live market data from CoinGecko, detects sudden price drops (flash crashes) or spikes, and alerts users in real-time. Designed with a premium aesthetic and rich micro-animations, users can manage personalized watchlists, explore live market data, adjust surveillance sensitivity, and get instant notifications.

## ✨ Key Features
- **Real-Time Surveillance Engine**: A dedicated Express.js server that polls market data every 30 seconds and algorithmically detects flash crashes and price spikes.
- **Dynamic Watchlists**: Users can add specific assets to their watchlists and only receive alerts for the assets they care about.
- **Adjustable Sensitivity**: Tweak the alert threshold on-the-fly to filter out noise or catch the smallest market movements.
- **Live Market Dashboard**: Includes a continuous Ticker Tape, Live Price Grid, and interactive Market Overview powered by Framer Motion.
- **Authentication**: Secure login and registration using NextAuth.js, supporting Credentials and Google OAuth.
- **Debug Tools**: Built-in developer endpoints to simulate crashes and spikes to test the alerting system instantly.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Lucide React
- **Backend / Engine**: Express.js (Surveillance Engine), Next.js API Routes
- **Database**: PostgreSQL (via Supabase or local), Prisma ORM
- **Authentication**: NextAuth.js

## 📦 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- CoinGecko API key (optional, but recommended to avoid rate limits)

## 🚀 Setup Instructions

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
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   # PostgreSQL connection (e.g. Supabase connection string)
   DATABASE_URL="postgres://user:password@host:port/db?connection_limit=10"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"
   
   # Express Engine Port
   PORT="4000"
   
   # Next.js API URL
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   
   # (Optional) Authentication Providers
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   
   # (Optional) CoinGecko API
   COINGECKO_API_KEY=""
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Environment**
   ```bash
   npm run dev:all
   ```
   *This command runs `concurrently` to start both the Next.js frontend (port 3000) and the Express Surveillance Engine (port 4000).*

## 🧪 Testing the Engine (Debug Endpoints)

While the engine is running, you can manually trigger alerts to test the UI:

- **Simulate a Crash**:
  ```bash
  curl -X POST http://localhost:4000/debug/simulate-crash?asset_id=bitcoin
  ```
- **Simulate a Spike**:
  ```bash
  curl -X POST http://localhost:4000/debug/simulate-spike?asset_id=bitcoin
  ```
*(Make sure the asset is in your watchlist to see the notification in the UI).*

## 🚀 Running in Production

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
   pm2 start npm --name "crypto-sentry-engine" -- run server
   ```

## 🔒 Security Notes
- **NEXTAUTH_SECRET**: Never reuse the development secret in production. Generate a strong, unique secret using `openssl rand -base64 32`.
- **HTTPS**: The application MUST be served over HTTPS in production.
- **Cookies**: When `NEXTAUTH_URL` uses `https://`, NextAuth automatically applies `Secure` and `HttpOnly` flags to authentication cookies.

## 📝 License
Private repository. All rights reserved.
