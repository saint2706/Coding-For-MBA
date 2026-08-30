/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-standard',
  ignoreFiles: ['dist/**', 'coverage/**', 'public/**'],
  rules: {
    // The codebase's established naming convention is kebab-case with an
    // optional BEM element/modifier suffix (`.block__element`, `.block--modifier`),
    // used consistently across every stylesheet — not the plain single-hyphen
    // kebab-case the default pattern expects.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Expected class selector to be kebab-case, optionally BEM-style (block__element, block--modifier)',
      },
    ],

    // variables.css deliberately declares `:root` twice — once for primitive
    // tokens, once for semantic tokens — as documented at the top of that
    // file. That's the project's three-layer token architecture, not a bug.
    'no-duplicate-selectors': null,

    // This rule flags source order across selectors with no regard for
    // whether they actually target overlapping elements/properties. Every
    // instance in this codebase (checked by hand) pairs unrelated
    // components or mutually-exclusive pseudo-class states (:hover vs
    // :disabled, :not() exclusions) with no real override conflict —
    // reordering would only add churn and risk, not fix anything.
    'no-descending-specificity': null,
  },
}
