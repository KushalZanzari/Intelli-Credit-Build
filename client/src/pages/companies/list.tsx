import { useCompanies } from "@/hooks/use-companies";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Search, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function CompaniesList() {
  const { data: companies, isLoading } = useCompanies();
  const [search, setSearch] = useState("");

  const filtered = companies?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.cin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold">Companies</h1>
          <p className="text-muted-foreground mt-2">Manage and analyze your corporate portfolio.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/companies/new"><Plus className="w-4 h-4 mr-2"/> Add Company</Link>
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or CIN..." 
              className="pl-10 bg-background border-border/50 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Company Details</TableHead>
              <TableHead className="font-semibold text-foreground">CIN</TableHead>
              <TableHead className="font-semibold text-foreground">Industry</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No companies found.</TableCell>
              </TableRow>
            ) : (
              filtered?.map((company) => (
                <TableRow key={company.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-base text-foreground font-bold">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{company.cin || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-lg bg-secondary text-secondary-foreground font-medium">
                      {company.industry || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" asChild className="rounded-xl text-primary hover:text-primary hover:bg-primary/10">
                      <Link href={`/companies/${company.id}`}>
                        Analyze <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
