import { Task } from "../_harness/generated/ts/Task.generated";

// Dates are stored as ISO-8601 strings — lexicographic order matches
// chronological order, so string comparison works in queries.
export async function dateHandling(task: Task) {
  // #region example
  // Store
  task.dueDate = new Date().toISOString();

  // Compare
  const due = new Date(task.dueDate);
  if (due < new Date()) {
    // overdue
  }

  // Query with date comparison
  const overdue = await Task.query({
    dueDate: { $lt: new Date().toISOString() },
  });
  // #endregion example
  return overdue.data;
}
