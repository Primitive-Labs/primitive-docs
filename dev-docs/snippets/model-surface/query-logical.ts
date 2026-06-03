import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Combine conditions with logical operators ($or, $and).
export async function queryLogical() {
  // #region example
  const result = await Task.query({
    $or: [
      { priority: 3 },
      { dueDate: { $lt: new Date().toISOString() } },
    ],
  });
  // #endregion example
  return result.data;
}
