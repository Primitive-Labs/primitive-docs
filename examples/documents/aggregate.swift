import JsBaoClient

// Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.
func taskStats(tasks: TypedModel<Task>) {
  // #region example
  let stats = tasks.dynamic.aggregate(AggregateOptions(
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
