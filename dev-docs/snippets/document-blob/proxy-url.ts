import type { JsBaoClient } from "js-bao-wss-client";

export function proxyUrl(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // Service-worker-proxied URL, handy for inline display without leaking the token.
  const url = blobs.proxyUrl(blobId, {
    disposition: "inline",
    warnIfNoServiceWorker: true,
  });
  // #endregion example
  return url;
}
