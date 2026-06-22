import type { JsBaoClient } from "js-bao-wss-client";

// Inspect and control the per-document upload queue. The queue is keyed by user
// identity, retries with exponential backoff, and persists across reloads.
// Concurrency is a client-wide setting (applies to all documents).
export function manageUploadQueue(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  // Inspect what's queued for this document. Each task carries queueId, blobId,
  // filename, contentType, numBytes, status, attempts, nextAttemptAt, lastError.
  const tasks = blobs.uploads();

  // Pause/resume by blobId (the queueId is the blobId for document uploads).
  blobs.pauseUpload(blobId);
  blobs.resumeUpload(blobId);

  blobs.pauseAll();
  blobs.resumeAll();

  // Concurrency is set on the client (global, all documents).
  client.setBlobUploadConcurrency(5); // min 1; default 2
  const concurrency = client.getBlobUploadConcurrency();
  // #endregion example
  return { tasks, concurrency };
}
