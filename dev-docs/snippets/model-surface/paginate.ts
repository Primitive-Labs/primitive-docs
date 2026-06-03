import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Sort and paginate with a cursor. `query()` returns a PaginatedResult; carry
// `.nextCursor` forward via `uniqueStartKey`.
export async function paginate() {
  // #region example
  const page1 = await Task.query(
    { completed: false },
    { limit: 20, sort: { priority: -1 } },
  );

  if (page1.nextCursor) {
    const page2 = await Task.query(
      { completed: false },
      { limit: 20, sort: { priority: -1 }, uniqueStartKey: page1.nextCursor },
    );
    return page2.data;
  }
  // #endregion example
  return page1.data;
}
