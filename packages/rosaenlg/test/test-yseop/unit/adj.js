/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  English: [
    `
p
  +agreeAdj('cool', adjWith)
`,
    `
\\beginParagraph
  \\adjective("cool", _THIRD: adjWith) /* TODO MIGRATE */
\\endParagraph
`,
    'en_US',
  ],

  French: [
    `
p
  +agreeAdj('vieux', 'caméra')
`,
    `
\\beginParagraph
  \\adjective("vieux", _THIRD: "caméra") /* TODO MIGRATE */
\\endParagraph
`,
    'fr_FR',
  ],

  German: [
    `
p
  +agreeAdj('alt', 'Gurke', {case:'GENITIVE'})
`,
    `
\\beginParagraph
  \\adjective("alt", _THIRD: "Gurke", GENITIVE)
\\endParagraph
`,
    'de_DE',
  ],
};
