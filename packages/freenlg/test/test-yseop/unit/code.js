module.exports = {
  'simple line': [
    `
p
  - var bla = 'blabla';
`,
    `
\\beginStyle("p")
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
\\beginStyle("p")
  /* TODO MIGRATE CODE
    var bla = 'blabla';
  */
  /* TODO MIGRATE CODE
    var bla2 = 'blabla2';
  */
\\endStyle
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
\\beginStyle("p")
  /* TODO MIGRATE CODE
    var bla = 'blabla';
    var bla2 = 'blabla2';
    var bla3 = 'blabla3';
  */
\\endStyle
`,
  ],
};
