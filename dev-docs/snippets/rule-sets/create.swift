import JsBaoClient

// Create a new rule set for a resource type, with a typed `CreateRuleSetParams`
// payload (including the typed CEL `TriggerDefInfo` trigger grammar).
func create(client: JsBaoClient) async throws {
  // #region example
  let ruleSet = try await client.ruleSets.create(params: CreateRuleSetParams(
    name: "Document access",
    resourceType: "document",
    rules: [
      "Document": ModelRulesInfo(triggers: [
        TriggerDefInfo(on: .update, when: "user.userId == record.ownerId", set: ["allow": "true"]),
      ]),
    ],
    description: "Owner-only writes"
  ))
  // #endregion example
  _ = ruleSet
}
