import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WebResearch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useWebResearch(companyId: number) {
  return useQuery<WebResearch[]>({
    queryKey: [`/api/companies/${companyId}/web-research`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/web-research`);
      if (!res.ok) throw new Error("Failed to fetch research");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useRunWebResearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId }: { companyId: number }) => {
      const res = await fetch(`/api/companies/${companyId}/web-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchType: "all" }),
      });
      if (!res.ok) throw new Error("Research failed");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/web-research`] });
      toast({ title: "Research Complete", description: "Secondary research report generated." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
