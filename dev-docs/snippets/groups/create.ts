import type { JsBaoClient } from "js-bao-wss-client";

// Create a new group. `groupType`, `groupId`, and `name` are required.
export async function create(client: JsBaoClient) {
  // #region example
  const group = await client.groups.create({
    groupType: "team",
    groupId: "design",
    name: "Design Team",
    description: "Product design crew",
  });
  // #endregion example
  return group;
}
