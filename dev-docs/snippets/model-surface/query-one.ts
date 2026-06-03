import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Fetch just the first match (with an optional sort). Resolves to null when
// nothing matches — no PaginatedResult wrapper.
export async function queryOne() {
  // #region example
  const topTask = await Task.queryOne(
    { completed: false },
    { sort: { priority: -1 } },
  );
  // #endregion example
  return topTask;
}
