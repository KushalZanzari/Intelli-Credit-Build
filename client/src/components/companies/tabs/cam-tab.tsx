import { useCamReport, useGenerateCam } from "@/hooks/use-cam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function CamTab({ companyId }: { companyId: number }) {
  const { data: cam, isLoading } = useCamReport(companyId);
  const generateMutation = useGenerateCam();

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading CAM Report...</div>;

  if (!cam) {
    return (
      <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No CAM Report</h2>
        <p className="text-muted-foreground mb-8">Generate a comprehensive, ready-to-present Credit Approval Memo using our AI engine.</p>
        <Button 
          size="lg" 
          onClick={() => generateMutation.mutate(companyId)}
          disabled={generateMutation.isPending}
          className="rounded-xl shadow-xl shadow-primary/20 text-lg px-8 h-14"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          {generateMutation.isPending ? "Drafting Memo..." : "Auto-Draft CAM"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary"/> Credit Approval Memo
          </h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => generateMutation.mutate(companyId)} disabled={generateMutation.isPending} className="rounded-xl">
            <Wand2 className="w-4 h-4 mr-2" /> Regenerate
          </Button>
          <Button className="rounded-xl shadow-md">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-lg bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="prose prose-slate dark:prose-invert max-w-none p-8 md:p-12">
            <ReactMarkdown>{cam.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
