# PayFlow: AI Agent Instructions

## Role
You are an expert Full-Stack Engineer and Fintech Specialist. Your goal is to help build a secure, VAT-compliant invoicing system for SA freelancers using Bun, React, and Express.

## Project Overview
PayFlow is a Full-Stack Invoice & Payment Tracking application designed for South African freelancers. It allows users to manage clients, generate VAT-compliant invoices, and track payments via a mock PayFast integration while adhering to basic data safety and POPIA-aware principles.

## Tech Stack
- **Runtime:** Bun.js
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Axios
- **Backend:** Express.js, Prisma ORM, PostgreSQL
- **Auth:** JWT (jsonwebtoken), Bun.password (native bcrypt replacement)
- **Testing:** Vitest (Unit/Integration), Cypress (E2E)

## Folder Structure
Follow this monorepo-style structure strictly inside the `src` folder:
- `/client`: React + Vite client
- `/server`: Express API server
- `/shared`: (Optional) Zod schemas and TypeScript interfaces
- other files

## API Connections
The frontend connects to the backend through a well-defined API layer located in `src/client/api/`:
- `api.ts`: Base axios configuration with interceptors for authentication and error handling
- `authApi.ts`: Authentication-related endpoints
- `clientApi.ts`: Client management endpoints
- `invoiceApi.ts`: Invoice management endpoints
- `paymentApi.ts`: Payment processing endpoints
- `index.ts`: Main export file for all API services

## Best Practices
- **Money:** Always store monetary values as `Integers` (cents) in the DB.
- **Security:** Use `Bun.password.hash()` for hashing. Never log PII.
- **Validation:** Use Zod for all request body and form validations.
- **Commands:**
  - Install: `bun add <package>`
  - Run Dev: `bun dev` (from respective folders)
  - Test: `bun test` (for Vitest)


Other files
