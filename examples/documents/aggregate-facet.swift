import JsBaoClient

// Grouping by a stringset field counts per value.
func aggregateFacet() {
  // #region example
  let tagCounts = Task.aggregate(AggregateOptions(
    groupBy: ["tags"], // "tags" is a stringset field
    operations: [AggregateOperation(type: .count)]
  ))
  // #endregion example
  _ = tagCounts
}
