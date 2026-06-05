import Foundation
import JsBaoClient

// Upsert by a natural unique key (no need to know the existing record's id).
// `save(in:)` inserts a new record or updates in place when the id already
// exists, so reuse the matched record's id to merge instead of duplicate.
func upsertUser(documentId: String) throws {
  // #region example
  let email = "alice@example.com"
  // Reuse the existing record's id when one matches the email; otherwise mint a new id.
  let existing = AppUser.query(["email": email]).first
  let user = AppUser(
    id: existing?.id ?? UUID().uuidString,
    email: email,
    name: "Alice"
  )
  try user.save(in: documentId)
  // #endregion example
}
