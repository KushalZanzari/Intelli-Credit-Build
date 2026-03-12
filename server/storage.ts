import { db } from "./db";
import { 
  companies, financials, riskScores, camReports, documents,
  qualitativeNotes, webResearch, gstAnalysis,
  type InsertCompany, type InsertFinancial, type InsertRiskScore, type InsertCamReport, type InsertDocument,
  type InsertQualitativeNote, type InsertWebResearch, type InsertGstAnalysis,
  type Company, type Financial, type RiskScore, type CamReport, type Document,
  type QualitativeNote, type WebResearch, type GstAnalysis,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Financials
  getFinancials(companyId: number): Promise<Financial[]>;
  createFinancial(financial: InsertFinancial): Promise<Financial>;

  // Risk Scores
  getRiskScore(companyId: number): Promise<RiskScore | undefined>;
  createRiskScore(score: InsertRiskScore): Promise<RiskScore>;

  // CAM Reports
  getCamReport(companyId: number): Promise<CamReport | undefined>;
  createCamReport(cam: InsertCamReport): Promise<CamReport>;

  // Documents
  getDocuments(companyId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;

  // Qualitative Notes
  getQualitativeNotes(companyId: number): Promise<QualitativeNote[]>;
  createQualitativeNote(note: InsertQualitativeNote): Promise<QualitativeNote>;
  deleteQualitativeNote(id: number): Promise<void>;

  // Web Research
  getWebResearch(companyId: number): Promise<WebResearch[]>;
  createWebResearch(research: InsertWebResearch): Promise<WebResearch>;

  // GST Analysis
  getGstAnalysis(companyId: number): Promise<GstAnalysis | undefined>;
  createGstAnalysis(analysis: InsertGstAnalysis): Promise<GstAnalysis>;
}

export class DatabaseStorage implements IStorage {
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getFinancials(companyId: number): Promise<Financial[]> {
    return await db.select().from(financials).where(eq(financials.companyId, companyId)).orderBy(desc(financials.year));
  }

  async createFinancial(financial: InsertFinancial): Promise<Financial> {
    const [newFin] = await db.insert(financials).values(financial).returning();
    return newFin;
  }

  async getRiskScore(companyId: number): Promise<RiskScore | undefined> {
    const [score] = await db.select().from(riskScores).where(eq(riskScores.companyId, companyId)).orderBy(desc(riskScores.createdAt)).limit(1);
    return score;
  }

  async createRiskScore(score: InsertRiskScore): Promise<RiskScore> {
    const [newScore] = await db.insert(riskScores).values(score).returning();
    return newScore;
  }

  async getCamReport(companyId: number): Promise<CamReport | undefined> {
    const [cam] = await db.select().from(camReports).where(eq(camReports.companyId, companyId)).orderBy(desc(camReports.createdAt)).limit(1);
    return cam;
  }

  async createCamReport(cam: InsertCamReport): Promise<CamReport> {
    const [newCam] = await db.insert(camReports).values(cam).returning();
    return newCam;
  }

  async getDocuments(companyId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.companyId, companyId)).orderBy(desc(documents.uploadedAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [updated] = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return updated;
  }

  async getQualitativeNotes(companyId: number): Promise<QualitativeNote[]> {
    return await db.select().from(qualitativeNotes).where(eq(qualitativeNotes.companyId, companyId)).orderBy(desc(qualitativeNotes.createdAt));
  }

  async createQualitativeNote(note: InsertQualitativeNote): Promise<QualitativeNote> {
    const [newNote] = await db.insert(qualitativeNotes).values(note).returning();
    return newNote;
  }

  async deleteQualitativeNote(id: number): Promise<void> {
    await db.delete(qualitativeNotes).where(eq(qualitativeNotes.id, id));
  }

  async getWebResearch(companyId: number): Promise<WebResearch[]> {
    return await db.select().from(webResearch).where(eq(webResearch.companyId, companyId)).orderBy(desc(webResearch.createdAt));
  }

  async createWebResearch(research: InsertWebResearch): Promise<WebResearch> {
    const [newResearch] = await db.insert(webResearch).values(research).returning();
    return newResearch;
  }

  async getGstAnalysis(companyId: number): Promise<GstAnalysis | undefined> {
    const [analysis] = await db.select().from(gstAnalysis).where(eq(gstAnalysis.companyId, companyId)).orderBy(desc(gstAnalysis.createdAt)).limit(1);
    return analysis;
  }

  async createGstAnalysis(analysis: InsertGstAnalysis): Promise<GstAnalysis> {
    const [newAnalysis] = await db.insert(gstAnalysis).values(analysis).returning();
    return newAnalysis;
  }
}

export const storage = new DatabaseStorage();
