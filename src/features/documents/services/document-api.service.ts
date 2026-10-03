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
    // fallow-ignore-next-line security-sink
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return true;
  },

  async deleteAllDocuments(): Promise<boolean> {
    const res = await fetch("/api/documents", { method: "DELETE" });
    if (!res.ok) throw new Error("Delete all documents failed");
    return true;
  },

  async reprocessDocument(id: string): Promise<boolean> {
    // fallow-ignore-next-line security-sink
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}/reprocess`, { method: "POST" });
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
    // fallow-ignore-next-line security-sink
    const res = await fetch(`/api/documents/${encodeURIComponent(id)}/favorite`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to toggle favorite (${res.status})`);
    return res.json();
  },

  async uploadFile(
    file: File,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<{ documentId: string; signedUrl: string }> {
    const urlRes = await fetch("/api/documents/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        fileSize: file.size,
      }),
    });

    if (!urlRes.ok) {
      let errDetail = "Failed to prepare upload";
      try {
        const errData = await urlRes.json();
        if (errData.error) errDetail = errData.error;
      } catch {
        // ignore
      }
      throw new Error(errDetail);
    }

    const { documentId, signedUrl } = await urlRes.json();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.onprogress = onProgress;
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Storage upload failed (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.ontimeout = () => reject(new Error("Upload timed out"));

      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/pdf");
      xhr.send(file);
    });

    return { documentId, signedUrl };
  },
};
