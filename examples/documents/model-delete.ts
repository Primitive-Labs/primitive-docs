import { Task } from "../_harness/generated/ts/Task.generated";

// Delete a record: load it, then delete.
export async function deleteTask(taskId: string) {
  // #region example
  const task = await Task.find(taskId);
  if (task) {
    await task.delete();
  }
  // #endregion example
}
