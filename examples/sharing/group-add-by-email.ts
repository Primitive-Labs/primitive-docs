import type { JsBaoClient } from "js-bao-wss-client";

// Add a member to a group by email. The result is a discriminated union —
// branch on `result.status` ("added" | "already_member" | "pending_signup").
export async function addGroupMemberByEmail(client: JsBaoClient) {
  // #region example
  const result = await client.groups.addMember("team", "engineering", {
    email: "alice@example.com",
  });
  // #endregion example
  return result;
}
