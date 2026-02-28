import { db } from "./db";
import { 
  companies, financials, riskScores, camReports, documents,
  type InsertCompany, type InsertFinancial, type InsertRiskScore, type InsertCamReport, type InsertDocument,
  type Company, type Financial, type RiskScore, type CamReport, type Document
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  getFinancials(companyId: number): Promise<Financial[]>;
  createFinancial(financial: InsertFinancial): Promise<Financial>;

  getRiskScore(companyId: number): Promise<RiskScore | undefined>;
  createRiskScore(score: InsertRiskScore): Promise<RiskScore>;

  getCamReport(companyId: number): Promise<CamReport | undefined>;
  createCamReport(cam: InsertCamReport): Promise<CamReport>;

  getDocuments(companyId: number): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
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
    const [score] = await db.select()
      .from(riskScores)
      .where(eq(riskScores.companyId, companyId))
      .orderBy(desc(riskScores.createdAt))
      .limit(1);
    return score;
  }

  async createRiskScore(score: InsertRiskScore): Promise<RiskScore> {
    const [newScore] = await db.insert(riskScores).values(score).returning();
    return newScore;
  }

  async getCamReport(companyId: number): Promise<CamReport | undefined> {
    const [cam] = await db.select()
      .from(camReports)
      .where(eq(camReports.companyId, companyId))
      .orderBy(desc(camReports.createdAt))
      .limit(1);
    return cam;
  }

  async createCamReport(cam: InsertCamReport): Promise<CamReport> {
    const [newCam] = await db.insert(camReports).values(cam).returning();
    return newCam;
  }

  async getDocuments(companyId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.companyId, companyId)).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }
}

export const storage = new DatabaseStorage();
