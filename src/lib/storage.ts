import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

let _client: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient {
  if (_client) return _client;

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables"
    );
  }

  // Strip trailing slashes and any accidentally appended API paths (e.g. /rest/v1)
  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

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
 * Create a signed upload URL for direct browser-to-storage uploads.
 * The URL is valid for 2 hours (Supabase default).
 */
export async function createSignedUploadUrl(
  userId: string,
  originalName: string
): Promise<{ filePath: string; signedUrl: string; token: string }> {
  const client = getStorageClient();
  const bucket = getBucket();
  const fileId = crypto.randomUUID();
  const filePath = `${userId}/${fileId}.pdf`;

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message}`);
  }

  return {
    filePath,
    signedUrl: data.signedUrl,
    token: data.token,
  };
}

/**
 * Verify that a file exists in storage (used to confirm client-side upload succeeded).
 */
export async function verifyFileExists(filePath: string): Promise<boolean> {
  try {
    if (!filePath || typeof filePath !== "string") return false;

    const client = getStorageClient();
    const bucket = getBucket();

    const lastSlashIndex = filePath.lastIndexOf("/");
    const folder = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : "";
    const filename = lastSlashIndex !== -1 ? filePath.substring(lastSlashIndex + 1) : filePath;

    // List with search prefix — confirm exact filename exists
    const { data, error } = await client.storage
      .from(bucket)
      .list(folder, {
        search: filename,
        limit: 10,
      });

    if (error || !Array.isArray(data)) return false;
    return data.some((item) => item.name === filename);
  } catch (err) {
    logger.warn("storage.verify_file_exists_failed", {
      filePath,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Build the public URL for a given storage path.
 */
export function getPublicUrl(filePath: string): string {
  const client = getStorageClient();
  const bucket = getBucket();

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
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
