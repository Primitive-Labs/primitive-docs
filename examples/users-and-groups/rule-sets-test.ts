import type { JsBaoClient } from "js-bao-wss-client";

// Test a rule set against a simulated request, or debug it against a real
// user's live memberships. Both return a trace of every isMemberOf/hasRole call.
export async function testRuleSet(client: JsBaoClient, ruleSetId: string) {
  // #region example
  // Simulated request — no live data needed.
  const result = await client.ruleSets.test(ruleSetId, {
    category: "group", // "group" or "member" for resourceType "group"
    operation: "create", // group: create|edit|delete|get; member: create|edit|delete|list
    user: { userId: "user-123", role: "member" },
    memberships: [{ groupType: "team", groupId: "engineering" }], // optional
    group: {
      groupType: "team",
      groupId: "engineering",
      name: "Eng",
      createdBy: "user-456",
    },
    target: { userId: "user-456" }, // for member.create/edit/delete
  });
  // result: { allowed, expression?, context?, trace?, error? }

  // Debug against a real user (live memberships, full trace).
  // Requires console-admin auth — regular app callers get 403.
  const debug = await client.ruleSets.debug({
    userId: "user-123",
    groupType: "team",
    groupId: "engineering", // optional — omit for create
    category: "member",
    operation: "create",
    targetUserId: "user-456", // optional
  });
  // #endregion example
  return { result, debug };
}
