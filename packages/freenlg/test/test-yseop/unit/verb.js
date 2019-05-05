module.exports = {
  simple: [
    `
p
  +verb(subject, 'eat')
`,
    `
\\beginStyle("p")
  \\subjectVerb(subject, VERB_EN_EAT) /* TODO MIGRATE verb */
\\endStyle
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
\\beginStyle("p")
  \\subjectVerb(subject, VERB_EN_EAT, TENSE_PAST) /* TODO MIGRATE verb */
  \\subjectVerb(subject, VERB_EN_EAT, TENSE_FUTURE) /* TODO MIGRATE verb */
\\endStyle
`,
    'en_US',
  ],

  french: [
    `
p
  +verb(subject, {verb: 'faire', tense: 'PASSE_SIMPLE'})
`,
    `
\\beginStyle("p")
  \\subjectVerb(subject, VERB_FR_FAIRE, TENSE_PASSE_SIMPLE) /* TODO MIGRATE verb */
\\endStyle
`,
    'fr_FR',
  ],

  'aux être': [
    `
p
  +verb(subject, {verb: 'aller', tense:'PASSE_COMPOSE', aux:'ETRE'})
`,
    `
\\beginStyle("p")
  \\subjectVerb(subject, VERB_FR_ALLER, TENSE_PASSE_COMPOSE, auxiliary: VERB_FR_ETRE) /* TODO MIGRATE verb */
\\endStyle
`,
    'fr_FR',
  ],

  'not supported agree': [
    `
p
  +verb(subject, {verb: 'loger', tense:'PASSE_COMPOSE', aux:'ETRE', agree: agreeWith})
`,
    `
\\beginStyle("p")
  \\subjectVerb(subject, TODO) /* TODO MIGRATE verb {verb: 'loger', tense:'PASSE_COMPOSE', aux:'ETRE', agree: agreeWith} */
\\endStyle
`,
    'fr_FR',
  ],

  'not supported agree': [
    `
p
  +verb(subject, {verb: 'émanciper', tense:'SUBJONCTIF_IMPARFAIT', pronominal:true})
`,
    `
\\beginStyle("p")
  \\subjectVerb(subject, VERB_FR_ÉMANCIPER, TENSE_SUBJONCTIF_IMPARFAIT, PRONOMINAL_FORM) /* TODO MIGRATE verb */
\\endStyle
`,
    'fr_FR',
  ],
};
