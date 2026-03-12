import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDocuments(companyId: number) {
  return useQuery<Document[]>({
    queryKey: [`/api/companies/${companyId}/documents`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!companyId,
    refetchInterval: (query) => {
      const data = query.state.data as Document[] | undefined;
      if (data?.some((d) => d.status === "analyzing")) return 3000;
      return false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, file, type }: { companyId: number; file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch(`/api/companies/${companyId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${variables.companyId}/documents`] });
      toast({ title: "Uploaded", description: "AI is now parsing the document..." });
    },
    onError: (err) => {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    },
  });
}
