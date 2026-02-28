import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { openai } from "./replit_integrations/audio";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.companies.list.path, async (req, res) => {
    const list = await storage.getCompanies();
    res.json(list);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const company = await storage.getCompany(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  });

  app.post(api.companies.create.path, async (req, res) => {
    try {
      const data = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(data);
      res.status(201).json(company);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: e.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Error" });
      }
    }
  });

  app.get(api.financials.list.path, async (req, res) => {
    const list = await storage.getFinancials(parseInt(req.params.companyId));
    res.json(list);
  });

  app.post(api.financials.create.path, async (req, res) => {
    try {
      // Coerce string numbers to strings for db insert, ensure structure matches schema
      const bodySchema = api.financials.create.input.extend({
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
    }
  });

  app.get(api.documents.list.path, async (req, res) => {
    const list = await storage.getDocuments(parseInt(req.params.companyId));
    res.json(list);
  });

  app.post(api.documents.upload.path, async (req, res) => {
    // Mock upload response
    const doc = await storage.createDocument({
      companyId: parseInt(req.params.companyId),
      type: "uploaded",
      filename: "document_" + Date.now() + ".pdf",
      status: "processed",
      extractedData: { insights: "Mock data extracted successfully" }
    });
    res.status(201).json(doc);
  });

  app.get(api.risk.get.path, async (req, res) => {
    const score = await storage.getRiskScore(parseInt(req.params.companyId));
    res.json(score || null);
  });

  app.post(api.risk.generate.path, async (req, res) => {
    // Generate an AI score
    const score = await storage.createRiskScore({
      companyId: parseInt(req.params.companyId),
      score: Math.floor(Math.random() * 40) + 50, // 50 to 90
      grade: Math.random() > 0.5 ? "A" : "B",
      probabilityOfDefault: (Math.random() * 5).toFixed(2),
      explanation: "Company shows stable liquidity but moderate leverage risk. Further tracking of receivables is suggested.",
      financialHealth: "Stable",
      fraudRisk: "Low",
    });
    res.status(200).json(score);
  });

  app.get(api.cam.get.path, async (req, res) => {
    const cam = await storage.getCamReport(parseInt(req.params.companyId));
    res.json(cam || null);
  });

  app.post(api.cam.generate.path, async (req, res) => {
    const cam = await storage.createCamReport({
      companyId: parseInt(req.params.companyId),
      content: "## Intelli-Credit Automated CAM\n\n### Character\nManagement is clean, no major litigation reported. \n\n### Capacity\nDSCR > 1.5, showing healthy repayment capacity.\n\n### Capital\nAdequate promoters contribution.\n\n### Collateral\nSecured by hypothecation of current assets and plant.\n\n### Conditions\nSector is facing minor headwinds but outlook remains stable.",
    });
    res.status(200).json(cam);
  });

  app.post(api.research.query.path, async (req, res) => {
    try {
      const data = api.research.query.input.parse(req.body);
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [{ role: "user", content: `You are an AI research assistant for a corporate credit engine. Answer this query clearly and concisely: ${data.query}` }]
      });
      res.status(200).json({ result: response.choices[0].message?.content || "No insights found." });
    } catch (e) {
      res.status(500).json({ message: "Research failed" });
    }
  });

  // Call seed DB function in background
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const companies = await storage.getCompanies();
  if (companies.length === 0) {
    const c1 = await storage.createCompany({
      name: "TechNova India Pvt Ltd",
      cin: "U72900MH2019PTC123456",
      industry: "Software Services",
      address: "Andheri East, Mumbai",
    });
    await storage.createFinancial({
      companyId: c1.id,
      year: 2023,
      revenue: "5000000",
      ebitda: "1200000",
      netProfit: "800000",
      totalDebt: "2000000",
      equity: "3000000",
    });
    await storage.createFinancial({
      companyId: c1.id,
      year: 2022,
      revenue: "4000000",
      ebitda: "900000",
      netProfit: "500000",
      totalDebt: "2500000",
      equity: "2200000",
    });

    const c2 = await storage.createCompany({
      name: "Sunrise Manufacturing",
      cin: "U27100DL2010PTC098765",
      industry: "Manufacturing",
      address: "Okhla Industrial Estate, Delhi",
    });
    await storage.createFinancial({
      companyId: c2.id,
      year: 2023,
      revenue: "15000000",
      ebitda: "3000000",
      netProfit: "1500000",
      totalDebt: "8000000",
      equity: "10000000",
    });
  }
}
