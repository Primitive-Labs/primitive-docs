import { Task } from "../_harness/generated/ts/Task.generated";

// Subscribe to model changes (local edits and synced remote edits). Works
// anywhere — components, stores, plain services. Always unsubscribe.
export function watchTasks() {
  // #region example
  const unsubscribe = Task.subscribe(() => {
    // re-query and update your UI
  });

  // later, when you no longer need updates:
  unsubscribe();
  // #endregion example
}
