import { Task } from "../_harness/generated/ts/Task.generated";

// Update a record: load it, mutate fields, save.
export async function completeTask(taskId: string) {
  // #region example
  const task = await Task.find(taskId);
  if (task) {
    task.completed = true;
    await task.save();
  }
  // #endregion example
}
