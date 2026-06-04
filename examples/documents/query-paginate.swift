import JsBaoClient

// Sort and paginate with a cursor. Use `sortOrder` (ordered) when the sort
// drives cursor pagination.
func paginateTasks(tasks: TypedModel<Task>) throws {
  // #region example
  let page1 = try tasks.dynamic.queryPaged(
    ["completed": false],
    options: QueryOptions(sortOrder: [("priority", -1)], limit: 20)
  )

  if let cursor = page1.nextCursor {
    let page2 = try tasks.dynamic.queryPaged(
      ["completed": false],
      options: QueryOptions(sortOrder: [("priority", -1)], limit: 20, cursor: cursor)
    )
    _ = page2
  }
  // #endregion example
  _ = page1
}
