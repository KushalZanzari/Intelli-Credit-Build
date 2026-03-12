import { useCamReport, useGenerateCam } from "@/hooks/use-cam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Wand2, Printer, CheckCircle, XCircle, AlertCircle, Building2, Percent, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { CamReport } from "@shared/schema";

const DECISION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  approve: {
    label: "RECOMMENDED FOR APPROVAL",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-green-700",
    bg: "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700",
  },
  reject: {
    label: "RECOMMENDED FOR REJECTION",
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-700",
    bg: "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700",
  },
  conditional: {
    label: "CONDITIONAL APPROVAL",
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700",
  },
};

function DecisionBanner({ cam }: { cam: CamReport }) {
  const decision = cam.decision || "conditional";
  const cfg = DECISION_CONFIG[decision] || DECISION_CONFIG.conditional;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${cfg.bg}`}>
      <div className={cfg.color}>{cfg.icon}</div>
      <div className="flex-1">
        <div className={`font-bold text-base ${cfg.color}`}>{cfg.label}</div>
        {cam.decisionReason && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{cam.decisionReason}</p>}
      </div>
    </div>
  );
}

function LoanSummary({ cam }: { cam: CamReport }) {
  if (!cam.loanAmountSuggested) return null;
  const loanCr = (Number(cam.loanAmountSuggested) / 10000000).toFixed(2);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Proposed Limit</p>
            <p className="font-bold text-lg">₹{loanCr} Cr</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="font-bold text-lg">{cam.interestRateSuggested}% p.a.</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tenor</p>
            <p className="font-bold text-lg">{cam.tenorMonths} months</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CamTab({ companyId }: { companyId: number }) {
  const { data: cam, isLoading } = useCamReport(companyId);
  const generateMutation = useGenerateCam();

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading CAM Report...</div>;

  if (!cam) {
    return (
      <div className="py-20 flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Generate CAM Report</h2>
        <p className="text-muted-foreground mb-3 leading-relaxed">
          Produce a professional, structured Credit Appraisal Memo covering the Five Cs of Credit, loan recommendation with transparent decision logic, and explainable rationale.
        </p>
        <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 mb-8 border border-border/50">
          <span className="font-medium text-foreground">Tip:</span> Generate a risk score and add qualitative notes first for the most comprehensive CAM output.
        </p>
        <Button
          size="lg"
          onClick={() => generateMutation.mutate(companyId)}
          disabled={generateMutation.isPending}
          className="rounded-xl shadow-xl shadow-primary/20 px-8 h-14 text-base"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          {generateMutation.isPending ? "Drafting Memo..." : "Auto-Draft CAM"}
        </Button>
        {generateMutation.isPending && (
          <p className="text-sm text-muted-foreground mt-4 animate-pulse">AI is analyzing financials, qualitative notes, and research findings...</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Credit Appraisal Memo</h2>
          {cam.decision && (
            <Badge variant="outline" className={`capitalize ${DECISION_CONFIG[cam.decision]?.color}`}>
              {cam.decision}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generateMutation.mutate(companyId)}
            disabled={generateMutation.isPending}
            className="rounded-xl"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? "Drafting..." : "Regenerate"}
          </Button>
          <Button
            className="rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" /> Print / Export
          </Button>
        </div>
      </div>

      {/* Decision Banner */}
      <DecisionBanner cam={cam} />

      {/* Loan Summary Cards */}
      <LoanSummary cam={cam} />

      {/* CAM Content */}
      <Card className="rounded-2xl border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="prose prose-sm md:prose prose-slate dark:prose-invert max-w-none p-6 md:p-10
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:border-border/50
            prose-h3:text-base prose-h3:text-primary
            prose-table:text-sm prose-th:bg-muted/40 prose-th:font-semibold
            prose-td:py-2 prose-tr:border-border/30
            prose-strong:text-foreground
            prose-code:bg-muted prose-code:px-1 prose-code:rounded
          ">
            <ReactMarkdown>{cam.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
