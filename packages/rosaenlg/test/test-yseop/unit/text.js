/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  | bla
`,
    `
\\beginParagraph
  bla
\\endParagraph
`,
  ],

  multiline: [
    `
p
  | bla
  | bla
  | bla
`,
    `
\\beginParagraph
  bla
  bla
  bla
\\endParagraph
`,
  ],

  sameline: [
    `
p
  | bla bla bla
  | bla
`,
    `
\\beginParagraph
  bla bla bla
  bla
\\endParagraph
`,
  ],
};
