import JsBaoClient

// Look up a record by a registered unique constraint, without knowing its id.
// The value is a `PrimitiveValue`; use the `values:` overload for a compound
// (multi-field) constraint.
func findByUnique(users: TypedModel<AppUser>) throws {
  // #region example
  let user = try users.findByUnique(constraint: "email", value: .string("alice@example.com"))
  // #endregion example
  _ = user
}
