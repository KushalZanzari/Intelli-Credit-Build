import { useCreateCompany } from "@/hooks/use-companies";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Building2, ArrowLeft } from "lucide-react";

export default function CreateCompany() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCompany();
  const [formData, setFormData] = useState({ name: "", cin: "", industry: "", address: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    createMutation.mutate(formData, {
      onSuccess: (data) => {
        setLocation(`/companies/${data.id}`);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setLocation("/companies")} className="text-muted-foreground -ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Companies
      </Button>

      <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-premium"></div>
        <CardHeader className="px-8 pt-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-display font-bold">Add New Company</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Enter basic details to create a new profile for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">Company Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Acme Corp"
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cin" className="text-foreground font-semibold">CIN Number</Label>
                <Input 
                  id="cin" 
                  value={formData.cin}
                  onChange={e => setFormData({...formData, cin: e.target.value})}
                  placeholder="e.g. L12345MH2000PLC123456"
                  className="h-12 rounded-xl bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-foreground font-semibold">Industry</Label>
                <Input 
                  id="industry" 
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g. Manufacturing"
                  className="h-12 rounded-xl bg-muted/30 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground font-semibold">Registered Address</Label>
              <Input 
                id="address" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Full address..."
                className="h-12 rounded-xl bg-muted/30 border-border/50"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={createMutation.isPending || !formData.name}
                className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {createMutation.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
