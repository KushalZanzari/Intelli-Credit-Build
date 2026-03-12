import { useRiskScore, useGenerateRiskScore } from "@/hooks/use-risk";
import { useQualitativeNotes, useAddQualitativeNote, useDeleteQualitativeNote } from "@/hooks/use-qualitative-notes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, ShieldAlert, Zap, AlertTriangle, Brain, PlusCircle, Trash2, TrendingUp, TrendingDown, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

const NOTE_CATEGORIES = [
  { value: "management", label: "Management Quality" },
  { value: "operations", label: "Operations" },
  { value: "market", label: "Market/Sector" },
  { value: "legal", label: "Legal/Compliance" },
  { value: "general", label: "General" },
];

const GRADE_COLORS: Record<string, { text: string, bg: string, border: string }> = {
  A: { text: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800" },
  B: { text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  C: { text: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  D: { text: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
};

function ScoreBar({ score, label, max = 100 }: { score: number, label: string, max?: number }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-bold text-foreground">{score}/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function RiskTab({ companyId }: { companyId: number }) {
  const { data: risk, isLoading: riskLoading } = useRiskScore(companyId);
  const { data: notes, isLoading: notesLoading } = useQualitativeNotes(companyId);
  const generateMutation = useGenerateRiskScore();
  const addNoteMutation = useAddQualitativeNote();
  const deleteNoteMutation = useDeleteQualitativeNote();

  const [newNote, setNewNote] = useState("");
  const [noteCategory, setNoteCategory] = useState("general");

  if (riskLoading || notesLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading risk data...</div>;

  const grade = risk?.grade || "B";
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.B;
  const baseScore = risk?.score || 0;
  const finalScore = risk?.adjustedScore || risk?.score || 0;
  const totalQualImpact = notes?.reduce((sum, n) => sum + (n.scoreImpact || 0), 0) || 0;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate({ companyId, note: newNote, category: noteCategory }, {
      onSuccess: () => setNewNote(""),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credit Risk Assessment</h2>
        <Button
          variant="outline"
          onClick={() => generateMutation.mutate(companyId)}
          disabled={generateMutation.isPending}
          className="rounded-xl"
        >
          <Zap className={`w-4 h-4 mr-2 ${generateMutation.isPending ? "animate-pulse" : ""}`} />
          {generateMutation.isPending ? "Analyzing..." : risk ? "Re-evaluate" : "Generate Score"}
        </Button>
      </div>

      {!risk && !generateMutation.isPending && (
        <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Activity className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Risk Assessment Yet</h2>
          <p className="text-muted-foreground mb-4">Add qualitative notes below, then generate a comprehensive AI risk score incorporating all factors.</p>
        </div>
      )}

      {risk && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className={`h-full rounded-3xl border-2 ${colors.bg} ${colors.border}`}>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">IntelliScore</div>
                <div className={`text-8xl font-black leading-none mb-1 ${colors.text}`}>{finalScore}</div>
                <div className={`text-3xl font-bold ${colors.text} mb-4`}>Grade {grade}</div>
                
                {baseScore !== finalScore && (
                  <div className="w-full space-y-2 mt-2">
                    <ScoreBar score={baseScore} label="Base (Financial)" />
                    <ScoreBar score={finalScore} label="Final (Adjusted)" />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                  {totalQualImpact > 0 ? (
                    <><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-green-600">+{totalQualImpact} qualitative</span></>
                  ) : totalQualImpact < 0 ? (
                    <><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-red-600">{totalQualImpact} qualitative</span></>
                  ) : (
                    <span className="text-muted-foreground text-xs">No qualitative adjustment</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Cards */}
          <div className="md:col-span-2 space-y-4">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Probability of Default (PD)</h3>
                  <div className="text-3xl font-bold text-foreground">{(Number(risk.probabilityOfDefault || 0)).toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">12-month forward-looking estimate</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Financial Health</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{risk.financialHealth || "Not assessed."}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-500" /> Fraud Risk</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{risk.fraudRisk || "No flags detected."}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {risk?.explanation && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold mb-2">Executive Summary</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{risk.explanation}</p>
          </CardContent>
        </Card>
      )}

      {risk?.decisionRationale && (
        <Card className="rounded-2xl border-l-4 border-primary bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Decision Rationale</h3>
            <p className="text-sm leading-relaxed text-foreground">{risk.decisionRationale}</p>
          </CardContent>
        </Card>
      )}

      {/* QUALITATIVE NOTES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-bold">Credit Officer Qualitative Notes</h3>
          <Badge variant="secondary" className="ml-auto">{notes?.length || 0} notes</Badge>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Add observations from site visits, interviews, or sector research. AI will calculate the score impact and factor it into the risk assessment.
        </p>

        {/* Add Note Form */}
        <Card className="rounded-2xl border-border/50 bg-card">
          <CardContent className="p-4 space-y-3">
            <Textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder='e.g. "Factory visited — operating at 40% capacity due to raw material shortage" or "Promoter has pending NCLT case for FY2019 MSME loan default"'
              className="rounded-xl min-h-[80px] resize-none bg-background"
              data-testid="input-qualitative-note"
            />
            <div className="flex gap-3 items-center justify-between flex-wrap">
              <Select value={noteCategory} onValueChange={setNoteCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="rounded-xl"
                data-testid="button-add-note"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {addNoteMutation.isPending ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <AnimatePresence>
          {notes?.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="rounded-xl border-border/40">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${(note.scoreImpact || 0) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {(note.scoreImpact || 0) > 0 ? "+" : ""}{note.scoreImpact}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{note.note}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] capitalize">{note.category}</Badge>
                      <span className="text-xs text-muted-foreground">{note.addedBy}</span>
                      {note.createdAt && <span className="text-xs text-muted-foreground">{format(new Date(note.createdAt), "d MMM yyyy")}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNoteMutation.mutate({ companyId, noteId: note.id })}
                    data-testid={`button-delete-note-${note.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes?.length === 0 && (
          <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">No qualitative notes yet. Add observations to refine the AI risk score.</p>
          </div>
        )}
      </div>
    </div>
  );
}
