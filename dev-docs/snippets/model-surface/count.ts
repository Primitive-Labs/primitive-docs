import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Count records matching a filter (or all of them when the filter is omitted).
export async function count() {
  // #region example
  const remaining = await Task.count({ completed: false });
  // #endregion example
  return remaining;
}
