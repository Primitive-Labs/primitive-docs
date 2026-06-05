import JsBaoClient

// Look up a record by a registered unique constraint, without knowing its id.
// `findByUnique(constraintName, value)` mirrors the JS client; pass an array
// for a compound constraint. Throws if the constraint isn't registered.
func findByUnique() throws {
  // #region example
  let user = try AppUser.findByUnique("email", .string("alice@example.com"))
  // #endregion example
  _ = user
}
