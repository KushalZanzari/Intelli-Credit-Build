import { useCompanies } from "@/hooks/use-companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Activity, FileCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: companies, isLoading } = useCompanies();

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><Building2 className="w-12 h-12 text-muted-foreground mb-4"/>Loading intelligence...</div></div>;
  }

  const totalCompanies = companies?.length || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back. Here is today's portfolio snapshot.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/companies/new">Add New Company</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Portfolio" 
          value={totalCompanies.toString()} 
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
          trend="+3 this month"
          delay={0}
        />
        <StatCard 
          title="High Risk Assets" 
          value="2" 
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          trend="Needs review"
          delay={0.1}
        />
        <StatCard 
          title="Avg PD Rate" 
          value="1.2%" 
          icon={<Activity className="w-5 h-5 text-yellow-500" />}
          trend="-0.4% vs last qtr"
          delay={0.2}
        />
        <StatCard 
          title="CAMs Generated" 
          value="124" 
          icon={<FileCheck className="w-5 h-5 text-green-500" />}
          trend="+12 this week"
          delay={0.3}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-display font-bold mb-6">Recent Additions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies?.slice(0, 3).map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
            >
              <Link href={`/companies/${company.id}`} className="block">
                <Card className="hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full group bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold truncate">{company.name}</h3>
                    <p className="text-muted-foreground mt-1">{company.industry || 'Unknown Industry'}</p>
                    <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                      View Analysis &rarr;
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {companies?.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No companies yet</h3>
              <p className="text-muted-foreground mb-4">Add your first company to start analysis.</p>
              <Button asChild variant="outline" className="rounded-xl"><Link href="/companies/new">Add Company</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border/50 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{trend}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
