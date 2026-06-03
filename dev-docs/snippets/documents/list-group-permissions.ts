import type { JsBaoClient } from "js-bao-wss-client";

// List group-based permissions on a document. Pass `{ includeSystem: true }`
// to surface platform-managed internal groups (admin tooling).
export async function listGroupPermissions(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const groups = await client.documents.listGroupPermissions(documentId, {
    includeSystem: false,
  });
  // #endregion example
  return groups;
}
