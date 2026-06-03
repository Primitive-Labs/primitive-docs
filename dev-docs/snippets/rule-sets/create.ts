import type { JsBaoClient } from "js-bao-wss-client";

// Create a new rule set for a resource type, with a typed `CreateRuleSetParams`
// payload (including the typed CEL trigger grammar).
export async function create(client: JsBaoClient) {
  // #region example
  const ruleSet = await client.ruleSets.create({
    name: "Document access",
    resourceType: "document",
    description: "Owner-only writes",
    rules: {
      Document: {
        triggers: [
          { on: "update", when: "user.userId == record.ownerId", set: { allow: "true" } },
        ],
      },
    },
  });
  // #endregion example
  return ruleSet;
}
