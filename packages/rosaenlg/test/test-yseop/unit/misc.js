/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  | #[+syn('colors', 'tints', 'tones')]
`,
    // no single quotes in YML
    `
\\beginParagraph
  \\synonym("colors", "tints", "tones")
\\endParagraph
`,
  ],
};
