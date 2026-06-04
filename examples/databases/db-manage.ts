import type { JsBaoClient } from "js-bao-wss-client";

// Administrative database lifecycle: list (optionally filtered by type),
// fetch, rename, and delete. These require a direct owner/manager grant.
export async function manageDatabases(client: JsBaoClient, databaseId: string) {
  // #region example
  // Databases where the caller is owner or manager (admins see all).
  // Databases reachable only via CEL-gated operations or group grants are
  // NOT returned here — use groups.listDatabases for group-shared ones.
  const databases = await client.databases.list();

  // Narrow to one databaseType (post-join filter — narrows, never widens).
  const projects = await client.databases.list({ databaseType: "project" });

  const db = await client.databases.get(databaseId);

  await client.databases.update(databaseId, { title: "New Title" });

  // Owner only — permanently removes all records and permissions.
  await client.databases.delete(databaseId);
  // #endregion example
  return { databases, projects, db };
}
