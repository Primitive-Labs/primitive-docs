import Foundation
import JsBaoClient

// Upsert by a natural unique key (no need to know the existing record's id).
// `save(in:upsertOn:)` inserts a new record or merges into an existing one
// matched by the given unique-constraint field, returning the resolved record.
func upsertUser(documentId: String) throws {
  // #region example
  let user = AppUser(
    id: UUID().uuidString,
    email: "alice@example.com",
    name: "Alice"
  )
  // "email" must have a single-field unique constraint in schema.toml.
  // On merge, the returned record carries the existing record's id.
  let resolved = try user.save(in: documentId, upsertOn: "email")
  // #endregion example
  _ = resolved
}
