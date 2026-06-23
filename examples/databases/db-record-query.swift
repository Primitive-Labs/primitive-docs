import JsBaoClient

// Direct record queries on a DoDb handle: the filter grammar, multi-field AND,
// $or/$and, sort + cursor pagination, projection, and related-data includes.
func recordQueries(client: JsBaoClient, databaseId: String) async throws {
  let db = client.databases.connect(databaseId: databaseId)
  // #region example
  // Filter operators: exact match, comparisons, set membership, text, $or/$and.
  let result = try await db.query(modelName: "tasks", filter: [
    "completed": false,
    "priority": ["$gte": 5],
    "category": ["$in": ["work", "urgent"]],
    "title": ["$startsWith": "Ship"],
    "tags": ["$contains": "featured"],
    "$or": [["category": "work"], ["priority": ["$gte": 8]]],
  ])

  // Multiple fields on the same object are ANDed; use explicit $and to put
  // two conditions on one field.
  let priced = try await db.query(modelName: "tasks", filter: [
    "$and": [["priority": ["$gte": 1]], ["priority": ["$lte": 5]]],
  ])

  // Sort, limit, and cursor pagination.
  let page1 = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(sort: DoDbSort("priority", .descending), limit: 20)
  )
  var page2: DoDbQueryResult?
  if page1.hasMore {
    page2 = try await db.query(
      modelName: "tasks", filter: [:],
      options: DoDbQueryOptions(sort: DoDbSort("priority", .descending), limit: 20, uniqueStartKey: page1.nextCursor)
    )
  }

  // Projection — return only the named fields.
  let titles = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(projection: DoDbProjection([("title", .include), ("completed", .include)]))
  )

  // Include related records — they land under _related on each parent.
  let withCategory = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(include: [
      DoDbInclude(model: "categories", type: .refersTo, sourceField: "category", alias: "categoryInfo")
    ])
  )
  // #endregion example
  _ = (result, priced, page1, page2, titles, withCategory)
}
