/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

// There is no tag "possessive" in YML.
// See the lang tests for details (search for "thirdPossession" and "possessive").

module.exports = {
  'French simple': [
    `
p
  +thirdPossession(BAGUE, 'poids')
`,
    `
\\beginParagraph
  \\value("poids", _OWNER: BAGUE) /* TODO MIGRATE */
\\endParagraph
`,
    'fr_FR',
  ],

  'German simple': [
    `
p
  +thirdPossession(PRODUKT, adjective)
`,
    `
\\beginParagraph
  \\value(adjective, _OWNER: PRODUKT) /* TODO MIGRATE */
\\endParagraph
`,
    'de_DE',
  ],

  'German complex': [
    `
p
  +thirdPossession(PRODUKT, 'Farbe', {case:'GENITIVE'})
  +thirdPossession(PRODUKT, adjectives[index], {'FORCE_N': true})
`,
    `
\\beginParagraph
  \\value("Farbe", _OWNER: PRODUKT, GENITIVE)
  \\value(adjectives[index], _OWNER: PRODUKT) /* TODO MIGRATE {"FORCE_N":true} */
\\endParagraph
`,
    'de_DE',
  ],
};
