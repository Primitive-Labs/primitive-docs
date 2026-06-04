import JsBaoClient

// Aggregation is the static `Task.aggregate` and returns untyped
// `[[String: Any]]` rows. `groupBy` is `[String]` only — the StringSet-
// membership grouping the JS API accepts has no Swift form.
func aggregate() {
  // #region example
  let stats = Task.aggregate(AggregateOptions(
    groupBy: ["category"],
    operations: [
      AggregateOperation(type: .count),
      AggregateOperation(type: .avg, field: "priority"),
      AggregateOperation(type: .sum, field: "estimatedHours"),
    ],
    filter: ["completed": false],
    sort: AggregateSort(field: "count", direction: -1),
    limit: 10
  ))
  // #endregion example
  _ = stats
}
