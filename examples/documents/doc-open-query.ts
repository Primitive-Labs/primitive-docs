import type { JsBaoClient } from "js-bao-wss-client";
import { Task } from "../_harness/generated/ts/Task.generated";

// Documents must be opened before querying or saving data in them. Await the
// open before the first query — the document is ready once open() resolves.
export async function openThenQuery(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.open(documentId);
  const result = await Task.query({}, { documents: documentId });
  // #endregion example
  return result.data;
}
