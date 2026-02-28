import { useDocuments, useUploadDocument } from "@/hooks/use-documents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud, CheckCircle2, FileJson } from "lucide-react";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function DocumentsTab({ companyId }: { companyId: number }) {
  const { data: documents, isLoading } = useDocuments(companyId);
  const uploadMutation = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("bank");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ companyId, file, type: docType });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Document Repository</h2>
          <p className="text-sm text-muted-foreground mt-1">Upload files for AI extraction and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Statement</SelectItem>
              <SelectItem value="gst">GST Returns</SelectItem>
              <SelectItem value="itr">ITR</SelectItem>
              <SelectItem value="financials">Audited Financials</SelectItem>
            </SelectContent>
          </Select>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.csv,.xlsx" />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploadMutation.isPending}
            className="rounded-xl shadow-md"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">Loading documents...</div>
        ) : documents?.length === 0 ? (
           <div className="col-span-full py-16 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
            <FileJson className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          </div>
        ) : (
          documents?.map((doc) => (
            <Card key={doc.id} className="rounded-2xl hover:shadow-md transition-all border-border/50 group">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex flex-shrink-0 items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate" title={doc.filename}>{doc.filename}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{doc.type}</Badge>
                    <span className="text-xs text-muted-foreground">{doc.uploadedAt ? format(new Date(doc.uploadedAt), "MMM d, yyyy") : ''}</span>
                  </div>
                </div>
                {doc.status === 'processed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
