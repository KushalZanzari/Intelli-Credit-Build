# IntelliCredit — AI-Powered Corporate Credit Decisioning Engine

> A production-grade prototype for automated credit risk assessment, document intelligence, and CAM generation built for Indian banks and NBFCs.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features (3 Pillars)](#key-features)
3. [Quick Start — Example Walkthrough](#quick-start)
4. [Demo Companies](#demo-companies)
5. [Pillar 1: Data Ingestor Guide](#pillar-1-data-ingestor)
6. [Pillar 2: Research Agent Guide](#pillar-2-research-agent)
7. [Pillar 3: Recommendation Engine Guide](#pillar-3-recommendation-engine)
8. [Tech Stack](#tech-stack)
9. [Project Structure](#project-structure)

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

## Quick Start

### Step 1 — Open a Demo Company

The app comes pre-loaded with 3 demo companies:

1. **TechNova Solutions Pvt Ltd** — IT Services company, Grade B borrower
2. **Sunrise Manufacturing Ltd** — Auto components manufacturer with positive qualitative notes
3. **GreenBuild Infra Pvt Ltd** — Construction company with pre-loaded risk notes (GST notice + site delays)

Navigate to **Companies → Click any company → Explore the 5 tabs**

---

## Demo Companies

### Company 1: TechNova Solutions Pvt Ltd (Clean Profile)

```
CIN: U72900MH2019PTC123456
Industry: Software Services / IT
Promoters: Rajesh Mehta (CEO), Priya Sharma (CFO)
FY2024 Revenue: ₹6.2 Crore | EBITDA: ₹1.65 Cr | Net Profit: ₹1.12 Cr
Debt/Equity: 0.40x (low leverage)
Expected Grade: A (Score ~78-85)
```

### Company 2: Sunrise Manufacturing Ltd (Strong with Positive QN)

```
CIN: U27100DL2010PLC098765  
Industry: Auto Components Manufacturing
Promoters: Vikram Kapoor (MD, ex-Maruti Udyog), Sunita Kapoor (Director)
FY2024 Revenue: ₹17.5 Crore | EBITDA: ₹3.8 Cr | Net Profit: ₹2.2 Cr
Pre-loaded Notes:
  ✅ "Factory operating at 85% capacity — expansion underway" (+5 pts)
  ✅ "Promoter has strong industry connections; ex-Maruti Udyog executive" (+8 pts)
Expected Grade: A (Score ~83-90)
```

### Company 3: GreenBuild Infra Pvt Ltd (High Risk — Pre-loaded Red Flags)

```
CIN: U45200KA2015PTC345678
Industry: Infrastructure & Construction
Promoters: Arun Nair (Founder), Deepika Nair (Director)
FY2024 Revenue: ₹9.5 Crore | EBITDA: ₹1.6 Cr | Net Profit: ₹0.75 Cr
Debt/Equity: 1.24x (high leverage for sector)
Pre-loaded Notes:
  ❌ "GST notice received for FY2022 — ₹85L demand pending at CESTAT" (-15 pts)
  ❌ "2 of 4 ongoing projects delayed 6+ months — contractor issues" (-10 pts)
Expected Grade: D (Score ~35-45) — REJECTION scenario
```

---

## Pillar 1: Data Ingestor

### How to Upload Documents

1. Go to **Company Details → Documents tab**
2. Select document type from the dropdown:
   - `Bank Statement` — HDFC/SBI current account statements
   - `GST Returns` — GSTR-1, GSTR-3B filings
   - `ITR` — Income Tax Return
   - `Audited Financials` — CA-certified balance sheet
   - `Annual Report (PDF)` — Director's report, notes to accounts
   - `Sanction Letter` — Letters from existing banks
   - `Legal Notice` — Court orders, demand notices
3. Click **Upload** and select any PDF or file
4. AI automatically parses the document and shows extracted data (click ↓ to expand)

### How to Run GST Cross-Analysis

1. Go to **Documents → GST Analysis tab**
2. Click **Run GST Analysis**
3. Review:
   - **Circular Trading Risk** — Checks for GSTIN party round-tripping
   - **Revenue Inflation Risk** — Compares GST turnover vs bank credits
   - **Top Party Concentration** — Flags if top 3 parties > 60% of transactions
   - **Reconciliation Table** — GST declared vs bank credit variance

### Example — What GreenBuild's GST Analysis Looks Like

```
GST Declared Revenue: ₹9.2 Crore
Bank Credit Turnover: ₹8.7 Crore
Variance: 5.4% (Low-Medium Risk)
Circular Trading Risk: MEDIUM — 3 related-party indicators found
Revenue Inflation Risk: LOW
Top Party Concentration: 62% (HIGH — single large buyer concentration)
```

---

## Pillar 2: Research Agent

### Adding Qualitative Notes (Credit Officer Portal)

1. Go to **Company Details → Risk Analysis tab**
2. Scroll to **Credit Officer Qualitative Notes** section
3. Type an observation in the text area
4. Select a category (Management / Operations / Market / Legal / General)
5. Click **Add Note** — AI immediately calculates the score impact

#### Example Notes and Their AI-Calculated Impacts

```
Note: "Factory visited — operating at 40% capacity due to raw material shortage"
Category: Operations
AI Impact: -12 points

Note: "Promoter has 2 pending NPA accounts at UCO Bank (FY2018, FY2020)"  
Category: Legal
AI Impact: -20 points

Note: "Company received ₹8 Crore government contract (CPWD project)"
Category: Market
AI Impact: +10 points

Note: "Management team upgraded — hired ex-ICICI executive as CFO"
Category: Management  
AI Impact: +8 points

Note: "Sector facing RBI tightening on infra lending limits"
Category: Market
AI Impact: -7 points
```

### Running Secondary Web Research

1. Go to **Company Details → Research tab → Web Research**
2. Click **Run Web Research**
3. AI generates a structured report covering:
   - **Promoter Background** — Career history, litigation search, adverse news
   - **Sector Headwinds** — RBI regulations, market trends, policy changes
   - **Recent News** — Company-specific news with positive/neutral/negative sentiment
   - **Credit Bureau Signals** — Existing loan patterns, repayment indicators

### Using the AI Chat Analyst

1. Go to **Research → AI Chat tab**
2. Ask any credit-related question. Examples:

```
"What is the DSCR for TechNova based on current financials?"
"Are there any RBI guidelines I should check for auto component financing?"
"What are the top 3 red flags for GreenBuild?"
"Calculate the working capital gap for Sunrise Manufacturing"
"How does GreenBuild's D/E ratio compare to industry norms?"
"Summarize all risk factors for this company in 5 bullet points"
```

---

## Pillar 3: Recommendation Engine

### Generating a Risk Score

1. Go to **Company Details → Risk Analysis tab**
2. Optionally add qualitative notes first (they will be factored in)
3. Click **Generate Risk Score**
4. The score shows:
   - **Base Score** — Pure financial analysis (0-100)
   - **Adjusted Score** — After qualitative note impacts
   - **Grade** — A/B/C/D with color coding
   - **PD %** — 12-month probability of default
   - **Decision Rationale** — Why this score was given

#### Score-to-Grade Mapping

```
Score 80-100 → Grade A (Low Risk)    — Approve at best terms
Score 60-79  → Grade B (Moderate)    — Approve at standard terms
Score 40-59  → Grade C (Elevated)    — Conditional approval, enhanced monitoring
Score 0-39   → Grade D (High Risk)   — Recommend rejection
```

### Generating a CAM Report

1. First generate a Risk Score (optional but recommended)
2. Add qualitative notes and run web research for a richer CAM
3. Go to **CAM Report tab → Click Auto-Draft CAM**
4. The generated CAM includes:

```
1. Executive Summary
2. Borrower Profile  
3. Financial Analysis (3-year trend table with ratios)
4. Document & GST Verification (circular trading assessment)
5. Five Cs of Credit
   - Character (promoter background, litigation)
   - Capacity (DSCR, cash flows)
   - Capital (net worth, equity)
   - Collateral (security structure)
   - Conditions (sector outlook, RBI environment)
6. Qualitative Risk Factors (field notes with score impacts)
7. Risk Assessment Summary
8. Loan Recommendation (specific amount, rate, tenor, security)
9. Decision & Rationale (APPROVE / REJECT / CONDITIONAL)
10. Conditions Precedent
```

### Example — Loan Recommendation Output (Sunrise Manufacturing)

```
Proposed Limit:    ₹4.37 Crores (Working Capital + Term Loan)
Facility Type:     CC Limit + Term Loan
Tenor:            60 months
Interest Rate:     10.5% p.a. (Grade A pricing)
Primary Security:  Hypothecation of stocks and book debts (covering ₹3.5 Cr)
Collateral:       Equitable mortgage, Market value ₹6.5 Cr
Coverage Ratio:    1.49x

DECISION: ✅ RECOMMENDED FOR APPROVAL
Rationale: Strong 3-year revenue CAGR of 16.8%, D/E ratio of 0.60x well within 
limits. Promoter track record is exemplary. Qualitative adjustments of +13 points 
reflect field survey findings and management quality. No adverse GST or legal flags.
```

### Example — Rejection Scenario (GreenBuild Infra)

```
Proposed Limit:    ₹2.37 Crores
Interest Rate:     15.0% p.a. (Grade D pricing)

DECISION: ❌ RECOMMENDED FOR REJECTION
Rationale: Final score of 38/100 (Grade D) primarily driven by pending ₹85L GST 
demand notice (CESTAT adjudication), 2 major project delays indicating operational 
weakness, and high D/E ratio of 1.24x vs sector norm of 0.8x. Despite revenue 
growth of 8.3%, the combination of legal risk and operational issues presents 
unacceptable credit risk at this time. Recommend re-evaluation post GST resolution 
and project completion.
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript, Vite, TailwindCSS |
| **UI Components** | shadcn/ui, Framer Motion, Recharts |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (Neon) via Drizzle ORM |
| **AI Engine** | OpenAI GPT-4.1 (via Replit AI Integration) |
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
│   │   ├── use-qualitative-notes.ts  # NEW
│   │   ├── use-web-research.ts       # NEW
│   │   ├── use-gst-analysis.ts       # NEW
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

---

*Built for the IntelliCredit Hackathon — AI-Powered Corporate Credit Decisioning Engine*
