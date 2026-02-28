import { pgTable, text, serial, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cin: text("cin"),
  industry: text("industry"),
  address: text("address"),
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
  grade: text("grade").notNull(), // A, B, C, D
  probabilityOfDefault: numeric("pd_probability"),
  explanation: text("explanation"), 
  financialHealth: text("financial_health"),
  fraudRisk: text("fraud_risk"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const camReports = pgTable("cam_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  content: text("content").notNull(), 
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  type: text("type").notNull(), // 'gst', 'bank', 'itr', 'financials'
  filename: text("filename").notNull(),
  status: text("status").default('processed'),
  extractedData: jsonb("extracted_data"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertFinancialsSchema = createInsertSchema(financials).omit({ id: true, createdAt: true });
export const insertRiskScoreSchema = createInsertSchema(riskScores).omit({ id: true, createdAt: true });
export const insertCamReportSchema = createInsertSchema(camReports).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true, extractedData: true, status: true });

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
