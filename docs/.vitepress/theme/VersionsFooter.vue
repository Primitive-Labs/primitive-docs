<script setup lang="ts">
// Published package versions the docs were last validated against, from the
// repo-root stamp written by `pnpm stamp:sources`.
import { computed } from "vue";
import { useData } from "vitepress";
import sources from "../../../docs-sources.json";

// The layout-bottom slot spans the full viewport, but the sidebar (when
// present) overlays the left edge — offset to center within the content area.
// Only the home layout has no sidebar.
const { frontmatter } = useData();
const hasSidebar = computed(() => frontmatter.value.layout !== "home");

const packages: Record<string, string> = {};
for (const lib of Object.values(sources.libraries)) {
  Object.assign(packages, (lib as { npm?: Record<string, string> }).npm ?? {});
}
const line = Object.entries(packages)
  .map(([name, version]) => `${name} ${version}`)
  .join(" · ");
</script>

<template>
  <footer class="versions-footer" :class="{ 'has-sidebar': hasSidebar }">
    Documentation validated against {{ line }} — {{ sources.stampedAt }}
  </footer>
</template>

<style scoped>
.versions-footer {
  padding: 16px 24px 24px;
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* Mirror .VPContent.has-sidebar's left offset so the line centers in the
   content column instead of being clipped under the fixed sidebar. */
@media (min-width: 960px) {
  .versions-footer.has-sidebar {
    padding-left: calc(var(--vp-sidebar-width) + 24px);
  }
}

@media (min-width: 1440px) {
  .versions-footer.has-sidebar {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2 + 24px);
    padding-left: calc(
      (100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width) + 24px
    );
  }
}
</style>
