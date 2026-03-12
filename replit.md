# IntelliCredit — AI-Powered Corporate Credit Decisioning Engine

## Overview
A full-stack credit risk platform for Indian banks and NBFCs. Automates document parsing, GST fraud detection, qualitative note integration, web research, and CAM report generation.

## Architecture
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion, Recharts, wouter, TanStack Query v5
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **AI**: OpenAI GPT-4.1 (Replit AI Integration — no API key needed)
- **File Uploads**: Multer

## Features (3 Pillars)

### Pillar 1 — Data Ingestor
- Multi-format document upload (PDF, CSV, XLSX)
- AI extraction of financial commitments and risk flags from each document
- GST × Bank Statement cross-analysis for circular trading / revenue inflation detection

### Pillar 2 — Research Agent
- Web research agent: promoter background, litigation, sector headwinds, news
- Qualitative notes portal: credit officer observations with AI score impact calculation
- AI chat analyst: natural language queries about the credit profile

### Pillar 3 — Recommendation Engine
- Risk scoring with base (financial) + adjusted (qualitative) scores
- CAM generator: Full 10-section Credit Appraisal Memo with Five Cs of Credit
- Transparent decision logic: approve/reject/conditional with explicit rationale
- Loan recommendation: amount, interest rate, tenor, security structure

## Database Schema (8 tables)
- `companies` — Company profiles with promoter info
- `financials` — Multi-year financial metrics
- `riskScores` — AI risk assessments (base + adjusted scores, PD, decision rationale)
- `camReports` — CAM content + loan recommendation + decision
- `documents` — Uploaded files + AI-extracted data + risk flags
- `qualitativeNotes` — Credit officer notes + AI-computed score impacts
- `webResearch` — Secondary research findings and risk signals
- `gstAnalysis` — GST × Bank cross-verification results

## Running
- Workflow: `Start application` runs `npm run dev` (Express + Vite on port 5000)
- Database: PostgreSQL via DATABASE_URL env var
- AI: Uses AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL

## Key Files
- `server/routes.ts` — All API endpoints (3 pillars)
- `server/storage.ts` — Database CRUD operations
- `shared/schema.ts` — Drizzle ORM schema
- `client/src/components/companies/tabs/` — All 5 company detail tabs
- `client/src/hooks/` — TanStack Query hooks for all data fetching
