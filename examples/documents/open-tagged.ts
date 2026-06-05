import type { JsBaoClient } from "js-bao-wss-client";
import { Message } from "../_harness/generated/ts/Message.generated";

// Open every document with a given tag, then query across all of them.
export async function openTagged(client: JsBaoClient) {
  // #region example
  // Open every document with a given tag
  const channels = await client.me.ownedDocuments({ tag: "channel" });
  await Promise.all(
    channels.map((ch) => client.documents.open(ch.documentId))
  );

  // Queries run across all open documents by default
  const messages = await Message.query({});
  // #endregion example
  return messages.data;
}
