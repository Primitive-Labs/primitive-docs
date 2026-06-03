import type { JsBaoClient } from "js-bao-wss-client";
import { Task } from "../_harness/generated/ts/Task.generated";

// Single per-user document pattern: atomically get-or-create the user's
// singleton document, open it, then read locally. After open() the document is
// cached on this client, so model reads are local and synchronous.
export async function loadPersonalData(client: JsBaoClient) {
  // #region example
  // On app load, after sign-in
  const { documentId } = await client.documents.getOrCreateWithAlias({
    title: "My Data",
    alias: { scope: "user", aliasKey: "default" },
  });
  await client.documents.open(documentId);

  // Reads are local and synchronous after open()
  const tasks = await Task.query({ completed: false });
  // #endregion example
  return tasks;
}
