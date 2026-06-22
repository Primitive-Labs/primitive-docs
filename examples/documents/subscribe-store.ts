// nocompile — framework glue: depends on Pinia and the web template's
// `@/models`, not present in this repo's compile harness.
// no-parity — Vue/Pinia store; no Swift twin. Swift binds a live query through
// BaoDataLoader instead (see documents/dataloader-glue.swift). The compiled,
// parity-enforced core both share is Model.subscribe (documents/subscribe).
// #region example
// stores/tasksStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { Task } from "@/models";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  let unsubscribe: (() => void) | null = null;

  async function reload() {
    const result = await Task.query({ completed: false }, { sort: { priority: -1 } });
    tasks.value = result.data as Task[];
  }

  function start() {
    if (unsubscribe) return;            // idempotent — don't double-subscribe
    unsubscribe = Task.subscribe(reload); // fires on every Task change, in any context
    void reload();                        // initial load
  }

  function stop() {
    unsubscribe?.();
    unsubscribe = null;
  }

  return { tasks, reload, start, stop };
});
// #endregion example
