import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Construct a record and persist it. In single-document mode `save()` writes to
// the active document automatically; pass `{ targetDocument }` to override.
export async function save() {
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
