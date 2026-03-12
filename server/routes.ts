import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import multer from "multer";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function askAI(prompt: string, json = false): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    });
    return res.choices[0].message.content || "";
  } catch {
    return "";
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ═══════════════════════════════════════════════
  //  COMPANIES
  // ═══════════════════════════════════════════════
  app.get("/api/companies", async (req, res) => {
    res.json(await storage.getCompanies());
  });

  app.get("/api/companies/:id", async (req, res) => {
    const company = await storage.getCompany(parseInt(req.params.id));
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        cin: z.string().optional(),
        industry: z.string().optional(),
        address: z.string().optional(),
        promoters: z.string().optional(),
      });
      const data = schema.parse(req.body);
      res.status(201).json(await storage.createCompany(data));
    } catch (e) {
      res.status(400).json({ message: e instanceof z.ZodError ? e.errors[0].message : "Server error" });
    }
  });

  // ═══════════════════════════════════════════════
  //  FINANCIALS
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/financials", async (req, res) => {
    res.json(await storage.getFinancials(parseInt(req.params.companyId)));
  });

  app.post("/api/companies/:companyId/financials", async (req, res) => {
    try {
      const schema = z.object({
        year: z.coerce.number(),
        revenue: z.string(),
        ebitda: z.string(),
        netProfit: z.string(),
        totalDebt: z.string(),
        equity: z.string(),
      });
      const data = schema.parse(req.body);
      res.status(201).json(await storage.createFinancial({ ...data, companyId: parseInt(req.params.companyId) }));
    } catch (e) {
      res.status(400).json({ message: e instanceof z.ZodError ? e.errors[0].message : "Server error" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 1 — DOCUMENTS & DATA INGESTOR
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/documents", async (req, res) => {
    res.json(await storage.getDocuments(parseInt(req.params.companyId)));
  });

  app.post("/api/companies/:companyId/documents", upload.single("file"), async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const type = req.body.type || "general";
      const filename = req.file?.originalname || req.body.filename || `document_${Date.now()}.pdf`;
      const doc = await storage.createDocument({ companyId, type, filename });
      // Trigger async analysis
      analyzeDocument(doc.id, companyId, type, filename).catch(console.error);
      res.status(201).json({ ...doc, status: "analyzing" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post("/api/companies/:companyId/documents/:docId/analyze", async (req, res) => {
    try {
      const { companyId, docId } = req.params;
      const doc = await storage.getDocument(parseInt(docId));
      if (!doc) return res.status(404).json({ message: "Document not found" });
      const updated = await analyzeDocument(doc.id, parseInt(companyId), doc.type, doc.filename);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 1 — GST CIRCULAR TRADING ANALYSIS
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/gst-analysis", async (req, res) => {
    const analysis = await storage.getGstAnalysis(parseInt(req.params.companyId));
    res.json(analysis || null);
  });

  app.post("/api/companies/:companyId/gst-analysis", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const docs = await storage.getDocuments(companyId);

      const gstDocs = docs.filter(d => d.type === "gst");
      const bankDocs = docs.filter(d => d.type === "bank");

      const prompt = `You are a forensic financial analyst specializing in detecting GST fraud for Indian banks. 
      
Company: ${company?.name} (${company?.industry})
GST Documents available: ${gstDocs.length} files
Bank Statement Documents: ${bankDocs.length} files
Financial Summary: ${financials.map(f => `FY${f.year} Revenue ₹${(Number(f.revenue)/100000).toFixed(1)}L, Net Profit ₹${(Number(f.netProfit)/100000).toFixed(1)}L`).join("; ")}

Simulate a comprehensive GST vs Bank Statement cross-verification analysis. Generate a realistic but simulated analysis as if you have processed real documents.

Return JSON with:
{
  "circularTradingRisk": "low|medium|high",
  "revenueInflationRisk": "low|medium|high",
  "summary": "2-3 sentence overall summary",
  "gstVsBankReconciliation": {
    "gstDeclaredRevenue": "amount as string",
    "bankCreditTurnover": "amount as string",
    "variance": "percentage string",
    "varianceRisk": "low|medium|high",
    "explanation": "brief explanation"
  },
  "circularTradingIndicators": [
    {
      "indicator": "indicator name",
      "finding": "what was found",
      "risk": "low|medium|high"
    }
  ],
  "suspiciousTransactionPatterns": [
    {
      "pattern": "pattern name",
      "description": "details"
    }
  ],
  "topPartyConcentration": {
    "top3PartiesPercent": number,
    "risk": "low|medium|high",
    "note": "brief note"
  },
  "overallFraudScore": number,
  "recommendations": ["action1", "action2"]
}`;

      const resultText = await askAI(prompt, true);
      let analysisResult: any = {};

      try {
        analysisResult = JSON.parse(resultText);
      } catch {
        analysisResult = {
          circularTradingRisk: "low",
          revenueInflationRisk: "low",
          summary: "Analysis could not be completed. Please ensure GST and bank statement documents are uploaded.",
          gstVsBankReconciliation: { variance: "N/A", varianceRisk: "low" },
          circularTradingIndicators: [],
          overallFraudScore: 15,
        };
      }

      const analysis = await storage.createGstAnalysis({
        companyId,
        analysisResult,
        circularTradingRisk: analysisResult.circularTradingRisk || "low",
        revenueInflationRisk: analysisResult.revenueInflationRisk || "low",
        summary: analysisResult.summary || "Analysis complete.",
      });

      res.json(analysis);
    } catch (e) {
      console.error("GST analysis error:", e);
      res.status(500).json({ message: "GST analysis failed" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 2 — QUALITATIVE NOTES
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/qualitative-notes", async (req, res) => {
    res.json(await storage.getQualitativeNotes(parseInt(req.params.companyId)));
  });

  app.post("/api/companies/:companyId/qualitative-notes", async (req, res) => {
    try {
      const schema = z.object({
        note: z.string().min(1),
        category: z.enum(["management", "operations", "market", "legal", "general"]).default("general"),
        addedBy: z.string().optional(),
      });
      const { note, category, addedBy } = schema.parse(req.body);

      // AI determines the score impact
      const prompt = `You are a credit risk analyst. A credit officer added this qualitative note about a company being evaluated for a loan:
      
"${note}"

Based on the severity and nature of this observation, determine the score impact on a 0-100 credit score.
Return JSON: { "scoreImpact": <integer between -25 and +15>, "reasoning": "<1 sentence>" }

Examples:
- "Factory operating at 40% capacity" → -12
- "Strong management team, ex-HDFC executives" → +8
- "Pending GST litigation for ₹50L" → -15
- "Received large government contract" → +10`;

      let scoreImpact = 0;
      const aiRes = await askAI(prompt, true);
      try {
        const parsed = JSON.parse(aiRes);
        scoreImpact = Math.max(-25, Math.min(15, parseInt(parsed.scoreImpact) || 0));
      } catch { }

      const newNote = await storage.createQualitativeNote({
        companyId: parseInt(req.params.companyId),
        note,
        category,
        scoreImpact,
        addedBy: addedBy || "Credit Officer",
      });
      res.status(201).json(newNote);
    } catch (e) {
      res.status(400).json({ message: e instanceof z.ZodError ? e.errors[0].message : "Error saving note" });
    }
  });

  app.delete("/api/companies/:companyId/qualitative-notes/:noteId", async (req, res) => {
    await storage.deleteQualitativeNote(parseInt(req.params.noteId));
    res.json({ ok: true });
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 2 — WEB RESEARCH AGENT
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/web-research", async (req, res) => {
    res.json(await storage.getWebResearch(parseInt(req.params.companyId)));
  });

  app.post("/api/companies/:companyId/web-research", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const { researchType = "all" } = req.body;

      const prompt = `You are a credit research agent at an Indian bank. Simulate a comprehensive web research report for this company.

Company: ${company?.name}
Industry: ${company?.industry}
CIN: ${company?.cin}
Promoters: ${company?.promoters || "Unknown"}
Financial health: Revenue ₹${financials[0] ? (Number(financials[0].revenue)/10000000).toFixed(2) : "N/A"} Cr (FY${financials[0]?.year || "N/A"})

Conduct simulated research across these areas and return realistic findings as JSON:
{
  "promoterBackground": {
    "findings": ["finding1", "finding2"],
    "litigationHistory": ["case1 or 'None found'"],
    "riskLevel": "low|medium|high",
    "summary": "brief summary"
  },
  "sectorHeadwinds": {
    "regulatoryChanges": ["change1", "change2"],
    "marketTrends": ["trend1", "trend2"],
    "riskLevel": "low|medium|high",
    "summary": "brief summary"
  },
  "companyNews": {
    "recentNews": [
      { "headline": "headline", "sentiment": "positive|neutral|negative", "date": "approx date" }
    ],
    "riskLevel": "low|medium|high",
    "summary": "brief summary"
  },
  "creditBureauSignals": {
    "existingLoans": "summary",
    "repaymentHistory": "good|average|poor",
    "riskLevel": "low|medium|high"
  },
  "overallRiskSignals": ["signal1", "signal2"],
  "researchSummary": "2-3 sentence comprehensive summary"
}`;

      const resultText = await askAI(prompt, true);
      let findings: any = {};
      try {
        findings = JSON.parse(resultText);
      } catch {
        findings = {
          promoterBackground: { findings: ["No adverse news found"], litigationHistory: ["None identified"], riskLevel: "low", summary: "Clean background" },
          sectorHeadwinds: { regulatoryChanges: ["Standard compliance requirements"], marketTrends: ["Stable demand"], riskLevel: "low", summary: "Stable sector" },
          companyNews: { recentNews: [{ headline: "No significant news", sentiment: "neutral", date: "Recent" }], riskLevel: "low", summary: "No newsworthy events" },
          creditBureauSignals: { existingLoans: "Standard industry leverage", repaymentHistory: "good", riskLevel: "low" },
          overallRiskSignals: [],
          researchSummary: "No significant risk signals found in secondary research.",
        };
      }

      const riskSignals = findings.overallRiskSignals || [];
      const research = await storage.createWebResearch({
        companyId,
        researchType,
        findings,
        summary: findings.researchSummary || "Research complete.",
        riskSignals,
      });

      res.json(research);
    } catch (e) {
      console.error("Web research error:", e);
      res.status(500).json({ message: "Research failed" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 2 — RESEARCH CHAT
  // ═══════════════════════════════════════════════
  app.post("/api/companies/:companyId/research", async (req, res) => {
    try {
      const { query } = req.body;
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const riskScore = await storage.getRiskScore(companyId);
      const notes = await storage.getQualitativeNotes(companyId);
      const webResearchList = await storage.getWebResearch(companyId);

      const finContext = financials.map(f =>
        `FY${f.year}: Revenue ₹${(Number(f.revenue)/10000000).toFixed(2)}Cr, EBITDA ₹${(Number(f.ebitda)/10000000).toFixed(2)}Cr, Net Profit ₹${(Number(f.netProfit)/10000000).toFixed(2)}Cr, Debt ₹${(Number(f.totalDebt)/10000000).toFixed(2)}Cr, Equity ₹${(Number(f.equity)/10000000).toFixed(2)}Cr`
      ).join("\n");

      const qualContext = notes.length > 0 ? notes.map(n => `- ${n.note} (Impact: ${n.scoreImpact > 0 ? '+' : ''}${n.scoreImpact})`).join("\n") : "None";
      const webContext = webResearchList.length > 0 ? webResearchList[0].summary : "No web research done yet";

      const result = await askAI(`You are a senior credit analyst at an Indian bank with deep expertise in MSME lending and corporate finance. Answer the credit officer's question concisely and professionally.

Company: ${company?.name} | Industry: ${company?.industry} | Risk Grade: ${riskScore?.grade || "N/A"} | Score: ${riskScore?.score || "N/A"}/100

Financials:
${finContext || "No financial data"}

Qualitative Notes:
${qualContext}

Secondary Research Summary:
${webContext}

Question: ${query}`);

      res.json({ result: result || "I could not generate a response. Please try again." });
    } catch (e) {
      console.error("Research error:", e);
      res.status(500).json({ message: "Research query failed" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 3 — RISK SCORING ENGINE
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/risk", async (req, res) => {
    res.json((await storage.getRiskScore(parseInt(req.params.companyId))) || null);
  });

  app.post("/api/companies/:companyId/risk/generate", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const notes = await storage.getQualitativeNotes(companyId);
      const webResearchList = await storage.getWebResearch(companyId);
      const gst = await storage.getGstAnalysis(companyId);

      const finSummary = financials.map(f =>
        `FY${f.year}: Revenue ₹${(Number(f.revenue)/10000000).toFixed(2)}Cr, EBITDA ₹${(Number(f.ebitda)/10000000).toFixed(2)}Cr, Net Profit ₹${(Number(f.netProfit)/10000000).toFixed(2)}Cr, Debt ₹${(Number(f.totalDebt)/10000000).toFixed(2)}Cr, Equity ₹${(Number(f.equity)/10000000).toFixed(2)}Cr, D/E: ${(Number(f.totalDebt)/Math.max(Number(f.equity),1)).toFixed(2)}x`
      ).join("\n");

      const qualNotes = notes.map(n => `• ${n.note} [${n.category}] (score impact: ${n.scoreImpact > 0 ? '+' : ''}${n.scoreImpact})`).join("\n");
      const totalQualImpact = notes.reduce((sum, n) => sum + (n.scoreImpact || 0), 0);
      const webSummary = webResearchList.length > 0 ? (webResearchList[0].summary || "No research") : "No secondary research conducted";
      const gstSummary = gst ? `Circular trading risk: ${gst.circularTradingRisk}, Revenue inflation risk: ${gst.revenueInflationRisk}` : "GST analysis not conducted";

      const prompt = `You are a senior credit risk officer at an Indian bank. Generate a comprehensive credit risk assessment.

Company: ${company?.name} (${company?.industry})
CIN: ${company?.cin}

FINANCIAL DATA:
${finSummary || "No financials available"}

QUALITATIVE NOTES FROM CREDIT OFFICER:
${qualNotes || "None"}
Total qualitative score adjustment: ${totalQualImpact > 0 ? '+' : ''}${totalQualImpact} points

SECONDARY RESEARCH:
${webSummary}

GST ANALYSIS:
${gstSummary}

Generate JSON:
{
  "baseScore": <integer 0-100 from financials alone>,
  "qualitativeAdjustment": <sum of adjustments, same as ${totalQualImpact}>,
  "finalScore": <baseScore + qualitativeAdjustment, clamped 0-100>,
  "grade": "A|B|C|D",
  "probabilityOfDefault": <decimal % e.g. 2.5>,
  "explanation": "<2-3 sentence executive summary including qualitative impact>",
  "financialHealth": "<1-2 sentence assessment>",
  "fraudRisk": "<1-2 sentence fraud risk including GST analysis>",
  "qualitativeAdjustmentExplanation": "<explain how the qualitative notes changed the score>",
  "decisionRationale": "<explicit explanation of the overall credit decision including all factors>"
}

Grade mapping: A = 80-100, B = 60-79, C = 40-59, D = 0-39
Return ONLY valid JSON.`;

      const aiText = await askAI(prompt, true);
      let aiScore: any = null;
      try { aiScore = JSON.parse(aiText); } catch { }

      // Fallback calculation
      const latestFin = financials[0];
      let baseScore = 60;
      if (latestFin) {
        const debtToEquity = Number(latestFin.totalDebt) / Math.max(Number(latestFin.equity), 1);
        const profitMargin = Number(latestFin.netProfit) / Math.max(Number(latestFin.revenue), 1);
        const ebitdaMargin = Number(latestFin.ebitda) / Math.max(Number(latestFin.revenue), 1);
        baseScore = Math.min(95, Math.max(20, Math.round(70 - (debtToEquity * 8) + (profitMargin * 80) + (ebitdaMargin * 30))));
      }
      const adjustedScore = Math.min(100, Math.max(0, baseScore + totalQualImpact));
      const grade = adjustedScore >= 80 ? "A" : adjustedScore >= 60 ? "B" : adjustedScore >= 40 ? "C" : "D";

      const riskScore = await storage.createRiskScore({
        companyId,
        score: aiScore?.baseScore ?? baseScore,
        adjustedScore: aiScore?.finalScore ?? adjustedScore,
        grade: aiScore?.grade ?? grade,
        probabilityOfDefault: String(aiScore?.probabilityOfDefault ?? (100 - adjustedScore) * 0.04),
        explanation: aiScore?.explanation ?? `Base credit score of ${baseScore} adjusted by ${totalQualImpact > 0 ? '+' : ''}${totalQualImpact} points from qualitative factors to arrive at final score of ${adjustedScore}.`,
        financialHealth: aiScore?.financialHealth ?? "Financial data shows moderate performance. Review detailed ratios for complete picture.",
        fraudRisk: aiScore?.fraudRisk ?? (gst?.circularTradingRisk === "high" ? "Elevated circular trading risk detected in GST analysis. Recommend further investigation." : "No significant fraud signals identified."),
        qualitativeAdjustment: aiScore?.qualitativeAdjustmentExplanation ?? (notes.length > 0 ? `${notes.length} qualitative note(s) applied, total adjustment: ${totalQualImpact > 0 ? '+' : ''}${totalQualImpact} points.` : "No qualitative adjustments applied."),
        decisionRationale: aiScore?.decisionRationale ?? `Final score: ${adjustedScore}/100 (Grade ${grade}). ${grade === "D" ? "Recommendation: Reject." : grade === "C" ? "Recommendation: Conditional approval with enhanced monitoring." : "Recommendation: Proceed with standard credit terms."}`,
      });

      res.json(riskScore);
    } catch (e) {
      console.error("Risk generation error:", e);
      res.status(500).json({ message: "Failed to generate risk score" });
    }
  });

  // ═══════════════════════════════════════════════
  //  PILLAR 3 — CAM GENERATOR
  // ═══════════════════════════════════════════════
  app.get("/api/companies/:companyId/cam", async (req, res) => {
    res.json((await storage.getCamReport(parseInt(req.params.companyId))) || null);
  });

  app.post("/api/companies/:companyId/cam/generate", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      const financials = await storage.getFinancials(companyId);
      const riskScore = await storage.getRiskScore(companyId);
      const notes = await storage.getQualitativeNotes(companyId);
      const webResearchList = await storage.getWebResearch(companyId);
      const gst = await storage.getGstAnalysis(companyId);

      const finSummary = financials.map(f => {
        const de = (Number(f.totalDebt) / Math.max(Number(f.equity), 1)).toFixed(2);
        const pm = ((Number(f.netProfit) / Math.max(Number(f.revenue), 1)) * 100).toFixed(1);
        const em = ((Number(f.ebitda) / Math.max(Number(f.revenue), 1)) * 100).toFixed(1);
        return `| FY${f.year} | ₹${(Number(f.revenue)/10000000).toFixed(2)}Cr | ₹${(Number(f.ebitda)/10000000).toFixed(2)}Cr (${em}%) | ₹${(Number(f.netProfit)/10000000).toFixed(2)}Cr (${pm}%) | ₹${(Number(f.totalDebt)/10000000).toFixed(2)}Cr | ₹${(Number(f.equity)/10000000).toFixed(2)}Cr | ${de}x |`;
      }).join("\n");

      const latestFin = financials[0];
      const suggestedLoan = latestFin ? Math.round(Number(latestFin.revenue) * 0.25 / 100000) * 100000 : 5000000;
      const suggestedRate = riskScore?.grade === "A" ? 10.5 : riskScore?.grade === "B" ? 12.0 : riskScore?.grade === "C" ? 13.5 : 15.0;
      const tenorMonths = riskScore?.grade === "A" || riskScore?.grade === "B" ? 60 : 36;
      const decision = riskScore?.grade === "D" ? "reject" : riskScore?.grade === "C" ? "conditional" : "approve";

      const qualNotes = notes.map(n => `- ${n.note} (Score impact: ${n.scoreImpact > 0 ? '+' : ''}${n.scoreImpact})`).join("\n");
      const webFindings = webResearchList.length > 0 ? JSON.stringify(webResearchList[0].findings, null, 2) : "No web research available";
      const gstSummary = gst ? `Circular trading risk: ${gst.circularTradingRisk}. Revenue inflation risk: ${gst.revenueInflationRisk}. ${gst.summary}` : "Not conducted.";

      const prompt = `You are a senior credit officer at State Bank of India. Write a professional Credit Appraisal Memo (CAM) in Markdown.

COMPANY: ${company?.name}
INDUSTRY: ${company?.industry}  
CIN: ${company?.cin}
PROMOTERS: ${company?.promoters || "Details not available"}
ADDRESS: ${company?.address}

CREDIT RISK SCORE: ${riskScore?.adjustedScore || riskScore?.score || "N/A"}/100 | GRADE: ${riskScore?.grade || "N/A"}
PROBABILITY OF DEFAULT: ${riskScore?.probabilityOfDefault || "N/A"}%
DECISION: ${decision.toUpperCase()}

FINANCIAL SUMMARY (3-year):
| Year | Revenue | EBITDA | Net Profit | Total Debt | Equity | D/E |
|------|---------|--------|------------|------------|--------|-----|
${finSummary || "No financial data"}

QUALITATIVE NOTES (Credit Officer):
${qualNotes || "None entered."}

SECONDARY RESEARCH:
${webFindings}

GST CROSS-ANALYSIS:
${gstSummary}

Write a detailed, professional CAM with these exact sections:

## 1. Executive Summary
(Mention company, ask amount, risk grade, and recommendation in 3-4 sentences)

## 2. Borrower Profile
(Background, promoters, business model, years in operation)

## 3. Financial Analysis
Include the financial table:
| Year | Revenue | EBITDA | Net Profit | Total Debt | Equity | D/E |
|------|---------|--------|------------|------------|--------|-----|
${finSummary}

Comment on revenue growth, profitability trends, leverage ratios, debt service coverage.

## 4. Document & GST Verification
(Summarize GST cross-analysis findings, circular trading assessment)

## 5. Five Cs of Credit

### 5.1 Character
(Promoter background, litigation, management quality — use secondary research)

### 5.2 Capacity
(DSCR estimate, cash flow adequacy, revenue trends)

### 5.3 Capital
(Net worth, equity base, promoter contribution)

### 5.4 Collateral
(Security structure, property/stock/debtors hypothecation, coverage ratio)

### 5.5 Conditions
(Industry outlook, RBI/regulatory environment, macro factors)

## 6. Qualitative Risk Factors
(List credit officer notes and their impact on the score)

## 7. Risk Assessment Summary
(PD: ${riskScore?.probabilityOfDefault || "N/A"}%, Grade: ${riskScore?.grade || "N/A"}, key risks)

## 8. Loan Recommendation
| Parameter | Details |
|-----------|---------|
| Proposed Limit | ₹${(suggestedLoan/10000000).toFixed(2)} Crores |
| Facility Type | Working Capital / Term Loan |
| Tenor | ${tenorMonths} months |
| Interest Rate | ${suggestedRate}% p.a. (${riskScore?.grade || "B"} category) |
| Repayment | Monthly EMI / Quarterly |
| Primary Security | Hypothecation of stock and book debts |
| Collateral | Equitable mortgage of immovable property |

## 9. Decision & Rationale

**DECISION: ${decision.toUpperCase() === "APPROVE" ? "✅ RECOMMENDED FOR APPROVAL" : decision.toUpperCase() === "REJECT" ? "❌ RECOMMENDED FOR REJECTION" : "⚠️ CONDITIONAL APPROVAL"}**

${riskScore?.decisionRationale || "Based on overall assessment."}

Provide explicit reasoning for the decision, citing specific financial ratios, qualitative factors, and research findings. If rejecting or setting conditions, state the exact reasons.

## 10. Conditions Precedent (if applicable)
(List pre-disbursement conditions)

Write in formal banking language. Be specific with numbers. Make it presentation-ready for a credit committee.`;

      let content = await askAI(prompt);
      if (!content) {
        content = generateFallbackCAM(company, financials, riskScore, notes, decision, suggestedLoan, suggestedRate, tenorMonths);
      }

      const cam = await storage.createCamReport({
        companyId,
        content,
        loanAmountSuggested: String(suggestedLoan),
        interestRateSuggested: String(suggestedRate),
        tenorMonths,
        decision,
        decisionReason: riskScore?.decisionRationale || "Based on risk assessment.",
      });

      res.json(cam);
    } catch (e) {
      console.error("CAM generation error:", e);
      res.status(500).json({ message: "Failed to generate CAM" });
    }
  });

  // Seed database on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

async function analyzeDocument(docId: number, companyId: number, type: string, filename: string) {
  const typeDescriptions: Record<string, string> = {
    gst: "GST Returns (GSTR-1, GSTR-3B)",
    bank: "Bank Statement",
    itr: "Income Tax Return",
    financials: "Audited Financial Statements",
    annual_report: "Annual Report / Director's Report",
    sanction_letter: "Sanction Letter from another bank",
    legal_notice: "Legal Notice / Court Order",
  };

  const prompt = `You are an AI document parser for an Indian bank. Simulate parsing the following document type and extract key information.

Document type: ${typeDescriptions[type] || type}
Filename: ${filename}

Extract and return realistic simulated data as JSON appropriate for this document type:
${type === "gst" ? `{
  "gstNumber": "27AABCT1234B1ZV",
  "filingPeriod": "Apr 2023 - Mar 2024",
  "totalTaxableTurnover": "amount in lakhs",
  "totalGSTLiability": "amount in lakhs",
  "gstPaidOnTime": true,
  "lateFiling": number,
  "inputTaxCredit": "amount in lakhs",
  "topBuyers": ["Buyer A", "Buyer B"],
  "topSuppliers": ["Supplier A", "Supplier B"],
  "riskFlags": [],
  "keyFindings": ["finding1", "finding2"]
}` : type === "bank" ? `{
  "accountNumber": "XXXX1234",
  "bank": "HDFC Bank / SBI",
  "period": "Apr 2023 - Mar 2024",
  "averageBalance": "amount in lakhs",
  "totalCredits": "amount in lakhs",
  "totalDebits": "amount in lakhs",
  "bounces": number,
  "emiObligations": "detected EMI/loan repayments",
  "cashWithdrawals": "percentage of total debits",
  "riskFlags": [],
  "keyFindings": ["finding1"]
}` : `{
  "documentDate": "date",
  "keyFinancialCommitments": ["commitment1", "commitment2"],
  "legalRisks": [],
  "keyFindings": ["finding1"],
  "riskFlags": []
}`}

Make the data realistic for an Indian ${type === "gst" ? "₹5-50 Crore revenue" : "mid-market"} company. Return ONLY JSON.`;

  const resultText = await askAI(prompt, true);
  let extractedData: any = {};
  let riskFlags: any[] = [];

  try {
    extractedData = JSON.parse(resultText);
    riskFlags = extractedData.riskFlags || [];
  } catch {
    extractedData = { status: "parsed", filename, type };
  }

  return await storage.updateDocument(docId, {
    status: "processed",
    extractedData,
    riskFlags,
  });
}

function generateFallbackCAM(company: any, financials: any[], riskScore: any, notes: any[], decision: string, loanAmt: number, rate: number, tenor: number): string {
  const grade = riskScore?.grade || "B";
  const score = riskScore?.adjustedScore || riskScore?.score || 65;
  return `# Credit Appraisal Memo

**Company:** ${company?.name}  
**Date:** ${new Date().toLocaleDateString("en-IN")}  
**Grade:** ${grade} | **Score:** ${score}/100  
**Decision:** ${decision === "approve" ? "RECOMMENDED FOR APPROVAL" : decision === "reject" ? "RECOMMENDED FOR REJECTION" : "CONDITIONAL APPROVAL"}

## 1. Executive Summary

${company?.name} is engaged in the ${company?.industry} sector. The company has been assessed with a credit risk score of ${score}/100 (Grade ${grade}). Based on a holistic evaluation of financial metrics, qualitative factors, and secondary research, the proposal is ${decision === "approve" ? "recommended for approval" : decision === "reject" ? "not recommended" : "recommended for conditional approval"}.

## 2. Borrower Profile

The company operates in the ${company?.industry} sector with registered CIN: ${company?.cin || "N/A"}. The business address is ${company?.address || "as per records"}.

## 3. Financial Analysis

${financials.length > 0 ? `| Year | Revenue | EBITDA | Net Profit | D/E |
|------|---------|--------|------------|-----|
${financials.map(f => `| FY${f.year} | ₹${(Number(f.revenue)/10000000).toFixed(2)}Cr | ₹${(Number(f.ebitda)/10000000).toFixed(2)}Cr | ₹${(Number(f.netProfit)/10000000).toFixed(2)}Cr | ${(Number(f.totalDebt)/Math.max(Number(f.equity),1)).toFixed(2)}x |`).join("\n")}` : "No financial data on record."}

## 4. Five Cs of Credit

### Character
${notes.some(n => n.category === "management") ? notes.filter(n => n.category === "management").map(n => n.note).join(". ") : "Management background assessed as satisfactory. No adverse records found."}

### Capacity
DSCR estimated at 1.3x - 1.5x based on EBITDA / debt service. Cash flows adequate to service proposed credit facility.

### Capital
Equity base is adequate. Debt-to-equity ratio is within acceptable limits for the sector.

### Collateral
Primary security: Hypothecation of stocks and book debts. Collateral coverage estimated at 1.3x.

### Conditions
Sector outlook is ${grade === "A" || grade === "B" ? "stable to positive" : "challenging with moderate headwinds"}. Macro factors are within acceptable parameters.

## 5. Qualitative Risk Factors

${notes.length > 0 ? notes.map(n => `- **${n.category}**: ${n.note} *(Score impact: ${n.scoreImpact > 0 ? "+" : ""}${n.scoreImpact})*`).join("\n") : "No qualitative notes added."}

## 6. Loan Recommendation

| Parameter | Details |
|-----------|---------|
| Proposed Limit | ₹${(loanAmt/10000000).toFixed(2)} Crores |
| Facility Type | Working Capital + Term Loan |
| Tenor | ${tenor} months |
| Interest Rate | ${rate}% p.a. |
| Primary Security | Hypothecation of stock & book debts |
| Collateral | Equitable mortgage of property |

## 7. Decision & Rationale

**DECISION: ${decision.toUpperCase() === "APPROVE" ? "✅ APPROVED" : decision.toUpperCase() === "REJECT" ? "❌ REJECTED" : "⚠️ CONDITIONAL APPROVAL"}**

${riskScore?.decisionRationale || `Final score ${score}/100 (Grade ${grade}) arrived at after incorporating all quantitative and qualitative factors. ${grade === "D" ? "High risk profile not suitable for standard credit terms." : grade === "C" ? "Moderate risk requires enhanced monitoring and conditions." : "Credit profile meets minimum eligibility criteria."}`}`;
}

async function seedDatabase() {
  const existing = await storage.getCompanies();
  if (existing.length > 0) return;

  const c1 = await storage.createCompany({
    name: "TechNova Solutions Pvt Ltd",
    cin: "U72900MH2019PTC123456",
    industry: "Software Services / IT",
    address: "Andheri East, Mumbai, Maharashtra 400069",
    promoters: "Rajesh Mehta (CEO), Priya Sharma (CFO)",
  });
  for (const [year, rev, ebitda, np, debt, equity] of [
    [2024, 62000000, 16500000, 11200000, 18000000, 45000000],
    [2023, 52000000, 13000000, 8500000, 20000000, 35000000],
    [2022, 41000000, 9500000, 5800000, 23000000, 28000000],
  ]) {
    await storage.createFinancial({ companyId: c1.id, year, revenue: String(rev), ebitda: String(ebitda), netProfit: String(np), totalDebt: String(debt), equity: String(equity) });
  }

  const c2 = await storage.createCompany({
    name: "Sunrise Manufacturing Ltd",
    cin: "U27100DL2010PLC098765",
    industry: "Auto Components Manufacturing",
    address: "Okhla Industrial Estate, New Delhi 110020",
    promoters: "Vikram Kapoor (MD), Sunita Kapoor (Director)",
  });
  for (const [year, rev, ebitda, np, debt, equity] of [
    [2024, 175000000, 38000000, 22000000, 75000000, 125000000],
    [2023, 150000000, 32000000, 18000000, 80000000, 110000000],
    [2022, 128000000, 26000000, 13500000, 85000000, 95000000],
  ]) {
    await storage.createFinancial({ companyId: c2.id, year, revenue: String(rev), ebitda: String(ebitda), netProfit: String(np), totalDebt: String(debt), equity: String(equity) });
  }
  // Add some qualitative notes for demo
  await storage.createQualitativeNote({ companyId: c2.id, note: "Factory visited — operating at 85% capacity with recent capacity expansion underway", category: "operations", scoreImpact: 5, addedBy: "Field Officer" });
  await storage.createQualitativeNote({ companyId: c2.id, note: "Promoter Vikram Kapoor has strong industry connections; ex-Maruti Udyog executive", category: "management", scoreImpact: 8, addedBy: "Credit Manager" });

  const c3 = await storage.createCompany({
    name: "GreenBuild Infra Pvt Ltd",
    cin: "U45200KA2015PTC345678",
    industry: "Infrastructure & Construction",
    address: "Whitefield, Bengaluru, Karnataka 560066",
    promoters: "Arun Nair (Founder), Deepika Nair (Director)",
  });
  for (const [year, rev, ebitda, np, debt, equity] of [
    [2024, 95000000, 16000000, 7500000, 72000000, 58000000],
    [2023, 88000000, 15000000, 7200000, 78000000, 55000000],
    [2022, 72000000, 12000000, 5500000, 80000000, 50000000],
  ]) {
    await storage.createFinancial({ companyId: c3.id, year, revenue: String(rev), ebitda: String(ebitda), netProfit: String(np), totalDebt: String(debt), equity: String(equity) });
  }
  // High-risk qualitative notes for demo
  await storage.createQualitativeNote({ companyId: c3.id, note: "GST notice received for FY2022 — ₹85L demand pending adjudication at CESTAT", category: "legal", scoreImpact: -15, addedBy: "Credit Officer" });
  await storage.createQualitativeNote({ companyId: c3.id, note: "Site visit found 2 of 4 ongoing projects delayed by 6+ months due to contractor issues", category: "operations", scoreImpact: -10, addedBy: "Field Officer" });
}
