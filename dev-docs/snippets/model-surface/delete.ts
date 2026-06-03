import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Delete a record: load it, then call `delete()` on the instance.
export async function deleteX(taskId: string) {
  // #region example
  const task = await Task.find(taskId);
  if (task) {
    await task.delete();
  }
  // #endregion example
}
