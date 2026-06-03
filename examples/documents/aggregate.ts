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
  // #endregion example
  return stats;
}
