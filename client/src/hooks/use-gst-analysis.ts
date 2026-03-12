import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GstAnalysis } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useGstAnalysis(companyId: number) {
  return useQuery<GstAnalysis | null>({
    queryKey: [`/api/companies/${companyId}/gst-analysis`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/gst-analysis`);
      if (!res.ok) throw new Error("Failed to fetch GST analysis");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useRunGstAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId }: { companyId: number }) => {
      const res = await fetch(`/api/companies/${companyId}/gst-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("GST analysis failed");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/gst-analysis`] });
      toast({ title: "GST Analysis Complete", description: "Cross-verification report generated." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
