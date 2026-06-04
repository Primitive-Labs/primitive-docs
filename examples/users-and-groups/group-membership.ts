import type { JsBaoClient } from "js-bao-wss-client";

// Add and list group members; list a user's group memberships.
export async function manageGroupMembers(client: JsBaoClient, userId: string) {
  // #region example
  // Add a member by email (recommended for user-facing flows)
  const result = await client.groups.addMember("team", "engineering", {
    email: "alice@example.com",
  });

  // ...or by user id (internal / programmatic)
  await client.groups.addMember("team", "engineering", { userId: "user-456" });

  // List a group's members
  const members = await client.groups.listMembers("team", "engineering");

  // List the groups a user belongs to
  const memberships = await client.groups.listUserMemberships(userId);
  // #endregion example
  return { result, members, memberships };
}
