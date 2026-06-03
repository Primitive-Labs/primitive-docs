import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Subscribe to model changes (local edits and synced remote edits). Returns an
// unsubscribe function — always call it when you're done.
export function subscribe() {
  // #region example
  const unsubscribe = Task.subscribe(() => {
    // re-query and update your UI
  });

  // later, when you no longer need updates:
  unsubscribe();
  // #endregion example
}
