module.exports = {
  'simple comment': [
    `
//- some comment
p
  //- another comment
`,
    `
// some comment
\\beginParagraph
  // another comment
\\endParagraph
`,
  ],

  'block comments': [
    `
//-
  first block

p
  //-
    second block
    with lines
`,
    `
/*
  first block
*/
\\beginParagraph
  /*
    second block
    with lines
  */
\\endParagraph
`,
  ],
};
