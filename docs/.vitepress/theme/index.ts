// Extends the default theme to show the validated-against versions line at the
// bottom of every page (the default theme footer is hidden on pages with a
// sidebar, which is all of them).
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import VersionsFooter from "./VersionsFooter.vue";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-bottom": () => h(VersionsFooter),
    });
  },
};
