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

  // Join profile data in the same call with `include: "profiles"`.
  const withProfiles = await client.groups.listMembers("team", "engineering", {
    include: "profiles",
  });
  // withProfiles.items: [{ userId, userName?, userEmail?, avatarUrl, addedAt, addedBy }]
  // avatarUrl is always present here — a URL, or null if the user has no
  // avatar or the membership is orphaned (deleted user).
  // #endregion example
  return { page, next, withProfiles };
}
