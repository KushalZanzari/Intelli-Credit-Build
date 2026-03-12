import { useDocuments, useUploadDocument } from "@/hooks/use-documents";
import { useGstAnalysis, useRunGstAnalysis } from "@/hooks/use-gst-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, UploadCloud, CheckCircle2, Loader2, AlertTriangle, 
  ShieldCheck, BarChart3, FileSearch, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const DOC_TYPES = [
  { value: "bank", label: "Bank Statement" },
  { value: "gst", label: "GST Returns" },
  { value: "itr", label: "Income Tax Return" },
  { value: "financials", label: "Audited Financials" },
  { value: "annual_report", label: "Annual Report (PDF)" },
  { value: "sanction_letter", label: "Sanction Letter" },
  { value: "legal_notice", label: "Legal Notice" },
];

const RISK_COLORS: Record<string, string> = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-red-600 bg-red-50 border-red-200",
};

function RiskBadge({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${RISK_COLORS[level] || RISK_COLORS.low}`}>
      {level === "high" ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
      {level?.toUpperCase()} RISK
    </span>
  );
}

function DocumentCard({ doc }: { doc: any }) {
  const [expanded, setExpanded] = useState(false);
  const extracted = doc.extractedData as any;
  const flags = doc.riskFlags as any[] || [];

  const typeColors: Record<string, string> = {
    bank: "bg-blue-500/10 text-blue-600",
    gst: "bg-green-500/10 text-green-600",
    itr: "bg-purple-500/10 text-purple-600",
    financials: "bg-orange-500/10 text-orange-600",
    annual_report: "bg-indigo-500/10 text-indigo-600",
    sanction_letter: "bg-yellow-500/10 text-yellow-600",
    legal_notice: "bg-red-500/10 text-red-600",
  };

  return (
    <Card className="rounded-2xl border-border/50 overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[doc.type] || "bg-muted text-muted-foreground"}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">{doc.filename}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] uppercase">{doc.type.replace("_", " ")}</Badge>
              {doc.uploadedAt && <span className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), "d MMM yyyy")}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {doc.status === "processed" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : doc.status === "analyzing" ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-border" />
            )}
            {doc.status === "processed" && extracted && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && extracted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                {flags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {flags.map((f: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs">
                        <AlertTriangle className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  {Object.entries(extracted)
                    .filter(([k]) => !["riskFlags", "keyFindings"].includes(k))
                    .slice(0, 8)
                    .map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="font-medium capitalize min-w-32 text-foreground">{k.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <span className="text-muted-foreground">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                      </div>
                    ))}
                </div>
                {extracted?.keyFindings && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Key Findings:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(extracted.keyFindings as string[]).map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function GSTAnalysisPanel({ companyId }: { companyId: number }) {
  const { data: gst, isLoading } = useGstAnalysis(companyId);
  const runMutation = useRunGstAnalysis();
  const result = gst?.analysisResult as any;

  if (isLoading) return <div className="py-10 text-center animate-pulse text-muted-foreground">Loading GST analysis...</div>;

  if (!gst) {
    return (
      <div className="py-16 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">GST × Bank Cross-Verification</h3>
        <p className="text-muted-foreground mb-6 text-sm">Cross-leverage GST returns against bank statements to detect circular trading patterns and revenue inflation.</p>
        <Button onClick={() => runMutation.mutate({ companyId })} disabled={runMutation.isPending} className="rounded-xl shadow-md">
          <BarChart3 className="w-4 h-4 mr-2" />
          {runMutation.isPending ? "Analyzing..." : "Run GST Analysis"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">GST × Bank Cross-Verification</h3>
        <Button variant="outline" size="sm" onClick={() => runMutation.mutate({ companyId })} disabled={runMutation.isPending} className="rounded-xl">
          <RefreshCw className={`w-4 h-4 mr-2 ${runMutation.isPending ? "animate-spin" : ""}`} /> Re-Analyze
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Circular Trading", value: gst.circularTradingRisk || "low" },
          { label: "Revenue Inflation", value: gst.revenueInflationRisk || "low" },
          { label: "Variance Risk", value: result?.gstVsBankReconciliation?.varianceRisk || "low" },
          { label: "Party Concentration", value: result?.topPartyConcentration?.risk || "low" },
        ].map(item => (
          <Card key={item.label} className="rounded-2xl border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
              <RiskBadge level={item.value} />
            </CardContent>
          </Card>
        ))}
      </div>

      {result?.gstVsBankReconciliation && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-base font-semibold">GST vs Bank Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                ["GST Declared Revenue", result.gstVsBankReconciliation.gstDeclaredRevenue],
                ["Bank Credit Turnover", result.gstVsBankReconciliation.bankCreditTurnover],
                ["Variance", result.gstVsBankReconciliation.variance],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-bold text-foreground mt-1">{value as string}</p>
                </div>
              ))}
            </div>
            {result.gstVsBankReconciliation.explanation && (
              <p className="text-sm text-muted-foreground">{result.gstVsBankReconciliation.explanation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {result?.circularTradingIndicators?.length > 0 && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-base font-semibold">Circular Trading Indicators</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {result.circularTradingIndicators.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl">
                <RiskBadge level={item.risk} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.indicator}</p>
                  <p className="text-xs text-muted-foreground">{item.finding}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result?.suspiciousTransactionPatterns?.length > 0 && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-base font-semibold">Suspicious Transaction Patterns</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {result.suspiciousTransactionPatterns.map((p: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">{p.pattern}:</span>{" "}
                  <span className="text-muted-foreground">{p.description}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result?.recommendations?.length > 0 && (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 space-y-1">
            <p className="text-sm font-semibold mb-2">Recommended Actions</p>
            {result.recommendations.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold">{i + 1}.</span> {r}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {gst.summary && (
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Summary: </span>{gst.summary}
        </div>
      )}
    </div>
  );
}

export function DocumentsTab({ companyId }: { companyId: number }) {
  const { data: documents, isLoading } = useDocuments(companyId);
  const uploadMutation = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("bank");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ companyId, file, type: docType });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents">
        <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/40">
          <TabsTrigger value="documents" className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Documents
          </TabsTrigger>
          <TabsTrigger value="gst" className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-2" /> GST Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6 space-y-4 focus-visible:outline-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2"><FileSearch className="w-5 h-5 text-primary" /> Document Repository</h2>
              <p className="text-sm text-muted-foreground">Upload PDF annual reports, bank statements, GST returns, sanction letters</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.csv,.xlsx,.jpg,.png" />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} className="rounded-xl shadow-md">
                {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading documents...</div>
          ) : documents?.length === 0 ? (
            <div className="py-16 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="font-semibold text-foreground">No documents uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload PDFs, bank statements, GST returns for AI extraction</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents?.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gst" className="mt-6 focus-visible:outline-none">
          <GSTAnalysisPanel companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
