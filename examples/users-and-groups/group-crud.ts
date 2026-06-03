import type { JsBaoClient } from "js-bao-wss-client";

// Create, list, get, update, and delete groups. A group is identified by a
// (groupType, groupId) pair.
export async function manageGroups(client: JsBaoClient) {
  // #region example
  // Create. If the group type has autoAddCreator (default), the creator is
  // added as a member.
  await client.groups.create({
    groupType: "team",
    groupId: "engineering",
    name: "Engineering Team",
    description: "Platform engineering team", // optional
  });

  // List — paginated { items, cursor }. Filter by type and page through.
  const page1 = await client.groups.list({ type: "team", limit: 10 });
  const page2 = await client.groups.list({
    type: "team",
    limit: 10,
    cursor: page1.cursor,
  });

  // Get a single group.
  const group = await client.groups.get("team", "engineering");

  // Update name and/or description (both optional).
  await client.groups.update("team", "engineering", {
    name: "Platform Engineering",
    description: "Owns the platform stack",
  });

  // Cascade-deletes all memberships and group permissions.
  await client.groups.delete("team", "engineering");
  // #endregion example
  return { page1, page2, group };
}
