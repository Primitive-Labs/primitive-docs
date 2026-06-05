import { Task } from "../_harness/generated/ts/Task.generated";

// Plain field maps AND together — every condition must match.
export async function queryAnd() {
  // #region example
  const result = await Task.query({
    completed: false,
    priority: { $gte: 3 },
    category: { $in: ["work", "urgent"] },
  });
  // #endregion example
  return result.data;
}
