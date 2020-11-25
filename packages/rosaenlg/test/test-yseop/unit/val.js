/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  | #{test.val}
`,
    `
\\beginParagraph
  \\value(test.val) /* TODO MIGRATE VALUE */
\\endParagraph
`,
  ],

  'with text just after': [
    `
p
  | #{test.val} bla
`,
    `
\\beginParagraph
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
\\endParagraph
`,
  ],

  'with text line after': [
    `
p
  | #{test.val} 
  | bla
`,
    `
\\beginParagraph
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
\\endParagraph
`,
  ],

  multiple: [
    `
p
  | #{test.val} bla #{getTest().val}
`,
    `
\\beginParagraph
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
  \\value(getTest().val) /* TODO MIGRATE VALUE */
\\endParagraph
`,
  ],

  'ignore empty': [
    `
p
  | #{''}
  | #{""}
  | bla
`,
    `
\\beginParagraph
  bla
\\endParagraph
`,
  ],
};
