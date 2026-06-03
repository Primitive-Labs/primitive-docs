import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a queued blob upload finishes successfully.
export function blobsUploadCompleted(client: JsBaoClient) {
  // #region example
  client.on("blobs:upload-completed", (payload) => {
    console.log("uploaded", payload.blobId, payload.filename);
  });
  // #endregion example
}
