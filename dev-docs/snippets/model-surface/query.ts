import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Mongo-style filtered query. Returns a PaginatedResult — the rows are on
// `.data`, with `.nextCursor` / `.hasMore` for pagination.
export async function query() {
  // #region example
  const result = await Task.query({ priority: { $gte: 2 }, completed: false });
  const rows = result.data;
  // #endregion example
  return rows;
}
