import { useCompany } from "@/hooks/use-companies";
import { useRoute } from "wouter";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { FinancialsTab } from "@/components/companies/tabs/financials-tab";
import { DocumentsTab } from "@/components/companies/tabs/documents-tab";
import { RiskTab } from "@/components/companies/tabs/risk-tab";
import { CamTab } from "@/components/companies/tabs/cam-tab";
import { ResearchTab } from "@/components/companies/tabs/research-tab";

export default function CompanyDetails() {
  const [, params] = useRoute("/companies/:id");
  const companyId = parseInt(params?.id || "0");
  
  const { data: company, isLoading } = useCompany(companyId);

  if (isLoading) return <div className="p-12 text-center animate-pulse">Loading profile...</div>;
  if (!company) return <div className="p-12 text-center text-destructive">Company not found.</div>;

  return (
    <div className="space-y-6 pb-20">
      <Button variant="ghost" asChild className="text-muted-foreground -ml-4 mb-2">
        <Link href="/companies"><ArrowLeft className="w-4 h-4 mr-2"/> Back to List</Link>
      </Button>

      {/* Header Profile */}
      <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <Building2 className="w-10 h-10" />
        </div>
        
        <div className="flex-1 z-10">
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <Badge variant="outline" className="bg-background px-3 py-1 rounded-lg text-sm">{company.industry || 'Unknown Industry'}</Badge>
            <span className="text-sm text-muted-foreground font-mono">CIN: {company.cin || 'N/A'}</span>
            <span className="text-sm text-muted-foreground">{company.address || 'No address provided'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="h-14 w-full justify-start bg-muted/30 p-1 rounded-2xl overflow-x-auto overflow-y-hidden border border-border/50 no-scrollbar">
          <TabsTrigger value="financials" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">Financials</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">Documents</TabsTrigger>
          <TabsTrigger value="risk" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-base text-primary font-medium">Risk Analysis</TabsTrigger>
          <TabsTrigger value="cam" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">CAM Report</TabsTrigger>
          <TabsTrigger value="research" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-base flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>AI Research</TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <TabsContent value="financials" className="focus-visible:outline-none"><FinancialsTab companyId={companyId} /></TabsContent>
          <TabsContent value="documents" className="focus-visible:outline-none"><DocumentsTab companyId={companyId} /></TabsContent>
          <TabsContent value="risk" className="focus-visible:outline-none"><RiskTab companyId={companyId} /></TabsContent>
          <TabsContent value="cam" className="focus-visible:outline-none"><CamTab companyId={companyId} /></TabsContent>
          <TabsContent value="research" className="focus-visible:outline-none"><ResearchTab companyId={companyId} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
