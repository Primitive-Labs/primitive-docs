import JsBaoClient

// Direct-record aggregation: group by one or more fields and compute
// count/sum/avg/min/max, with an optional filter, sort, and limit.
func recordAggregate(client: JsBaoClient, databaseId: String) async throws {
  let db = client.databases.connect(databaseId: databaseId)
  // #region example
  let result = try await db.aggregate(modelName: "tasks", options: DoDbAggregationOptions(
    groupBy: [.field("category")],
    operations: [
      DoDbAggregationOperation(type: .count),
      DoDbAggregationOperation(type: .sum, field: "estimatedHours"),
      DoDbAggregationOperation(type: .avg, field: "estimatedHours"),
      DoDbAggregationOperation(type: .min, field: "priority"),
      DoDbAggregationOperation(type: .max, field: "priority"),
    ],
    filter: ["completed": false],
    limit: 10,
    sort: DoDbAggregationSort(field: "count", direction: .descending)
  ))
  // #endregion example
  _ = result
}
