import { Task } from "../_harness/generated/ts/Task.generated";

// Grouping by a stringset field counts per value. When the only operation
// is `count`, the value collapses to a number.
export async function aggregateFacet() {
  // #region example
  const tagCounts = await Task.aggregate({
    groupBy: ["tags"], // "tags" is a stringset field
    operations: [{ type: "count" }],
  });
  // Returns: { "work": 15, "urgent": 8, "personal": 5, ... }
  // #endregion example
  return tagCounts;
}
