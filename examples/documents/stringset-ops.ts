import type { Task } from "../_harness/generated/ts/Task.generated";

// Stringset fields hold a set of strings (tags, labels): mutate with
// add/remove, test membership, convert to an array for display.
export function stringsetOps(task: Task) {
  // #region example
  // Add/remove tags
  task.tags?.add("urgent");
  task.tags?.remove("low-priority");

  // Check membership
  if (task.tags?.has("urgent")) {
    // ...
  }

  // Convert to array for display
  const tagList = task.tags?.toArray() ?? [];
  // #endregion example
  return tagList;
}
