# WealthNest - Premium Investment & Expense Tracker 🚀

WealthNest is a state-of-the-art, Proressive Web App (PWA) designed to give you a 360-degree view of your financial health. From real-time stock tracking to automated mutual fund syncing via CAS statements, WealthNest combines powerful analytics with a premium, glassmorphic UI.

![WealthNest Dashboard](https://images.unsplash.com/photo-1611974714158-f89914041763?auto=format&fit=crop&q=80&w=1200&h=600) *Sample Dashboard Interface Concept*

---

## ✨ Key Features

### 📈 Investment Tracking
- **Real-Time Stocks**: Track Indian and Global stocks with live price updates scraped from Google Finance.
- **Mutual Funds (AMFI)**: Integrated with official AMFI data for accurate NAV tracking of thousands of funds.
- **Fixed Deposits (FD)**: Monitor maturity dates and interest accruals in one place.
- **Real-Time P&L**: Instant calculation of absolute returns and net worth dynamics.

### 📄 Smart Data Import (CAS Parser)
- **Automated Sync**: Upload your CAS (Consolidated Account Statement) PDF or Excel from CAMS/KFintech.
- **Automatic Matching**: The system intelligently parses transactions and matches them to AMFI codes for zero-manual-entry tracking.

### 💰 Expense & Income Management
- **Daily Ledgers**: Log expenses and incomes with ease.
- **Categorization**: Visual breakdowns of spending habits (Food, Travel, Bills, etc.).
- **Natural Language Parsing**: Just type "Spent 500 on lunch" and let our AI handle the rest.

### 🤖 AI Insights (Powered by Groq)
- **Financial Advisor**: Get personalized money-saving hacks and investment strategies based on your actual spending patterns.
- **Transaction Extraction**: Advanced LLM (Llama 3.3) extracts structured data from messy text inputs.

### 📱 Premium PWA Experience
- **Offline Mode**: Access your data even without an active internet connection.
- **Installable**: Install WealthNest on your iOS, Android, or Desktop for a native app feel.
- **Push Notifications**: Receive alerts for investment updates and budget milestones.

---

## 🛠 Tech Stack

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

---

## 🛡 Security
- **OTP Verification**: Secure login via email OTP.
- **Security PIN**: Optional secondary PIN for sensitive financial data access.
- **Data Privacy**: Your financial logs are encrypted and never shared.

---

## 📄 License
This project is private and intended for personal wealth tracking.

---
Built with ❤️ by [Vagish](https://github.com/vagishkora)
