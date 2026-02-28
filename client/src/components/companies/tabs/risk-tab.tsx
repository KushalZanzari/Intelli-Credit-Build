import { useRiskScore, useGenerateRiskScore } from "@/hooks/use-risk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ShieldAlert, Zap, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function RiskTab({ companyId }: { companyId: number }) {
  const { data: risk, isLoading } = useRiskScore(companyId);
  const generateMutation = useGenerateRiskScore();

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading risk data...</div>;

  const getRiskColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'text-[hsl(var(--risk-a))]';
      case 'B': return 'text-[hsl(var(--risk-b))]';
      case 'C': return 'text-[hsl(var(--risk-c))]';
      case 'D': return 'text-[hsl(var(--risk-d))]';
      default: return 'text-primary';
    }
  };
  
  const getRiskBg = (grade: string) => {
    switch(grade) {
      case 'A': return 'bg-[hsl(var(--risk-a))]/10 border-[hsl(var(--risk-a))]/20';
      case 'B': return 'bg-[hsl(var(--risk-b))]/10 border-[hsl(var(--risk-b))]/20';
      case 'C': return 'bg-[hsl(var(--risk-c))]/10 border-[hsl(var(--risk-c))]/20';
      case 'D': return 'bg-[hsl(var(--risk-d))]/10 border-[hsl(var(--risk-d))]/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  if (!risk) {
    return (
      <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Activity className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Risk Assessment Found</h2>
        <p className="text-muted-foreground mb-8">Run the AI engine over the financial data and documents to generate a comprehensive risk profile.</p>
        <Button 
          size="lg" 
          onClick={() => generateMutation.mutate(companyId)}
          disabled={generateMutation.isPending}
          className="rounded-xl shadow-xl shadow-primary/20 text-lg px-8 h-14"
        >
          <Zap className="w-5 h-5 mr-2" />
          {generateMutation.isPending ? "Analyzing..." : "Generate Risk Score"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Credit Risk Assessment</h2>
        <Button 
          variant="outline"
          onClick={() => generateMutation.mutate(companyId)}
          disabled={generateMutation.isPending}
          className="rounded-xl shadow-sm"
        >
          <Zap className="w-4 h-4 mr-2" /> Re-evaluate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big Score Card */}
        <motion.div initial={{scale: 0.9, opacity:0}} animate={{scale:1, opacity:1}} className="md:col-span-1">
          <Card className={`h-full border-2 rounded-3xl overflow-hidden ${getRiskBg(risk.grade)}`}>
            <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">IntelliScore</div>
              <div className={`text-8xl font-display font-black leading-none mb-2 ${getRiskColor(risk.grade)}`}>
                {risk.score}
              </div>
              <div className={`text-3xl font-bold ${getRiskColor(risk.grade)}`}>Grade {risk.grade}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Cards */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-premium"></div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Probability of Default (PD)</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">{(Number(risk.probabilityOfDefault || 0)).toFixed(2)}%</div>
                  <p className="text-sm text-muted-foreground">Estimated probability of default within the next 12 months based on current financial trajectories.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary"/> Financial Health</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{risk.financialHealth || "No analysis provided."}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-500"/> Fraud Risk</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{risk.fraudRisk || "No red flags detected."}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm mt-6">
        <CardContent className="p-6">
           <h3 className="font-bold text-lg mb-3">Executive Summary</h3>
           <p className="text-foreground leading-relaxed">{risk.explanation}</p>
        </CardContent>
      </Card>
    </div>
  );
}
