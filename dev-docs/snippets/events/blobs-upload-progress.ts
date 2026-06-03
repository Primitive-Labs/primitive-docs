import type { JsBaoClient } from "js-bao-wss-client";

// Fires repeatedly as a queued blob upload makes progress.
export function blobsUploadProgress(client: JsBaoClient) {
  // #region example
  client.on("blobs:upload-progress", (payload) => {
    console.log(payload.blobId, payload.status, `${payload.numBytes} bytes`);
  });
  // #endregion example
}
