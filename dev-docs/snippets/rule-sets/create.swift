import JsBaoClient

// Create a new rule set. Swift takes an untyped `[String: Any]` params dict
// (no typed `CreateRuleSetParams` / CEL `TriggerDefInfo` grammar) and returns
// an untyped `[String: Any]` envelope.
func create(client: JsBaoClient) async throws {
  // #region example
  let ruleSet = try await client.ruleSets.create(params: [
    "name": "Document access",
    "resourceType": "document",
    "description": "Owner-only writes",
    "rules": [
      "Document": [
        "triggers": [
          ["on": "update", "when": "user.userId == record.ownerId", "set": ["allow": "true"]],
        ],
      ],
    ],
  ])
  // #endregion example
  _ = ruleSet
}
