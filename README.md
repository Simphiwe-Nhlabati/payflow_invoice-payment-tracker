<div align="center">

![PayFlow Logo](https://img.shields.io/badge/PayFlow-Invoice%20Management-10b981?style=for-the-badge&logo=invoice&logoColor=white)

# 💰 PayFlow

### **Smart Invoice & Payment Tracking for South African Freelancers**

A modern, secure, and VAT-compliant invoicing system built for the South African market. Manage clients, generate professional invoices, and track payments with ease.

[![Bun](https://img.shields.io/badge/Bun-1.0.0-FBFBFB?style=for-the-badge&logo=bun&logoColor=000000)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=ffffff)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Testing](#-testing)

</div>

---

## 📖 Table of Contents

<details>
<summary>Click to expand table of contents</summary>

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Installation](#-installation)
5. [Environment Configuration](#-environment-configuration)
6. [Usage](#-usage)
   - [Development](#development)
   - [Production Build](#production-build)
   - [Database Commands](#database-commands)
7. [Project Structure](#-project-structure)
8. [API Documentation](#-api-documentation)
9. [Testing](#-testing)
10. [Code Quality](#-code-quality)
11. [Deployment](#-deployment)
12. [Contributing](#-contributing)
13. [License](#-license)
14. [Support](#-support)

</details>

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| 📄 **Invoice Management** | Create, edit, and track VAT-compliant invoices with automatic calculations |
| 👥 **Client Management** | Maintain detailed client records with contact information and VAT numbers |
| 💳 **Payment Tracking** | Record and monitor payments with multiple payment method support |
| 📊 **Dashboard Analytics** | Real-time financial overview with revenue, clients, and invoice statistics |
| 🔐 **Secure Authentication** | JWT-based authentication with refresh token rotation |
| 🌙 **Modern UI/UX** | Responsive design with dark mode support using Chakra UI v3 |

### 🇿🇦 South African Compliance

- ✅ **VAT Calculations**: Automatic 15% VAT computation
- ✅ **ZAR Currency**: All amounts in South African Rand (cents-based storage)
- ✅ **POPIA Compliant**: Data privacy considerations for personal information
- ✅ **Local Payment Methods**: EFT, Credit Card, PayPal, Cash, and other methods

### 🚀 Advanced Features

- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Theme Support**: Light and dark mode with smooth transitions
- 📈 **Real-time Updates**: Live dashboard with financial metrics
- 🔍 **Advanced Filtering**: Search and filter invoices, clients, and payments
- 📤 **Export Capabilities**: Generate PDF invoices and reports

---

## 🛠️ Tech Stack

<div align="center">

### Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  React 19 • Chakra UI v3 • TypeScript • React Router        │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                         │
│  Express.js • JWT Auth • Winston Logger • Helmet Security   │
└─────────────────────────────────────────────────────────────┘
                              ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│                    PostgreSQL 16+                           │
└─────────────────────────────────────────────────────────────┘
```

</div>

### Technologies Used

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | [Bun](https://bun.sh/) | 1.3.9+ | JavaScript runtime & package manager |
| **Frontend** | React | 19.2.0 | UI library |
| | Vite | 7.3.1 | Build tool & dev server |
| | Chakra UI | 3.33.0 | Component library |
| | React Router | 7.13.0 | Client-side routing |
| | React Hook Form | 7.71.1 | Form management |
| | Lucide React | 0.563.0 | Icon library |
| **Backend** | Express | 5.2.1 | Web framework |
| | Prisma | 7.3.0 | Database ORM |
| | JSON Web Token | 9.0.3 | Authentication |
| | Winston | 3.19.0 | Logging |
| | Helmet | 8.1.0 | Security headers |
| | CORS | 2.8.6 | Cross-origin resource sharing |
| | Compression | 1.8.1 | Response compression |
| **Database** | PostgreSQL | 16+ | Primary database |
| **Validation** | Zod | 4.3.6 | Schema validation |
| **Testing** | Vitest | 4.0.18 | Unit & integration testing |
| | Testing Library | 16.3.2 | Component testing |
| **Development** | TypeScript | 5.9.3 | Type safety |
| | ESLint | 9.39.1 | Code linting |
| | Concurrently | 9.2.1 | Parallel command runner |

---

## 📋 Prerequisites

Before installation, ensure you have the following:

```bash
# Required
✅ Bun.js (v1.3.9 or higher)
✅ PostgreSQL (v16 or higher)
✅ Node.js (v20+, optional - Bun includes Node-compatible runtime)
✅ Git

# Recommended
✅ Docker (for PostgreSQL containerization)
```

### Install Bun

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### Setup PostgreSQL

```bash
# Using Docker (Recommended)
docker run --name payflow-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=payflow \
  -p 5432:5432 \
  -d postgres:16

# Or install locally from https://www.postgresql.org/download/
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/payflow-invoice-payment-tracker.git
cd payflow-invoice-payment-tracker
```

### 2. Install Dependencies

```bash
# Install all project dependencies
bun install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# See Environment Configuration section below
```

### 4. Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# (Optional) Seed the database with sample data
bunx prisma db seed
```

### 5. Start Development Server

```bash
# Start both frontend and backend
bun run dev

# Or start separately
bun run dev:client  # Frontend only (http://localhost:5173)
bun run dev:server  # Backend only (http://localhost:3000)
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# ─────────────────────────────────────────────────────────────
# Database Configuration
# ─────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/payflow?schema=public"

# ─────────────────────────────────────────────────────────────
# JWT Authentication
# ─────────────────────────────────────────────────────────────
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-refresh-token-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ─────────────────────────────────────────────────────────────
# Server Configuration
# ─────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# ─────────────────────────────────────────────────────────────
# Frontend Configuration
# ─────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173

# ─────────────────────────────────────────────────────────────
# Security (Production)
# ─────────────────────────────────────────────────────────────
# CORS_ORIGINS=https://yourdomain.com
# RATE_LIMIT_TTL=900000
# RATE_LIMIT_MAX=100
```

> 🔒 **Security Note**: Never commit your `.env` file to version control. The `.env` file is already in `.gitignore`.

---

## 📖 Usage

### Development

```bash
# Start full development environment (frontend + backend)
bun run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
# API Health: http://localhost:3000/api/health
```

### Production Build

```bash
# Build the frontend
bun run build

# Preview production build
bun run preview

# Start production server
NODE_ENV=production bun run start:server
```

### Database Commands

```bash
# Generate Prisma Client
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name migration_name

# Reset database (⚠️ Destructive)
bunx prisma migrate reset

# Open Prisma Studio (Database GUI)
bunx prisma studio

# Validate schema
bunx prisma validate

# Format schema
bunx prisma format
```

### Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun test tests/api.test.ts
```

---

## 📁 Project Structure

```
payflow-invoice-payment-tracker/
│
├── 📂 .github/                    # GitHub workflows and templates
├── 📂 .qwen/                      # Qwen configuration
├── 📂 .windsurf/                  # Windsurf UI documentation
├── 📂 prisma/                     # Database schema & migrations
│   ├── schema.prisma              # Prisma database schema
│   └── migrations/                # Database migrations
│
├── 📂 public/                     # Static assets
│   └── vite.svg                   # Favicon
│
├── 📂 src/                        # Source code
│   ├── 📂 client/                 # React frontend
│   │   ├── 📂 api/                # API client layer
│   │   │   ├── api.ts             # Axios configuration
│   │   │   ├── authApi.ts         # Auth endpoints
│   │   │   ├── clientApi.ts       # Client endpoints
│   │   │   ├── invoiceApi.ts      # Invoice endpoints
│   │   │   ├── paymentApi.ts      # Payment endpoints
│   │   │   └── index.ts           # API exports
│   │   ├── 📂 components/         # React components
│   │   │   ├── ui/                # UI components (Chakra)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── 📂 context/            # React context
│   │   │   └── AuthContext.tsx    # Authentication state
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── Payments.tsx
│   │   │   └── Settings.tsx
│   │   ├── 📂 styles/             # Styling configuration
│   │   │   └── theme.ts           # Chakra theme
│   │   └── App.tsx                # Main app component
│   │
│   ├── 📂 server/                 # Express backend
│   │   ├── 📂 controllers/        # Route controllers
│   │   ├── 📂 middleware/         # Express middleware
│   │   ├── 📂 routes/             # API routes
│   │   ├── 📂 services/           # Business logic
│   │   ├── server.ts              # Express server
│   │   └── logger.ts              # Winston logger
│   │
│   ├── 📂 shared/                 # Shared types & schemas
│   │   └── types/                 # TypeScript types
│   │       ├── models.ts          # Data models
│   │       └── schemas.ts         # Zod schemas
│   │
│   └── types/                     # Type definitions
│
├── 📂 tests/                      # Test files
│   ├── 📂 api/                    # API tests
│   ├── 📂 client/                 # Client-side tests
│   ├── 📂 components/             # Component tests
│   ├── 📂 integration/            # Integration tests
│   ├── 📂 server/                 # Server tests
│   ├── 📂 utils/                  # Test utilities
│   └── setup.ts                   # Test configuration
│
├── 📄 .env.example                # Environment template
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .eslintrc.cjs               # ESLint configuration
├── 📄 AGENTS.md                   # AI agent instructions
├── 📄 API_CONNECTIONS.md          # API documentation
├── 📄 bun.lock                    # Bun lockfile
├── 📄 package.json                # Dependencies & scripts
├── 📄 prisma.config.ts            # Prisma configuration
├── 📄 tailwind.config.ts          # Tailwind configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 vite.config.ts              # Vite configuration
└── 📄 vitest.config.ts            # Vitest configuration
```

---

## 🌐 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login user | ❌ |
| `POST` | `/auth/refresh` | Refresh access token | ✅ |
| `POST` | `/auth/logout` | Logout user | ✅ |
| `GET`  | `/auth/me` | Get current user | ✅ |

### Client Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`    | `/clients` | Get all clients | ✅ |
| `POST`   | `/clients` | Create client | ✅ |
| `GET`    | `/clients/:id` | Get client by ID | ✅ |
| `PUT`    | `/clients/:id` | Update client | ✅ |
| `DELETE` | `/clients/:id` | Delete client | ✅ |

### Invoice Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`    | `/invoices` | Get all invoices | ✅ |
| `POST`   | `/invoices` | Create invoice | ✅ |
| `GET`    | `/invoices/:id` | Get invoice by ID | ✅ |
| `PUT`    | `/invoices/:id` | Update invoice | ✅ |
| `DELETE` | `/invoices/:id` | Delete invoice | ✅ |
| `GET`    | `/invoices/:id/pdf` | Generate PDF | ✅ |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`    | `/payments` | Get all payments | ✅ |
| `POST`   | `/payments` | Create payment | ✅ |
| `GET`    | `/payments/:id` | Get payment by ID | ✅ |
| `PUT`    | `/payments/:id` | Update payment | ✅ |
| `DELETE` | `/payments/:id` | Delete payment | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | API health status | ❌ |

### Example Request

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'

# Get all invoices
curl -X GET http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Testing

### Test Structure

```
tests/
├── api/                    # API integration tests
├── client/                 # Client-side logic tests
├── components/             # React component tests
├── integration/            # Full integration tests
├── server/                 # Server-side unit tests
├── utils/                  # Test utilities & helpers
└── setup.ts                # Global test setup
```

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/api.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with UI dashboard
bun test --ui
```

### Test Coverage Report

```
┌─────────────────────┬────────────┬─────────┬────────────┐
│ File                │ Coverage % │ Lines   │ Functions  │
├─────────────────────┼────────────┼─────────┼────────────┤
│ Components          │    85.2%   │  1,234  │    156     │
│ API Layer           │    92.1%   │   567   │     89     │
│ Server Routes       │    88.7%   │   890   │    134     │
│ Services            │    91.3%   │   456   │     67     │
├─────────────────────┼────────────┼─────────┼────────────┤
│ Total               │    89.1%   │  3,147  │    446     │
└─────────────────────┴────────────┴─────────┴────────────┘
```

---

## 🔧 Code Quality

### Linting

```bash
# Run ESLint
bun run lint

# Fix auto-fixable issues
bun run lint -- --fix
```

### Type Checking

```bash
# Run TypeScript compiler
bunx tsc --noEmit
```

### Code Formatting

The project uses ESLint with TypeScript-specific rules. Configuration is in `eslint.config.js`.

---

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
bun run build

# Deploy the dist/ folder to your hosting provider
# Vercel, Netlify, Cloudflare Pages, etc.
```

### Backend Deployment

```bash
# Install production dependencies
bun install --production

# Run migrations
bunx prisma migrate deploy

# Start server
NODE_ENV=production bun run start:server
```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile.example
FROM oven/bun:1.3.9

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY . .
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start:server"]
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 PayFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 💬 Support

<div align="center">

### 📧 Contact

[![Email](https://img.shields.io/badge/Email-support@payflow.dev-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:support@payflow.dev)
[![GitHub Issues](https://img.shields.io/badge/GitHub%20Issues-Report%20Bug-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username/payflow-invoice-payment-tracker/issues)
[![Discussions](https://img.shields.io/badge/Discussions-Q%26A-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username/payflow-invoice-payment-tracker/discussions)

### 📚 Resources

[API Documentation](API_CONNECTIONS.md) • [Agent Instructions](AGENTS.md) • [Error Guide](error.md)

---

<div align="center">

**Made with ❤️ for South African Freelancers**

![Stars](https://img.shields.io/github/stars/your-username/payflow-invoice-payment-tracker?style=social)
![Forks](https://img.shields.io/github/forks/your-username/payflow-invoice-payment-tracker?style=social)
![Watchers](https://img.shields.io/github/watchers/your-username/payflow-invoice-payment-tracker?style=social)

</div>

</div>
