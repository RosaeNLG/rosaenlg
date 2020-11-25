/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  each elt in elts
    | #{elt}
`,
    `
\\beginParagraph
  \\foreach(elt, elts) /* TODO MIGRATE foreach */
    \\value(elt) /* TODO MIGRATE VALUE */
  \\endForeach
\\endParagraph
`,
  ],
};
