import type { JsBaoClient } from "js-bao-wss-client";

// Model nested organizational structure with multiple group types — org,
// department, and team. A user can belong to groups at several levels at once,
// and CEL can check any level: isMemberOf('org', ...), isMemberOf('dept', ...),
// isMemberOf('team', ...).
export async function setUpOrgHierarchy(client: JsBaoClient, userId: string) {
  // #region example
  // Organization-level group.
  await client.groups.create({ groupType: "org", groupId: "acme-corp", name: "Acme Corp" });

  // Department-level groups.
  await client.groups.create({ groupType: "dept", groupId: "engineering", name: "Engineering" });
  await client.groups.create({ groupType: "dept", groupId: "marketing", name: "Marketing" });

  // Team-level group.
  await client.groups.create({ groupType: "team", groupId: "backend", name: "Backend Team" });

  // A user can be in multiple groups at different levels.
  await client.groups.addMember("org", "acme-corp", { userId });
  await client.groups.addMember("dept", "engineering", { userId });
  await client.groups.addMember("team", "backend", { userId });
  // #endregion example
}
