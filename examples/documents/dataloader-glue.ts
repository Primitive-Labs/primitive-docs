// nocompile — framework glue: depends on the web template's Vue composable
// (primitive-app-template src/composables/useJsBaoDataLoader.ts) and Vue APIs
// not present in this repo.
import type { Ref } from "vue";
import { computed } from "vue";
import { useJsBaoDataLoader } from "@/composables/useJsBaoDataLoader";
import { TodoItem } from "@/models";

// Inside a component's <script setup>, with `props`, a `showCompleted` flag,
// and a `documentReady` ref in scope:
export function useTodoList(props: { listId: string }, showCompleted: boolean, documentReady: Ref<boolean>) {
  // #region example
  const {
    data: todos,
    initialDataLoaded,
    showSkeleton, // gate loading UI on this: true while the document opens, suppressed on fast warm reloads
    reload,
  } = useJsBaoDataLoader<{ items: TodoItem[]; total: number }>({
    subscribeTo: [TodoItem],
    queryParams: computed(() => ({ listId: props.listId, showCompleted })),
    documentReady,
    async loadData(queryParams) {
      const { listId, showCompleted } = queryParams ?? {};
      const query = showCompleted ? { listId } : { listId, completed: false };
      const result = await TodoItem.query(query, { sort: { order: 1 } });
      return { items: result.data, total: result.data.length };
    },
  });
  // #endregion example
  return { todos, initialDataLoaded, showSkeleton, reload };
}
