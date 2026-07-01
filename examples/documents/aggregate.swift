import JsBaoClient

// Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.
func taskStats() throws {
  // #region example
  let stats = try Task.aggregate(AggregateOptions(
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

  // Grouping by a stringset field counts per member value (facet):
  let tagCounts = try Task.aggregate(AggregateOptions(
    groupBy: ["tags"],
    operations: [AggregateOperation(type: .count)]
  ))

  // Group by whether the set contains a value (membership) — rows carry
  // a "has_tags_urgent" key of "true" / "false":
  let urgentSplit = try Task.aggregate(AggregateOptions(
    groupBy: [.stringSetMembership(field: "tags", contains: "urgent")],
    operations: [AggregateOperation(type: .count)]
  ))
  // #endregion example
  _ = (stats, tagCounts, urgentSplit)
}
