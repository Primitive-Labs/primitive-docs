import { Task } from "../_harness/generated/ts/Task.generated";

// Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.
export async function taskStats() {
  // #region example
  const stats = await Task.aggregate({
    groupBy: ["category"],
    operations: [
      { type: "count" },
      { type: "avg", field: "priority" },
      { type: "sum", field: "estimatedHours" },
    ],
    filter: { completed: false },
    sort: { field: "count", direction: -1 },
    limit: 10,
  });

  // Grouping by a stringset field counts per member value (facet):
  const tagCounts = await Task.aggregate({
    groupBy: ["tags"],
    operations: [{ type: "count" }],
  });

  // Group by whether the set contains a value (membership):
  const urgentSplit = await Task.aggregate({
    groupBy: [{ field: "tags", contains: "urgent" }],
    operations: [{ type: "count" }],
  });
  // #endregion example
  return { stats, tagCounts, urgentSplit };
}
