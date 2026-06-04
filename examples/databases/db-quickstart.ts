import type { JsBaoClient } from "js-bao-wss-client";

// End-to-end runtime flow: create a database of a configured type, then call
// its registered operations. The server assigns ids and enforces each op's CEL.
export async function quickStart(client: JsBaoClient) {
  // #region example
  // Create a database instance of the configured type
  const db = await client.databases.create({ title: "Alpha Project", databaseType: "project" });

  // Execute registered operations
  const result = await client.databases.executeOperation(db.databaseId, "listTasks", {
    params: { projectId: "proj-1" },
  });

  const createResult = await client.databases.executeOperation(db.databaseId, "createTask", {
    params: { title: "Ship v1", projectId: "proj-1" },
  });
  const taskId = createResult.results[0].id; // server-assigned ULID
  // #endregion example
  return { result, taskId };
}
