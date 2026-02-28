import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Financial, InsertFinancial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useFinancials(companyId: number) {
  return useQuery<Financial[]>({
    queryKey: [`/api/companies/${companyId}/financials`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/financials`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch financials");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useCreateFinancial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, data }: { companyId: number; data: Omit<InsertFinancial, 'companyId'> }) => {
      const res = await fetch(`/api/companies/${companyId}/financials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add financial data");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/financials`] });
      toast({ title: "Success", description: "Financial data added." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
