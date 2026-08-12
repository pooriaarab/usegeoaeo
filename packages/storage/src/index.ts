export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB default limit

export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
];

/**
 * Builds the object key for R2 uploads.
 * Key structure: `uploads/{workspaceId|userId}/{uploadId}/{filename}`
 */
export function buildUploadKey(
  ownerId: string,
  uploadId: string,
  filename: string
): string {
  // Clean filename to prevent path traversal or issues
  const cleanFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `uploads/${ownerId}/${uploadId}/${cleanFilename}`;
}

/**
 * Returns the public app URL for downloading an upload content.
 */
export function getPublicUrl(uploadId: string): string {
  return `/api/v1/uploads/${uploadId}/content`;
}

/**
 * Puts an object in R2 bucket.
 */
export async function putObject(
  bucket: R2Bucket,
  key: string,
  value: ReadableStream | ArrayBuffer | string | Blob,
  options?: R2PutOptions
): Promise<R2Object> {
  const obj = await bucket.put(key, value, options);
  if (!obj) {
    throw new Error(`Failed to upload object to R2 for key: ${key}`);
  }
  return obj;
}

/**
 * Gets an object from R2 bucket.
 */
export async function getObject(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

/**
 * Deletes an object from R2 bucket.
 */
export async function deleteObject(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * Performs a head operation on an object in R2 bucket.
 */
export async function headObject(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return await bucket.head(key);
}
