/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  +verb(subject, 'eat')
`,
    `
\\beginParagraph
  \\thirdAction(subject, VERB_EN_EAT)
\\endParagraph
`,
    'en_US',
  ],

  'with tense': [
    `
p
  +verb(subject, {verb: 'eat', tense: 'PAST'})
  +verb(subject, {verb: 'eat', tense: 'FUTURE'})
`,
    `
\\beginParagraph
  \\thirdAction(subject, VERB_EN_EAT, PRETERIT_EN)
  \\thirdAction(subject, VERB_EN_EAT, FUTURE_EN)
\\endParagraph
`,
    'en_US',
  ],

  french: [
    `
p
  +verb(subject, {verb: 'faire', tense: 'PASSE_SIMPLE'})
`,
    `
\\beginParagraph
  \\thirdAction(subject, VERB_FR_FAIRE, PAST_HISTORIC_INDICATIVE_FR)
\\endParagraph
`,
    'fr_FR',
  ],

  'aux être': [
    `
p
  +verb(subject, {verb: 'aller', tense:'PASSE_COMPOSE', aux:'ETRE'})
`,
    // The auxiliary verb is a property of the verb so there is no need to copy it.
    `
\\beginParagraph
  \\thirdAction(subject, VERB_FR_ALLER, PRESENT_PERFECT_INDICATIVE_FR)
\\endParagraph
`,
    'fr_FR',
  ],

  'not supported agree': [
    `
p
  +verb(subject, {verb: 'loger', tense:'PASSE_COMPOSE', aux:'AVOIR', agree: agreeWith})
`,
    `
\\beginParagraph
  \\thirdAction(subject, VERB_FR_LOGER, PRESENT_PERFECT_INDICATIVE_FR, _DIRECT_OBJECT_AGREEMENT: agreeWith)
\\endParagraph
`,
    'fr_FR',
  ],

  'pronominal form': [
    `
p
  +verb(subject, {verb: 'émanciper', tense:'SUBJONCTIF_IMPARFAIT', pronominal:true})
`,
    `
\\beginParagraph
  \\thirdAction(subject, VERB_FR_ÉMANCIPER, PAST_SUBJUNCTIVE_FR, _FORM: PRONOMINAL_FORM)
\\endParagraph
`,
    'fr_FR',
  ],
};
