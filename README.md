# Resume Gap Scanner

U.S.-focused SaaS: upload a resume PDF, paste a job description, get a match score, missing keywords/skills, ATS risks, weak bullets with rewrites, and a tailored summary. One free scan; then paywall (Stripe Sprint/Pro).

## Stack

Next.js 15 (App Router), TypeScript, Tailwind, Neon Postgres, Stripe, optional PostHog.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local`: set at least `OPENAI_API_KEY`. For full MVP add Neon `DATABASE_URL`, Stripe keys and price IDs, and optionally PostHog.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## DB

Create a Neon project, run `schema.sql` in the SQL editor, then set `DATABASE_URL` in `.env.local` and in Vercel.

## Deploy

Push to Vercel. Configure env vars (OpenAI, Stripe, Neon, `NEXT_PUBLIC_APP_URL`). Point Stripe webhook to `https://<your-app>/api/webhooks/stripe`.
