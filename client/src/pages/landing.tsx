import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, BrainCircuit, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-2xl tracking-tight">Intelli<span className="text-primary">Credit</span></span>
        </div>
        <Button 
          onClick={() => window.location.href = "/api/login"}
          className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          Login
        </Button>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-6 flex flex-col justify-center items-center text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
            <BrainCircuit className="w-4 h-4" />
            AI-Powered Corporate Decisioning
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            The Future of <br/>
            <span className="text-gradient">Credit Risk Analysis</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate financial extraction, generate instant Credit Approval Memos (CAMs), and assess risk with explainable AI. Make faster, safer lending decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
              className="rounded-xl px-8 h-14 text-lg shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl"
        >
          <FeatureCard 
            icon={<FileText className="w-6 h-6" />}
            title="Automated CAMs"
            desc="Generate comprehensive Credit Approval Memos in seconds instead of days."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6" />}
            title="Real-time Risk Scores"
            desc="Multi-dimensional risk assessment grading with probability of default."
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6" />}
            title="AI Analyst Chat"
            desc="Query financial documents naturally to uncover hidden insights and anomalies."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-primary/20 transition-all text-left group">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
