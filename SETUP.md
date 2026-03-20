# Technical Setup Guide - WealthNest 🛠

This guide will help you set up WealthNest locally for development or private hosting.

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **Authentication**: [NextAuth.js (Auth.js v5 Beta)](https://authjs.dev/)
- **AI Engine**: [Groq SDK](https://groq.com/) (Llama 3.3 70B)
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL Database (Local or Hosted)

### 2. Environment Setup
Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wealthnest"
AUTH_SECRET="your-secret-here"
GROQ_API_KEY="your-groq-key"
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```
