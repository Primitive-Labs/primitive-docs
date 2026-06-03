import JsBaoClient

// Swift has no `save({ upsertOn })` on the typed facade — upsert lives on
// `.dynamic.upsert(_:on:)`, which takes a `[String: PrimitiveValue]` dict.
func upsert(users: TypedModel<AppUser>) throws {
  // #region example
  // Creates a new record, or merges into the existing one with that email.
  _ = try users.dynamic.upsert(
    ["email": .string("alice@example.com"), "name": .string("Alice")],
    on: "email"
  )
  // #endregion example
}
