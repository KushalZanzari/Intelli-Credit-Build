import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, InsertCompany } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });
}

export function useCompany(id: number) {
  return useQuery<Company>({
    queryKey: [`/api/companies/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch company");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Success", description: "Company added successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
