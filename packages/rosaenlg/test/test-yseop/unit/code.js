module.exports = {
  'simple line': [
    `
span
  - var bla = 'blabla';
`,
    `
\\beginStyle(-> XmlTree --> elementName "span" --> xmlNamespace YSEOP_TEXT_NAMESPACE;)
  /* TODO MIGRATE CODE
    var bla = 'blabla';
  */
\\endStyle
`,
  ],

  'adjacent lines': [
    `
p
  - var bla = 'blabla';
  - var bla2 = 'blabla2';
`,
    `
\\beginParagraph
  /* TODO MIGRATE CODE
    var bla = 'blabla';
  */
  /* TODO MIGRATE CODE
    var bla2 = 'blabla2';
  */
\\endParagraph
`,
  ],

  'multiple lines in a block': [
    `
p
  - 
    var bla = 'blabla';
    var bla2 = 'blabla2';
    var bla3 = 'blabla3';
`,
    `
\\beginParagraph
  /* TODO MIGRATE CODE
    var bla = 'blabla';
    var bla2 = 'blabla2';
    var bla3 = 'blabla3';
  */
\\endParagraph
`,
  ],
};
