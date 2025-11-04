# Mentor Futuro - Community Subscription Platform

A full-stack subscription-based community platform built with Next.js, React, TypeScript, Prisma, and Stripe. Designed for the Mentor Futuro community to provide exclusive perks, events, courses, and networking opportunities for members.

## Features

### Core Features
- **User Authentication**: Secure sign-up and sign-in with NextAuth.js
- **Subscription Management**: Free and Premium tiers with Stripe integration
- **Events Calendar**: Browse and register for community events
- **Video Courses**: On-demand course library with enrollment tracking
- **Services Board**: Member-to-member professional services directory
- **User Dashboard**: Personalized dashboard with subscription status and activity

### Access Control
- Free users: Access to public events, limited courses, and basic services
- Premium users: Full access to all premium content, events, and exclusive perks

## Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe for subscription management
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payment processing)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd mf_app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mentor_futuro?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PREMIUM="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Set up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create a product and price for Premium subscription
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Add webhook secret to `.env`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mf_app/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Events CRUD
│   │   ├── courses/      # Courses CRUD
│   │   ├── services/     # Services CRUD
│   │   └── webhooks/     # Stripe webhooks
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # User dashboard
│   ├── events/           # Events pages
│   ├── courses/          # Courses pages
│   ├── services/         # Services pages
│   └── subscribe/        # Subscription page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── lib/                 # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # NextAuth config
│   ├── stripe.ts        # Stripe utilities
│   └── utils/           # Helper functions
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
└── types/               # TypeScript types
```

## Database Schema

### Main Models

- **User**: User accounts with authentication
- **Subscription**: Subscription management (FREE/PREMIUM)
- **Event**: Community events
- **EventRegistration**: User event registrations
- **Course**: Video courses
- **CourseModule**: Course content modules
- **CourseEnrollment**: User course enrollments
- **Service**: Member services offerings

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Subscriptions
- `POST /api/subscription/checkout` - Create Stripe checkout session
- `POST /api/subscription/portal` - Create billing portal session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (admin)
- `POST /api/events/[id]/register` - Register for event

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course (admin)
- `POST /api/courses/[id]/enroll` - Enroll in course

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Database Setup

For production, use a hosted PostgreSQL database:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

### Post-Deployment

1. Update `NEXTAUTH_URL` to your production URL
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Configure Stripe webhook for production
4. Run database migrations: `npx prisma migrate deploy`

## Development

### Adding New Features

1. Update Prisma schema in `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev`
3. Create API routes in `app/api/`
4. Create React components in `components/`
5. Create pages in `app/`

### Testing Stripe

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

Test webhooks locally with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | App URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_PRICE_ID_PREMIUM` | Premium subscription price ID | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

## License

MIT

## Support

For questions or issues, please contact the Mentor Futuro team.
