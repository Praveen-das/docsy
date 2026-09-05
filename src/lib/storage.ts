import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables"
    );
  }

  _client = createClient(url, key);
  return _client;
}

function getBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "documents";
}

/**
 * Upload a PDF file to Supabase Storage.
 * Files are organized under `{userId}/{uuid}.pdf` for per-user isolation.
 */
export async function uploadPdf(
  userId: string,
  fileBuffer: Buffer,
  originalName: string
): Promise<{ filePath: string; publicUrl: string }> {
  const client = getStorageClient();
  const bucket = getBucket();
  const fileId = crypto.randomUUID();
  const filePath = `${userId}/${fileId}.pdf`;

  const { error } = await client.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Get a signed URL for secure, time-limited access to a stored PDF.
 */
export async function getSignedPdfUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getStorageClient();
  const bucket = getBucket();

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Download a PDF's raw buffer from storage (used by processing pipeline).
 */
export async function downloadPdf(filePath: string): Promise<Buffer> {
  const client = getStorageClient();
  const bucket = getBucket();

  const { data, error } = await client.storage
    .from(bucket)
    .download(filePath);

  if (error || !data) {
    throw new Error(`Storage download failed: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Delete a PDF from storage.
 */
export async function deletePdf(filePath: string): Promise<void> {
  const client = getStorageClient();
  const bucket = getBucket();

  const { error } = await client.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
