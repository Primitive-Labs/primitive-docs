import type { JsBaoClient } from "js-bao-wss-client";

export function hasServiceWorkerControl(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // True when a service worker is registered and controlling blob proxy requests.
  const controlled = blobs.hasServiceWorkerControl();
  // #endregion example
  return controlled;
}
