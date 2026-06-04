import JsBaoClient

// Upsert by a natural unique key (no need to know the existing record's id).
// The field must have a single-field unique constraint.
func upsertUser(users: TypedModel<AppUser>) throws {
  // #region example
  // Creates a new record, or merges into the existing one with that email.
  _ = try users.dynamic.upsert(
    ["email": .string("alice@example.com"), "name": .string("Alice")],
    on: "email"
  )
  // #endregion example
}
