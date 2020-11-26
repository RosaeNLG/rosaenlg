/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  definition: [
    `
mixin testMixin
  | some text
`,
    // The parentehsis are required for the definition (but can be omitted in the call if there are no arguments).
    `
TextFunction testMixin()
--> text \\(
  some text
\\);
`,
  ],

  'with args': [
    `
mixin testMixin(arg1, arg2)
  | some text
  | #{arg1}
`,
    `
TextFunction testMixin(Object arg1, Object arg2)
--> text \\(
  some text
  \\value(arg1) /* TODO MIGRATE VALUE */
\\);
`,
  ],

  'call simple mixin - other syntax': [
    `
p
  +simple
`,
    `
\\beginParagraph
  \\simple
\\endParagraph
`,
  ],

  'call simple mixin': [
    `
p
  | #[+simple]
`,
    `
\\beginParagraph
  \\simple
\\endParagraph
`,
  ],

  'call mixin with args': [
    `
p
  | #[+withargs(arg1, arg2)]
`,
    `
\\beginParagraph
  \\withargs(arg1, arg2)
\\endParagraph
`,
  ],
};
