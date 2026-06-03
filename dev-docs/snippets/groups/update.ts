import type { JsBaoClient } from "js-bao-wss-client";

// Update a group's name and/or description.
export async function update(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const group = await client.groups.update(groupType, groupId, {
    name: "Design Guild",
    description: "Renamed crew",
  });
  // #endregion example
  return group;
}
