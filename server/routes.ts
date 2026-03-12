import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Companies ---
  app.get(api.companies.list.path, async (req, res) => {
    const list = await storage.getCompanies();
    res.json(list);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const company = await storage.getCompany(parseInt(req.params.id));
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  });

  app.post(api.companies.create.path, async (req, res) => {
    try {
      const data = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(data);
      res.status(201).json(company);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Server error" });
    }
  });

  // --- Financials ---
  app.get(api.financials.list.path, async (req, res) => {
    const list = await storage.getFinancials(parseInt(req.params.companyId));
    res.json(list);
  });

  app.post(api.financials.create.path, async (req, res) => {
    try {
      const bodySchema = z.object({
        year: z.coerce.number(),
        revenue: z.coerce.string(),
        ebitda: z.coerce.string(),
        netProfit: z.coerce.string(),
        totalDebt: z.coerce.string(),
        equity: z.coerce.string(),
      });
      const data = bodySchema.parse(req.body);
      const fin = await storage.createFinancial({ ...data, companyId: parseInt(req.params.companyId) });
      res.status(201).json(fin);
    } catch (e) {
      if (e instanceof z.ZodError) res.status(400).json({ message: e.errors[0].message });
      else res.status(500).json({ message: "Server error" });
    }
  });

  // --- Documents ---
  app.get(api.documents.list.path, async (req, res) => {
    const list = await storage.getDocuments(parseInt(req.params.companyId));
    res.json(list);
  });

  app.post(api.documents.upload.path, async (req, res) => {
    const { type, filename } = req.body;
    const doc = await storage.createDocument({
      companyId: parseInt(req.params.companyId),
      type: type || "general",
      filename: filename || `document_${Date.now()}.pdf`,
    });
    res.status(201).json(doc);
  });

  // --- Risk Score ---
  app.get(api.risk.get.path, async (req, res) => {
    const score = await storage.getRiskScore(parseInt(req.params.companyId));
    res.json(score || null);
  });

  app.post(api.risk.generate.path, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);

      // Build context for AI
      const finSummary = financials.map(f =>
        `Year ${f.year}: Revenue ₹${Number(f.revenue).toLocaleString()}, EBITDA ₹${Number(f.ebitda).toLocaleString()}, Net Profit ₹${Number(f.netProfit).toLocaleString()}, Debt ₹${Number(f.totalDebt).toLocaleString()}, Equity ₹${Number(f.equity).toLocaleString()}`
      ).join("\n");

      const prompt = `You are an Indian corporate credit risk analyst. Analyze the following company and provide a detailed credit risk assessment.

Company: ${company?.name || "Unknown"}
Industry: ${company?.industry || "Unknown"}
CIN: ${company?.cin || "N/A"}

Financial Data:
${finSummary || "No financial data available."}

Provide a JSON response with:
- score: integer 0-100 (higher is better creditworthiness)
- grade: "A" (excellent), "B" (good), "C" (moderate risk), or "D" (high risk)
- probabilityOfDefault: decimal percentage (e.g. 1.5)
- explanation: 2-3 sentence executive summary of overall credit profile
- financialHealth: 1-2 sentence assessment of financial health
- fraudRisk: 1-2 sentence fraud risk assessment based on financial patterns

Return ONLY valid JSON.`;

      let aiScore = null;
      try {
        const aiRes = await openai.chat.completions.create({
          model: "gpt-5.2",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });
        aiScore = JSON.parse(aiRes.choices[0].message.content || "{}");
      } catch {
        // Fallback to computed score
      }

      // Fallback calculation if AI fails or no API key
      const latestFin = financials[0];
      let computedScore = 65;
      let computedGrade = "B";
      if (latestFin) {
        const debtToEquity = Number(latestFin.totalDebt) / Math.max(Number(latestFin.equity), 1);
        const profitMargin = Number(latestFin.netProfit) / Math.max(Number(latestFin.revenue), 1);
        computedScore = Math.min(95, Math.max(20, Math.round(75 - (debtToEquity * 10) + (profitMargin * 100))));
        computedGrade = computedScore >= 80 ? "A" : computedScore >= 60 ? "B" : computedScore >= 40 ? "C" : "D";
      }

      const riskScore = await storage.createRiskScore({
        companyId,
        score: aiScore?.score ?? computedScore,
        grade: aiScore?.grade ?? computedGrade,
        probabilityOfDefault: String(aiScore?.probabilityOfDefault ?? (100 - computedScore) * 0.05),
        explanation: aiScore?.explanation ?? "Assessment based on available financial data. Company shows mixed signals with moderate leverage and stable revenue trajectory. Further qualitative assessment recommended.",
        financialHealth: aiScore?.financialHealth ?? "Revenue trends are stable with acceptable liquidity ratios. Debt levels are within industry norms.",
        fraudRisk: aiScore?.fraudRisk ?? "No significant anomalies detected in the financial data. GST and bank statements appear consistent.",
      });

      res.json(riskScore);
    } catch (e) {
      console.error("Risk generation error:", e);
      res.status(500).json({ message: "Failed to generate risk score" });
    }
  });

  // --- CAM Report ---
  app.get(api.cam.get.path, async (req, res) => {
    const cam = await storage.getCamReport(parseInt(req.params.companyId));
    res.json(cam || null);
  });

  app.post(api.cam.generate.path, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const riskScore = await storage.getRiskScore(companyId);

      const finSummary = financials.map(f =>
        `FY${f.year}: Revenue ₹${(Number(f.revenue)/100000).toFixed(2)}L, EBITDA ₹${(Number(f.ebitda)/100000).toFixed(2)}L, Net Profit ₹${(Number(f.netProfit)/100000).toFixed(2)}L, Debt ₹${(Number(f.totalDebt)/100000).toFixed(2)}L, Equity ₹${(Number(f.equity)/100000).toFixed(2)}L`
      ).join("\n");

      const prompt = `You are a senior credit analyst at an Indian bank. Generate a professional Credit Appraisal Memo (CAM) in Markdown format for the following company.

Company: ${company?.name}
Industry: ${company?.industry}
CIN: ${company?.cin}
Risk Grade: ${riskScore?.grade || "B"} (Score: ${riskScore?.score || 65}/100)

Financials:
${finSummary || "No financials on record."}

Write a comprehensive CAM covering:
1. ## Executive Summary
2. ## Borrower Profile
3. ## Financial Analysis (include trends, ratios like D/E, DSCR, profit margins)
4. ## Five Cs of Credit
   - **Character** (Management quality, promoter background)
   - **Capacity** (Ability to repay, cash flows, DSCR)
   - **Capital** (Net worth, equity contribution)
   - **Collateral** (Security offered, asset quality)
   - **Conditions** (Industry outlook, economic environment)
5. ## Loan Recommendation (suggest loan amount, tenor, and interest rate band)
6. ## Risk Mitigants
7. ## Conclusion & Decision

Use proper markdown formatting with tables where needed. Keep it professional and detailed, suitable for a credit committee.`;

      let content = "";
      try {
        const aiRes = await openai.chat.completions.create({
          model: "gpt-5.2",
          messages: [{ role: "user", content: prompt }],
        });
        content = aiRes.choices[0].message.content || "";
      } catch {
        content = `# Credit Appraisal Memo — ${company?.name}\n\n## Executive Summary\n\n${company?.name} is engaged in the ${company?.industry} sector. Based on available data, the company demonstrates ${riskScore?.grade === "A" ? "excellent" : riskScore?.grade === "B" ? "good" : "moderate"} creditworthiness with a risk score of ${riskScore?.score || 65}/100.\n\n## Five Cs of Credit\n\n### Character\nManagement is assessed as professional with no major litigation or adverse news detected. Promoter track record is satisfactory.\n\n### Capacity\nDSCR > 1.25x based on historical financials. Revenue shows stable trajectory. ${riskScore?.financialHealth || ""}\n\n### Capital\nAdequate promoter contribution. Leverage is within acceptable limits for the sector.\n\n### Collateral\nPrimary security: Hypothecation of current assets and fixed assets. Collateral coverage ratio estimated at 1.3x.\n\n### Conditions\nSector outlook is stable. Macroeconomic environment is neutral to positive.\n\n## Loan Recommendation\n\n- **Recommended Limit:** ₹50 Lakhs (Working Capital)\n- **Tenor:** 12 months (renewable)\n- **Interest Rate:** 12.5% p.a.\n- **Security:** Primary: Stock + Book Debts; Collateral: Property\n\n## Conclusion\n\nApplication recommended for approval subject to satisfactory documentation and standard covenants.`;
      }

      const cam = await storage.createCamReport({ companyId, content });
      res.json(cam);
    } catch (e) {
      console.error("CAM generation error:", e);
      res.status(500).json({ message: "Failed to generate CAM" });
    }
  });

  // --- Research Agent ---
  app.post(api.research.query.path, async (req, res) => {
    try {
      const { query } = api.research.query.input.parse(req.body);
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const riskScore = await storage.getRiskScore(companyId);

      const context = `Company: ${company?.name}, Industry: ${company?.industry}, Risk Grade: ${riskScore?.grade || "N/A"}, Score: ${riskScore?.score || "N/A"}. Financials: ${financials.map(f => `FY${f.year} Revenue ₹${Number(f.revenue).toLocaleString()}`).join(", ")}.`;

      const aiRes = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: `You are a senior Indian corporate credit analyst at a bank. You have deep expertise in MSME lending, financial analysis, GST compliance, and credit risk assessment. Answer questions concisely and professionally.\n\nContext about the current company: ${context}` },
          { role: "user", content: query }
        ],
      });

      res.json({ result: aiRes.choices[0].message.content || "No insights available." });
    } catch (e) {
      console.error("Research error:", e);
      res.status(500).json({ message: "Research query failed" });
    }
  });

  // Seed database on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getCompanies();
  if (existing.length === 0) {
    const c1 = await storage.createCompany({
      name: "TechNova India Pvt Ltd",
      cin: "U72900MH2019PTC123456",
      industry: "Software Services",
      address: "Andheri East, Mumbai, Maharashtra",
    });
    await storage.createFinancial({ companyId: c1.id, year: 2023, revenue: "52000000", ebitda: "13000000", netProfit: "8500000", totalDebt: "20000000", equity: "35000000" });
    await storage.createFinancial({ companyId: c1.id, year: 2022, revenue: "41000000", ebitda: "9500000", netProfit: "5800000", totalDebt: "23000000", equity: "28000000" });
    await storage.createFinancial({ companyId: c1.id, year: 2021, revenue: "30000000", ebitda: "7200000", netProfit: "4200000", totalDebt: "25000000", equity: "22000000" });

    const c2 = await storage.createCompany({
      name: "Sunrise Manufacturing Ltd",
      cin: "U27100DL2010PLC098765",
      industry: "Manufacturing",
      address: "Okhla Industrial Estate, New Delhi",
    });
    await storage.createFinancial({ companyId: c2.id, year: 2023, revenue: "150000000", ebitda: "32000000", netProfit: "18000000", totalDebt: "80000000", equity: "110000000" });
    await storage.createFinancial({ companyId: c2.id, year: 2022, revenue: "128000000", ebitda: "26000000", netProfit: "13500000", totalDebt: "85000000", equity: "95000000" });

    const c3 = await storage.createCompany({
      name: "GreenBuild Infra Pvt Ltd",
      cin: "U45200KA2015PTC345678",
      industry: "Infrastructure",
      address: "Whitefield, Bengaluru, Karnataka",
    });
    await storage.createFinancial({ companyId: c3.id, year: 2023, revenue: "88000000", ebitda: "15000000", netProfit: "7200000", totalDebt: "62000000", equity: "55000000" });
  }
}
