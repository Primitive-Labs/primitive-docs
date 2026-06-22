import type { JsBaoClient } from "js-bao-wss-client";

// Subscribe to the blob upload-queue lifecycle events. `upload-progress` fires
// on status transitions (not per-byte) — there is no per-byte progress callback.
export function wireBlobEvents(client: JsBaoClient) {
  // #region example
  // status is one of: "queued" | "uploading" | "pending" | "paused"
  client.on("blobs:upload-progress", (e) => {
    console.log(e.queueId, e.blobId, e.status, e.numBytes, e.attempts);
  });

  client.on("blobs:upload-completed", (e) => {
    console.log("done", e.blobId, e.queueId);
  });

  client.on("blobs:upload-failed", (e) => {
    console.log("failed", e.blobId, e.lastError, "retry?", e.willRetry);
  });
  // #endregion example
}
