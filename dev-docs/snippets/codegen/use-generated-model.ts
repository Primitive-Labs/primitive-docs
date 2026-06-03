import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Construct and save a record from a codegen-generated model. The `Task` class
// extends `BaseModelImpl`, so CRUD (`save`, `find`, `delete`) is inherited.
export async function useGeneratedModel() {
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
