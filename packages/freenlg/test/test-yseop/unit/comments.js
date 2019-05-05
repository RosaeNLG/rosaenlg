module.exports = {
  'simple comment': [
    `
//- some comment
p
  //- another comment
`,
    `
// some comment
\\beginStyle("p")
  // another comment
\\endStyle
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
\\beginStyle("p")
  /*
    second block
    with lines
  */
\\endStyle
`,
  ],
};
