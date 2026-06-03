import type { JsBaoClient } from "js-bao-wss-client";

// List members of a group, with optional pagination.
export async function listMembers(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const page = await client.groups.listMembers(groupType, groupId, { limit: 50 });
  for (const member of page.items) {
    console.log(member.userId, member.userName, member.userEmail);
  }
  const nextCursor = page.cursor;
  // #endregion example
  return nextCursor;
}
