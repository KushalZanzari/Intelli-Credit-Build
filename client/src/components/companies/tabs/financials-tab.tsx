import { useFinancials, useCreateFinancial } from "@/hooks/use-financials";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";
import { Plus } from "lucide-react";

export function FinancialsTab({ companyId }: { companyId: number }) {
  const { data: financials, isLoading } = useFinancials(companyId);
  const createMutation = useCreateFinancial();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    revenue: "", ebitda: "", netProfit: "", totalDebt: "", equity: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      companyId,
      data: {
        year: Number(formData.year),
        revenue: formData.revenue,
        ebitda: formData.ebitda,
        netProfit: formData.netProfit,
        totalDebt: formData.totalDebt,
        equity: formData.equity,
      }
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ year: new Date().getFullYear(), revenue: "", ebitda: "", netProfit: "", totalDebt: "", equity: "" });
      }
    });
  };

  const sortedData = [...(financials || [])].sort((a, b) => a.year - b.year);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading financial data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Financial Performance</h2>
          <p className="text-muted-foreground">Historical metrics and ratios</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="rounded-xl shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Year Data
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5 rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Year</Label><Input type="number" value={formData.year} onChange={e=>setFormData({...formData, year: Number(e.target.value)})} required /></div>
              <div className="space-y-1"><Label>Revenue (₹)</Label><Input type="number" step="0.01" value={formData.revenue} onChange={e=>setFormData({...formData, revenue: e.target.value})} required /></div>
              <div className="space-y-1"><Label>EBITDA (₹)</Label><Input type="number" step="0.01" value={formData.ebitda} onChange={e=>setFormData({...formData, ebitda: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Net Profit (₹)</Label><Input type="number" step="0.01" value={formData.netProfit} onChange={e=>setFormData({...formData, netProfit: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Total Debt (₹)</Label><Input type="number" step="0.01" value={formData.totalDebt} onChange={e=>setFormData({...formData, totalDebt: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Equity (₹)</Label><Input type="number" step="0.01" value={formData.equity} onChange={e=>setFormData({...formData, equity: e.target.value})} required /></div>
              <div className="col-span-full pt-2 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl">
                  {createMutation.isPending ? "Saving..." : "Save Financials"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Revenue & Profitability</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                  <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="hsl(var(--risk-a))" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Debt vs Equity</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted)/0.4)'}} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="totalDebt" name="Total Debt" fill="hsl(var(--risk-c))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="equity" name="Equity" fill="hsl(240 80% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No financial data available. Add historical data to view charts.</p>
        </div>
      )}
    </div>
  );
}
