import type { JsBaoClient } from "js-bao-wss-client";

// List a group's members, paginated. Each row carries the member's id and
// (when known) name/email plus who added them and when.
export async function listGroupMembers(client: JsBaoClient) {
  // #region example
  const page = await client.groups.listMembers("team", "engineering");
  // page.items: [{ userId, userName?, userEmail?, addedAt, addedBy }]

  const next = await client.groups.listMembers("team", "engineering", {
    limit: 50,
    cursor: page.cursor,
  });
  // #endregion example
  return { page, next };
}
