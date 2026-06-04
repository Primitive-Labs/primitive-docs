import JsBaoClient

// The model facade's `query` takes a `limit` and an ordered `sortOrder`, but
// returns plain `[Task]` with no cursor — there is no `nextCursor` to carry
// forward, so cursor pagination isn't expressible on the facade today. Use
// `limit` + `sortOrder` for a bounded, ordered page.
func paginate() {
  // #region example
  let page = Task.query(
    ["completed": false],
    options: QueryOptions(sortOrder: [("priority", -1)], limit: 20)
  )
  // #endregion example
  _ = page
}
