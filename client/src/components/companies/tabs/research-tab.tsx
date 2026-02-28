import { useResearch } from "@/hooks/use-research";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Send, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ResearchTab({ companyId }: { companyId: number }) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<{role: 'user'|'assistant', text: string}[]>([]);
  const researchMutation = useResearch();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || researchMutation.isPending) return;

    const userText = query;
    setHistory(prev => [...prev, { role: 'user', text: userText }]);
    setQuery("");

    researchMutation.mutate({ companyId, query: userText }, {
      onSuccess: (data) => {
        setHistory(prev => [...prev, { role: 'assistant', text: data.result }]);
      }
    });
  };

  return (
    <Card className="border-border/50 shadow-md rounded-2xl flex flex-col h-[70vh] overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">AI Research Analyst</h3>
          <p className="text-xs text-muted-foreground">Ask questions about financials, documents, or market conditions.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">I've analyzed the documents and financials.</p>
            <p>What would you like to know?</p>
          </div>
        )}

        <AnimatePresence>
          {history.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border border-border/50'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted/50 border border-border/50 text-foreground rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {researchMutation.isPending && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-muted text-foreground border border-border/50 flex items-center justify-center">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="max-w-[80%] rounded-2xl p-4 bg-muted/50 border border-border/50 text-foreground rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: '0.2s'}} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: '0.4s'}} />
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-background border-t border-border/50">
        <form onSubmit={handleSubmit} className="relative">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about revenue trends, risks, or query documents..."
            className="w-full h-14 pl-6 pr-14 rounded-2xl bg-muted/30 border-border/50 focus-visible:ring-primary focus-visible:border-primary"
            disabled={researchMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-xl shadow-md"
            disabled={!query.trim() || researchMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
