/**
 * vue-docgen-cli config
 *
 * Goal: generate Markdown docs for all Vue components under primitive-app/src.
 *
 * Note: vue-docgen-cli config options have changed across major versions.
 * If this doesn't work with your installed version, run:
 *   pnpm exec vue-docgen --help
 * and adjust accordingly.
 */
module.exports = {
  // Root where components live
  componentsRoot: 'packages/primitive-app/src',

  // Include all components under src (you said all are public)
  components: ['**/*.vue'],

  // Where to write generated Markdown
  outDir: 'docs/reference/primitive-app/components',
}


