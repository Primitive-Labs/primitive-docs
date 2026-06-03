import { Task } from "../../../examples/_harness/generated/ts/Task.generated";

// Load every record of this model (no filter, no pagination).
export async function findAll() {
  // #region example
  const tasks = await Task.findAll();
  // #endregion example
  return tasks;
}
