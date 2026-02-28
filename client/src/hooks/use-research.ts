import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useResearch() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, query }: { companyId: number; query: string }) => {
      const res = await fetch(`/api/companies/${companyId}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Research query failed");
      return res.json();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
