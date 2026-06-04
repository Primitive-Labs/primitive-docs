import JsBaoClient

// Look up a record by a unique field without knowing its id. The model facade
// has no dedicated `findByUnique` — filter on the unique field and take the
// first match. For a compound constraint, filter on every field of it.
func findByUnique() {
  // #region example
  let user = AppUser.query(["email": "alice@example.com"]).first
  // #endregion example
  _ = user
}
