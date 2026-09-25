import { Document, DocumentStatusDto } from "@/types";

export const documentApiService = {
  async fetchDocuments(): Promise<Document[]> {
    const res = await fetch("/api/documents");
    if (!res.ok) {
      if (res.status === 401) return [];
      throw new Error(`Failed to fetch documents (${res.status})`);
    }
    return res.json();
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return true;
  },

  async deleteAllDocuments(): Promise<boolean> {
    const res = await fetch("/api/documents", { method: "DELETE" });
    if (!res.ok) throw new Error("Delete all documents failed");
    return true;
  },

  async reprocessDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}/reprocess`, { method: "POST" });
    if (!res.ok) throw new Error("Reprocess failed");
    return true;
  },

  async checkDocumentStatus(id: string): Promise<DocumentStatusDto | null> {
    const res = await fetch("/api/documents/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: [id] }),
    });

    if (!res.ok) return null;

    const data: { statuses?: DocumentStatusDto[] } = await res.json();
    return data.statuses?.[0] || null;
  },

  async toggleFavorite(id: string): Promise<{ success: boolean; isFavorite: boolean }> {
    const res = await fetch(`/api/documents/${id}/favorite`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to toggle favorite (${res.status})`);
    return res.json();
  },
};
