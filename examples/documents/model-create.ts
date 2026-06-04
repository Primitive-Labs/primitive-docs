import { Task } from "../_harness/generated/ts/Task.generated";

// Create a record and save it. In single-document mode this saves to the
// active document automatically.
export async function createTask() {
  // #region example
  const task = new Task({
    title: "Review pull request",
    priority: 2,
    dueDate: new Date().toISOString(),
  });
  await task.save();
  // #endregion example
  return task;
}
