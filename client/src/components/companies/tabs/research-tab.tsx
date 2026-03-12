import { useResearch } from "@/hooks/use-research";
import { useWebResearch, useRunWebResearch } from "@/hooks/use-web-research";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BrainCircuit, Send, User, Bot, Globe, Search, AlertTriangle, 
  CheckCircle2, TrendingDown, TrendingUp, Newspaper, RefreshCw, Scale
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const RISK_COLORS: Record<string, string> = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-red-600 bg-red-50 border-red-200",
};

function RiskBadge({ level }: { level?: string }) {
  if (!level) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${RISK_COLORS[level] || RISK_COLORS.low}`}>
      {level === "high" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
      {level?.toUpperCase()}
    </span>
  );
}

function WebResearchPanel({ companyId }: { companyId: number }) {
  const { data: researchList, isLoading } = useWebResearch(companyId);
  const runMutation = useRunWebResearch();

  const latest = researchList?.[0];
  const findings = latest?.findings as any;

  if (isLoading) return <div className="py-10 text-center animate-pulse text-muted-foreground">Loading research...</div>;

  if (!latest) {
    return (
      <div className="py-16 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Secondary Research Agent</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Automatically crawl for promoter backgrounds, litigation history, sector headwinds, regulatory changes, and credit bureau signals.
        </p>
        <Button onClick={() => runMutation.mutate({ companyId })} disabled={runMutation.isPending} className="rounded-xl shadow-md">
          <Search className="w-4 h-4 mr-2" />
          {runMutation.isPending ? "Researching..." : "Run Web Research"}
        </Button>
        {runMutation.isPending && (
          <p className="text-xs text-muted-foreground mt-3 animate-pulse">Searching promoter records, news, regulatory filings, credit signals...</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Secondary Research Report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generated {latest.createdAt ? format(new Date(latest.createdAt), "d MMM yyyy, h:mm a") : "recently"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => runMutation.mutate({ companyId })} disabled={runMutation.isPending} className="rounded-xl">
          <RefreshCw className={`w-4 h-4 mr-2 ${runMutation.isPending ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {latest.summary && (
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Summary: </span>{latest.summary}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Promoter Background */}
        {findings?.promoterBackground && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> Promoter Background</span>
                <RiskBadge level={findings.promoterBackground.riskLevel} />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              <p className="text-sm text-muted-foreground">{findings.promoterBackground.summary}</p>
              {findings.promoterBackground.findings?.map((f: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {f}
                </div>
              ))}
              {findings.promoterBackground.litigationHistory?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1"><Scale className="w-3 h-3" /> Litigation:</p>
                  {findings.promoterBackground.litigationHistory.map((l: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" /> {l}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sector Headwinds */}
        {findings?.sectorHeadwinds && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-orange-500" /> Sector Headwinds</span>
                <RiskBadge level={findings.sectorHeadwinds.riskLevel} />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground">{findings.sectorHeadwinds.summary}</p>
              {findings.sectorHeadwinds.regulatoryChanges?.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
              {findings.sectorHeadwinds.marketTrends?.map((t: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <TrendingUp className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Company News */}
        {findings?.companyNews && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2"><Newspaper className="w-4 h-4 text-purple-500" /> Recent News</span>
                <RiskBadge level={findings.companyNews.riskLevel} />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2">
              {findings.companyNews.recentNews?.map((n: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.sentiment === "positive" ? "bg-green-500" : n.sentiment === "negative" ? "bg-red-500" : "bg-gray-400"}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground font-medium leading-snug">{n.headline}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Credit Bureau */}
        {findings?.creditBureauSignals && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-teal-500" /> Credit Bureau Signals</span>
                <RiskBadge level={findings.creditBureauSignals.riskLevel} />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2 text-sm">
              {[
                ["Existing Loans", findings.creditBureauSignals.existingLoans],
                ["Repayment History", findings.creditBureauSignals.repaymentHistory],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-muted-foreground min-w-36">{label}:</span>
                  <span className="font-medium text-foreground capitalize">{val as string}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Risk Signals */}
      {(latest.riskSignals as string[])?.length > 0 && (
        <Card className="rounded-2xl border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Overall Risk Signals</p>
            <div className="flex flex-wrap gap-2">
              {(latest.riskSignals as string[]).map((s, i) => (
                <span key={i} className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-lg px-2 py-1">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResearchChat({ companyId }: { companyId: number }) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const researchMutation = useResearch();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || researchMutation.isPending) return;
    const userText = query;
    setHistory(prev => [...prev, { role: "user", text: userText }]);
    setQuery("");
    researchMutation.mutate({ companyId, query: userText }, {
      onSuccess: (data) => setHistory(prev => [...prev, { role: "assistant", text: data.result }]),
    });
  };

  const SUGGESTIONS = [
    "What are the key credit risks for this company?",
    "Calculate DSCR based on available financials",
    "What is the working capital requirement?",
    "Are there any sector-specific RBI guidelines I should check?",
    "Summarize the red flags from all data sources",
  ];

  return (
    <div className="flex flex-col h-[65vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">AI Credit Analyst</p>
              <p className="text-sm text-muted-foreground mt-1">Ask anything about this company's credit profile</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)} className="text-xs bg-muted/50 hover:bg-muted border border-border/50 rounded-xl px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {history.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"}`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 border border-border/50 rounded-tl-none"}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {researchMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none p-3 flex items-center gap-1">
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-border/30 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask about revenue trends, DSCR, risk factors, regulations..."
            className="flex-1 h-12 rounded-xl bg-muted/30 border-border/50"
            disabled={researchMutation.isPending}
            data-testid="input-research-query"
          />
          <Button type="submit" size="icon" className="h-12 w-12 rounded-xl" disabled={!query.trim() || researchMutation.isPending} data-testid="button-send-research">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function ResearchTab({ companyId }: { companyId: number }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="chat">
        <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/40">
          <TabsTrigger value="chat" className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BrainCircuit className="w-4 h-4 mr-2" /> AI Chat
          </TabsTrigger>
          <TabsTrigger value="web" className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4 mr-2" /> Web Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4 focus-visible:outline-none">
          <Card className="border-border/50 rounded-2xl overflow-hidden">
            <ResearchChat companyId={companyId} />
          </Card>
        </TabsContent>

        <TabsContent value="web" className="mt-4 focus-visible:outline-none">
          <WebResearchPanel companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
