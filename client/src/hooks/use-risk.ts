import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RiskScore } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useRiskScore(companyId: number) {
  return useQuery<RiskScore | null>({
    queryKey: [`/api/companies/${companyId}/risk`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/risk`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch risk score");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useGenerateRiskScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyId: number) => {
      const res = await fetch(`/api/companies/${companyId}/risk/generate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate risk score");
      return res.json();
    },
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/risk`] });
      toast({ title: "Analysis Complete", description: "New risk score generated." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
