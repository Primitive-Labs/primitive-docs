import type { JsBaoClient } from "js-bao-wss-client";
import { Message } from "../_harness/generated/ts/Message.generated";

// Open every document carrying a given tag, then query across them. Queries
// span all open documents by default, so once each tagged doc is open the
// query sees them together.
export async function openTaggedDocuments(client: JsBaoClient) {
  // #region example
  // Open every document with a given tag
  const channels = await client.me.ownedDocuments({ tag: "channel" });
  await Promise.all(
    channels.map((ch) => client.documents.open(ch.documentId))
  );

  // Query runs across all open documents by default
  const messages = await Message.query({});
  // #endregion example
  return messages.data;
}
