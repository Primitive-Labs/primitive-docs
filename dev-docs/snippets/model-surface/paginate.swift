import JsBaoClient

// `Task.queryPaged` returns a page of rows plus opaque cursors. Pass the
// previous `nextCursor` back via `options.cursor` to walk through a large
// result set page by page — mirroring JS's `query()` `{ data, nextCursor,
// hasMore }` shape.
func paginate() throws {
  // #region example
  var cursor: String? = nil
  repeat {
    let page = try Task.queryPaged(
      ["completed": false],
      options: QueryOptions(sortOrder: [("priority", -1)], limit: 20, cursor: cursor)
    )
    process(page.data)
    cursor = page.hasMore ? page.nextCursor : nil
  } while cursor != nil
  // #endregion example
}

func process(_ rows: [Task]) {}
