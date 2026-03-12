import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QualitativeNote } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useQualitativeNotes(companyId: number) {
  return useQuery<QualitativeNote[]>({
    queryKey: [`/api/companies/${companyId}/qualitative-notes`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/qualitative-notes`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useAddQualitativeNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, note, category }: { companyId: number; note: string; category: string }) => {
      const res = await fetch(`/api/companies/${companyId}/qualitative-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, category }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/qualitative-notes`] });
      toast({
        title: "Note Saved",
        description: `Score impact: ${data.scoreImpact > 0 ? "+" : ""}${data.scoreImpact} points`,
      });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteQualitativeNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, noteId }: { companyId: number; noteId: number }) => {
      const res = await fetch(`/api/companies/${companyId}/qualitative-notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/qualitative-notes`] });
      toast({ title: "Note removed" });
    },
  });
}
