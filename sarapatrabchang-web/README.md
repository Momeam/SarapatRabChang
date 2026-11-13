This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## API configuration

The API stores users, sessions, provider profiles, service listings, packages, and bookings in Neon PostgreSQL. Copy `sarapatrabchang-api/.env.example` to `sarapatrabchang-api/.env` and set `DATABASE_URL` to your Neon connection string. Copy this project's `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the API URL (default: `http://127.0.0.1:4000`). Set up the database schema and initial service categories with `npm run db:setup` from the API directory, then start the API before opening the web app. The home page searches active listings from Neon; signed-in providers can publish a listing from `/provider/services/new`, and signed-in users can create and track bookings at `/tracking`. Booking status changes do not process or transfer money; a payment gateway is not configured.

The profile page at `/profile` reads the signed-in user's account, contact details, interests, and work reviews from Neon. Profile edits are saved through the authenticated API; email changes are not supported from this page.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
