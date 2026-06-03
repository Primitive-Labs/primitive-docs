import { Task } from "../_harness/generated/ts/Task.generated";

// Read records: by id, by filter, the first match, and a count.
export async function readTasks() {
  // #region example
  // Find one by id
  const task = await Task.find("task-id");

  // Query with filters — returns a PaginatedResult; rows are on `.data`
  const urgent = await Task.query({ priority: { $gte: 2 }, completed: false });
  const rows = urgent.data;

  // First match (with a sort)
  const topTask = await Task.queryOne({ completed: false }, { sort: { priority: -1 } });

  // Count
  const remaining = await Task.count({ completed: false });
  // #endregion example
  return { task, rows, topTask, remaining };
}
