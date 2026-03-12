import { pgTable, text, serial, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cin: text("cin"),
  industry: text("industry"),
  address: text("address"),
  promoters: text("promoters"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financials = pgTable("financials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  year: integer("year").notNull(),
  revenue: numeric("revenue").notNull(),
  ebitda: numeric("ebitda").notNull(),
  netProfit: numeric("net_profit").notNull(),
  totalDebt: numeric("total_debt").notNull(),
  equity: numeric("equity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskScores = pgTable("risk_scores", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  score: integer("score").notNull(),
  adjustedScore: integer("adjusted_score"),
  grade: text("grade").notNull(), // A, B, C, D
  probabilityOfDefault: numeric("pd_probability"),
  explanation: text("explanation"),
  financialHealth: text("financial_health"),
  fraudRisk: text("fraud_risk"),
  qualitativeAdjustment: text("qualitative_adjustment"),
  decisionRationale: text("decision_rationale"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const camReports = pgTable("cam_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  content: text("content").notNull(),
  loanAmountSuggested: numeric("loan_amount_suggested"),
  interestRateSuggested: numeric("interest_rate_suggested"),
  tenorMonths: integer("tenor_months"),
  decision: text("decision"), // 'approve', 'reject', 'conditional'
  decisionReason: text("decision_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  type: text("type").notNull(), // 'gst', 'bank', 'itr', 'financials', 'annual_report', 'sanction_letter', 'legal_notice'
  filename: text("filename").notNull(),
  status: text("status").default("uploaded"), // uploaded, analyzing, processed
  extractedData: jsonb("extracted_data"), // AI-extracted fields
  riskFlags: jsonb("risk_flags"), // array of risk flags found
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const qualitativeNotes = pgTable("qualitative_notes", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  note: text("note").notNull(),
  category: text("category").notNull().default("general"), // 'management', 'operations', 'market', 'legal', 'general'
  scoreImpact: integer("score_impact").default(0), // -20 to +20
  addedBy: text("added_by").default("Credit Officer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webResearch = pgTable("web_research", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  researchType: text("research_type").notNull(), // 'promoter', 'sector', 'litigation', 'news'
  findings: jsonb("findings"), // structured findings
  summary: text("summary"),
  riskSignals: jsonb("risk_signals"), // array of risk signals
  createdAt: timestamp("created_at").defaultNow(),
});

export const gstAnalysis = pgTable("gst_analysis", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  analysisResult: jsonb("analysis_result"), // full structured analysis
  circularTradingRisk: text("circular_trading_risk"), // low, medium, high
  revenueInflationRisk: text("revenue_inflation_risk"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertFinancialsSchema = createInsertSchema(financials).omit({ id: true, createdAt: true });
export const insertRiskScoreSchema = createInsertSchema(riskScores).omit({ id: true, createdAt: true });
export const insertCamReportSchema = createInsertSchema(camReports).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true, extractedData: true, riskFlags: true, status: true });
export const insertQualitativeNoteSchema = createInsertSchema(qualitativeNotes).omit({ id: true, createdAt: true });
export const insertWebResearchSchema = createInsertSchema(webResearch).omit({ id: true, createdAt: true });
export const insertGstAnalysisSchema = createInsertSchema(gstAnalysis).omit({ id: true, createdAt: true });

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Financial = typeof financials.$inferSelect;
export type InsertFinancial = z.infer<typeof insertFinancialsSchema>;

export type RiskScore = typeof riskScores.$inferSelect;
export type InsertRiskScore = z.infer<typeof insertRiskScoreSchema>;

export type CamReport = typeof camReports.$inferSelect;
export type InsertCamReport = z.infer<typeof insertCamReportSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type QualitativeNote = typeof qualitativeNotes.$inferSelect;
export type InsertQualitativeNote = z.infer<typeof insertQualitativeNoteSchema>;

export type WebResearch = typeof webResearch.$inferSelect;
export type InsertWebResearch = z.infer<typeof insertWebResearchSchema>;

export type GstAnalysis = typeof gstAnalysis.$inferSelect;
export type InsertGstAnalysis = z.infer<typeof insertGstAnalysisSchema>;

// Export Models
export * from "./models/auth";
export * from "./models/chat";
