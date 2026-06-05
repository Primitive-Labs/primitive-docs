import Foundation
import JsBaoClient

// Insert-or-merge by a natural unique key via `save(in:upsertOn:)` — no need to
// know the existing record's id. The field must have a single-field unique
// constraint. Targets one open document; throws if it isn't open.
func upsert(documentId: String) throws {
  // #region example
  let user = AppUser(id: UUID().uuidString, email: "alice@example.com", name: "Alice")
  // Creates a new record, or merges into the existing one with that email.
  try user.save(in: documentId, upsertOn: "email")
  // #endregion example
}
