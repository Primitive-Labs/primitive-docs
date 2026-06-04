import type { JsBaoClient } from "js-bao-wss-client";

// Bulk-call a registered mutation operation. Access rules are re-evaluated
// against each item's params; any failing item rejects the whole batch.
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
