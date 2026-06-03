import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Update a record: load it, mutate fields, then `save()`.
export async function update(taskId: string) {
  // #region example
  const task = await Task.find(taskId);
  if (task) {
    task.completed = true;
    await task.save();
  }
  // #endregion example
}
