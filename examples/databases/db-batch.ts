import type { JsBaoClient } from "js-bao-wss-client";

// Bulk-write through a registered batch operation. Each item is checked against
// the operation's per-item CEL independently.
export async function importContacts(client: JsBaoClient, databaseId: string) {
  // #region example
  const result = await client.databases.executeBatch(databaseId, "import-contacts", [
    { params: { name: "Alice", email: "alice@example.com" } },
    { params: { name: "Bob", email: "bob@example.com" } },
  ]);
  // result: { imported, failed }
  // #endregion example
  return result;
}
