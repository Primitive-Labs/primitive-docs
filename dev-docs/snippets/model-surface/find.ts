import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Look up a single record by its id. Resolves to null when nothing matches.
export async function find(taskId: string) {
  // #region example
  const task = await Task.find(taskId);
  // #endregion example
  return task;
}
