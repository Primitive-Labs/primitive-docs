import type { JsBaoClient } from "js-bao-wss-client";

// Database access via a registered operation. Create the database, set the
// celContext values its operation CEL reads (e.g. teamId), then call the
// operation — the operation's CEL `access` plus $user.userId substitution does
// the per-row scoping.
export async function listMyTasks(client: JsBaoClient) {
  // #region example
  const db = await client.databases.create({
    title: "Alpha",
    databaseType: "project",
  });
  await client.databases.updateCelContext(db.databaseId, { teamId: "team-1" });

  const result = await client.databases.executeOperation(
    db.databaseId,
    "listMyTasks",
    {},
  );
  // #endregion example
  return result;
}
