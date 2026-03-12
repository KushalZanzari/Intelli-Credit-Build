import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CamReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCamReport(companyId: number) {
  return useQuery<CamReport | null>({
    queryKey: [`/api/companies/${companyId}/cam`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/cam`);
      if (!res.ok) throw new Error("Failed to fetch CAM report");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useGenerateCam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyId: number) => {
      const res = await fetch(`/api/companies/${companyId}/cam/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to generate CAM report");
      return res.json() as Promise<CamReport>;
    },
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/cam`] });
      toast({ title: "CAM Generated", description: "Credit Appraisal Memo is ready for review." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
