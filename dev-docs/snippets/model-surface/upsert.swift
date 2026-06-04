import Foundation
import JsBaoClient

// Insert-or-merge by a natural unique key. The model facade has no
// `save({ upsertOn })` — look the record up by its unique field, mutate it in
// place if it exists or build a new one if it doesn't, then `save(in:)` (the
// unified create/update). Targets one open document; throws if it isn't open.
func upsert(documentId: String) throws {
  // #region example
  var user = AppUser.query(["email": "alice@example.com"]).first
    ?? AppUser(id: UUID().uuidString, email: "alice@example.com")
  user.name = "Alice"
  try user.save(in: documentId)
  // #endregion example
}
