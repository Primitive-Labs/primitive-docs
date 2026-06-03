// nocompile — framework glue: depends on the web template's Vue composable
// (primitive-app-template src/composables/useJsBaoDataLoader.ts) and Vue APIs
// not present in this repo.
import type { Ref } from "vue";
import { useJsBaoDataLoader } from "@/composables/useJsBaoDataLoader";
import { Task } from "@/models/Task.generated";

export function useOpenTasks(documentReady: Ref<boolean>) {
  // #region example
  const { data: tasks, initialDataLoaded, isLoading } = useJsBaoDataLoader({
    subscribeTo: [Task],   // reload whenever Task records change
    documentReady,         // gate loads until the document is open
    queryParams: null,
    loadData: async () => {
      const page = await Task.query({ completed: false }, { sort: { priority: -1 } });
      return page.data;
    },
  });
  // #endregion example
  return { tasks, initialDataLoaded, isLoading };
}
