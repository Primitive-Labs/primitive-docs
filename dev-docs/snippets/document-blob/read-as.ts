import type { JsBaoClient } from "js-bao-wss-client";

interface Settings {
  theme: string;
}

export async function readAs(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // Read a blob as UTF-8 text.
  const text = await blobs.read(blobId, { as: "text" });
  // JSON-parse it into a typed shape; `forceRedownload` bypasses the cache.
  // `as: "text"` resolves to a string at runtime; the union return type needs
  // a cast for `JSON.parse`.
  const raw = (await blobs.read(blobId, {
    as: "text",
    forceRedownload: true,
  })) as string;
  const settings = JSON.parse(raw) as Settings;
  // #endregion example
  return { text, settings };
}
