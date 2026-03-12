# IntelliCredit — AI-Powered Corporate Credit Decisioning Engine

> A production-grade prototype for automated credit risk assessment, document intelligence, and CAM generation built for Indian banks and NBFCs.

---


## Overview

IntelliCredit automates the most time-consuming parts of corporate credit underwriting:

- **Parsing** PDF annual reports, bank statements, GST returns, legal notices, and sanction letters
- **Cross-verifying** GST data against bank statements to detect circular trading and revenue inflation
- **Researching** promoter backgrounds, litigation history, sector headwinds, and news automatically
- **Capturing** credit officer qualitative observations that dynamically adjust the risk score
- **Generating** professional CAMs with explainable loan recommendations and decision rationale

---

## Key Features

### Pillar 1 — The Data Ingestor

| Feature | Description |
|---------|-------------|
| **Multi-format Upload** | Upload PDF annual reports, bank statements, GST returns, ITR, sanction letters, legal notices |
| **AI Document Extraction** | Automatically extracts financial commitments, risk flags, key metrics from each document |
| **GST × Bank Cross-Analysis** | Detects circular trading patterns, revenue inflation, suspicious party concentrations |
| **Risk Flags** | Each document is scanned for red flags displayed inline |

### Pillar 2 — The Research Agent

| Feature | Description |
|---------|-------------|
| **Web Research Agent** | Crawls for promoter news, litigation history, sector regulations (RBI/SEBI), credit bureau signals |
| **Qualitative Notes Portal** | Credit officers add field observations; AI auto-calculates score impact (-25 to +15 pts) |
| **AI Chat Analyst** | Ask natural language questions about financials, risk, or regulations |
| **Score Adjustment** | Qualitative notes transparently adjust the final credit score with explanation |

### Pillar 3 — The Recommendation Engine

| Feature | Description |
|---------|-------------|
| **CAM Generator** | Full Credit Appraisal Memo with Five Cs of Credit, financial tables, decision logic |
| **Loan Recommendation** | Specific loan amount, interest rate (risk-tiered), tenor, security structure |
| **Explainable Decisions** | Approval/rejection with explicit reasons (e.g., "Rejected due to high litigation risk despite strong GST flows") |
| **Decision Badge** | Visual approve/conditional/reject indicator at the top of every CAM |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript, Vite, TailwindCSS |
| **UI Components** | shadcn/ui, Framer Motion, Recharts |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (Neon) via Drizzle ORM |
| **AI Engine** | Google Gemini 2.5 Flash |
| **File Uploads** | Multer (multi-format: PDF, CSV, XLSX) |
| **State Management** | TanStack Query v5 |
| **Routing** | Wouter |

---

## Project Structure

```
├── client/src/
│   ├── components/companies/tabs/
│   │   ├── documents-tab.tsx    # Pillar 1: Upload + GST Analysis
│   │   ├── financials-tab.tsx   # Financial data entry + charts
│   │   ├── risk-tab.tsx         # Pillar 2+3: Risk Score + Qualitative Notes
│   │   ├── cam-tab.tsx          # Pillar 3: CAM Report with decision
│   │   └── research-tab.tsx     # Pillar 2: Web Research + AI Chat
│   ├── hooks/
│   │   ├── use-companies.ts
│   │   ├── use-documents.ts
│   │   ├── use-risk.ts
│   │   ├── use-cam.ts
│   │   ├── use-qualitative-notes.ts  
│   │   ├── use-web-research.ts       
│   │   ├── use-gst-analysis.ts       
│   │   └── use-research.ts
│   └── pages/
│       ├── dashboard.tsx
│       └── companies/
├── server/
│   ├── index.ts          # Express server
│   ├── routes.ts         # All API endpoints (3 pillars)
│   └── storage.ts        # Database CRUD layer
└── shared/
    ├── schema.ts          # Drizzle ORM schema (7 tables)
    └── routes.ts          # API contract
```

### Database Schema

```
companies          — Company profiles with promoter info
financials         — Multi-year financial data
riskScores         — AI-generated risk assessments with adjustments
camReports         — CAM content + loan recommendation + decision
documents          — Uploaded files + AI-extracted data + risk flags
qualitativeNotes   — Credit officer observations + AI score impacts (NEW)
webResearch        — Secondary research findings (NEW)
gstAnalysis        — GST × Bank cross-verification results (NEW)
```

---

## Usage Flow (Recommended Order)

```
1. Add Company (name, CIN, industry, promoters)
      ↓
2. Enter Financials (3 years of data)
      ↓
3. Upload Documents (bank, GST, ITR, annual report)
      ↓
4. Run GST Analysis (Documents → GST Analysis tab)
      ↓
5. Add Qualitative Notes (Risk tab → field observations)
      ↓
6. Run Web Research (Research → Web Research tab)
      ↓
7. Generate Risk Score (Risk tab → adjusts for qualitative notes)
      ↓
8. Generate CAM (CAM tab → full 10-section memo + decision)
```


