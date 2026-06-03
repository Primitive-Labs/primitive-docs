import Foundation
import JsBaoClient

// Update an existing database type configuration. To clear a field, pass
// `NSNull()` (the untyped dict equivalent of JS `null`); omit a key to leave
// it unchanged.
func update(
  client: JsBaoClient,
  databaseType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.update(
    databaseType: databaseType,
    params: [
      "ruleSetId": ruleSetId,
      "triggers": NSNull(),
      "metadataAccess": "user.role == 'admin'",
    ]
  )
  // #endregion example
  _ = config
}
