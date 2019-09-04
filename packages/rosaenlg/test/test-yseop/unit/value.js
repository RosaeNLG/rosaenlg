module.exports = {
  simple: [
    `
p
  | #[+value("bla")]
`,
    `
\\beginParagraph
  \\value("bla") /* TODO MIGRATE */
\\endParagraph
`,
  ],

  'words with params': [
    `
p
  | #[+value('largeur', {owner:BIJOU})]
  | #[+value('bague', {represents: PRODUIT3})]
  | #[+value('bague', {represents:BAGUE, det:'DEFINITE'})] 
  | #[+value('Durchmesser', {owner:PRODUKT, case:'GENITIVE'})]
`,
    `
\\beginParagraph
  \\value("largeur", _OWNER: BIJOU)
  \\value("bague") /* TODO MIGRATE {"represents":PRODUIT3} */
  \\value("bague", _DETERMINER: DEFINITE_ARTICLE) /* TODO MIGRATE {"represents":BAGUE} */
  \\value("Durchmesser", GENITIVE, _OWNER: PRODUKT)
\\endParagraph
`,
  ],

  'with numbers': [
    `
p
  | #[+value(9000)]
  | #[+value(1562.407)]
  | #[+value(5500, {'TEXTUAL':true })]
  | #[+value(21, {'ORDINAL_TEXTUAL':true })]
  | #[+value(20, {'ORDINAL_NUMBER':true })]
  | #[+value(1230974, {'FORMAT': '0.0a'})]
`,
    `
\\beginParagraph
  \\value(9000) /* TODO MIGRATE */
  \\value(1562.407) /* TODO MIGRATE */
  \\value(5500, -> Style --> numeralStyle _CARDINAL_NUMERAL;)
  \\value(21, -> Style --> numeralStyle _ORDINAL_NUMERAL;)
  \\value(20, -> Style --> numeralStyle _ORDINAL_NUMERAL_SHORT;)
  \\value(1230974) /* TODO MIGRATE {"FORMAT":"0.0a"} */
\\endParagraph
`,
  ],

  /*
    some date mapping is done, like:
      "YYYY" -> _DATE_YYYY
      "MM" -> _DATE_MM
      etc.
  */
  date: [
    `
p
  | #[+value(new Date('2018-06-01'), "Do MMMM YYYY")]
`,
    `
\\beginParagraph
  \\value(new Date("2018-06-01"), _DATE_YYYY, _DATE_MMMM) /* TODO MIGRATE "Do MMMM YYYY" */
\\endParagraph
`,
  ],

  'det and adjectives': [
    `
p
  | #[+value('OnePlus 5T', {represents: PRODUKT2, gender:'N', det: 'DEFINITE'})]
  | #[+value('affaire',     {det:'INDEFINITE',  adj:'sale',       adjPos:'BEFORE', number:'P'})]
  | #[+value('OnePlus 3T', {case:'ACCUSATIVE', det:'DEFINITE', adj:'neu', gender:'N'})]
`,
    `
\\beginParagraph
  \\value("OnePlus 5T", _GENDER: NEUTRAL, _DETERMINER: DEFINITE_ARTICLE) /* TODO MIGRATE {"represents":PRODUKT2} */
  \\value("affaire", _NUMBER: PLURAL, _DETERMINER: INDEFINITE_ARTICLE, _ADJECTIVE_POSITION: _BEFORE_NOUN, _ADJECTIVE: "sale")
  \\value("OnePlus 3T", ACCUSATIVE, _GENDER: NEUTRAL, _DETERMINER: DEFINITE_ARTICLE, _ADJECTIVE: "neu")
\\endParagraph
`,
  ],

  'German case': [
    `
p
  | #[+value('Gurke', {case:'GENITIVE'})]
`,
    `
\\beginParagraph
  \\value("Gurke", GENITIVE)
\\endParagraph
`,
    'de_DE',
  ],

  'POS tagger': [
    `
p
  | #[+value("<diese neu Gurke>", {case:'GENITIVE'})]
  | #[+value("<des sale affaires P>")]
`,
    `
\\beginParagraph
  \\value("<diese neu Gurke>", GENITIVE)
  \\value("<des sale affaires P>") /* TODO MIGRATE */
\\endParagraph
`,
  ],
};
