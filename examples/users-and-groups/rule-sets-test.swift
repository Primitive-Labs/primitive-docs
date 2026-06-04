import JsBaoClient

// Test a rule set against a simulated request, or debug it against a real
// user's live memberships. Both return a trace of every isMemberOf/hasRole call.
func testRuleSet(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  // Simulated request — no live data needed.
  let result = try await client.ruleSets.test(
    ruleSetId: ruleSetId,
    data: [
      "category": "group",  // "group" or "member" for resourceType "group"
      "operation": "create",  // group: create|edit|delete|get; member: create|edit|delete|list
      "user": ["userId": "user-123", "role": "member"],
      "memberships": [["groupType": "team", "groupId": "engineering"]],  // optional
      "group": [
        "groupType": "team", "groupId": "engineering",
        "name": "Eng", "createdBy": "user-456",
      ],
      "target": ["userId": "user-456"],  // for member.create/edit/delete
    ]
  )
  // result: ["allowed", "expression"?, "context"?, "trace"?, "error"?]

  // Debug against a real user (live memberships, full trace).
  // Requires console-admin auth — regular app callers get 403.
  let debug = try await client.ruleSets.debug(data: [
    "userId": "user-123",
    "groupType": "team",
    "groupId": "engineering",  // optional — omit for create
    "category": "member",
    "operation": "create",
    "targetUserId": "user-456",  // optional
  ])
  // #endregion example
  _ = (result, debug)
}
