import JsBaoClient

// Aggregation is the static `Task.aggregate`, returning untyped
// `[[String: Any]]` rows. `groupBy` takes `AggregateGroupBy`: a bare
// string is a field, and `.stringSetMembership(field:contains:)` groups
// by whether a stringset contains a value (a stringset field name on its
// own groups by member value — a facet).
func aggregate() {
  // #region example
  let stats = Task.aggregate(AggregateOptions(
    groupBy: ["category", .stringSetMembership(field: "tags", contains: "urgent")],
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
