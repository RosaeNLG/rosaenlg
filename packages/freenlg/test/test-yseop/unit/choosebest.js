/* 
  "choosebest" is a FreeNLG specific tag that generates a specific portion of text multiple times
  and then chooses the best generated text. It does not exist in Yseop and is therefore not migrated.
*/

module.exports = {
  simple: [
    `
p
  choosebest {among: 10}
    synz
      syn
        | A
      syn
        | B
`,
    `
\\beginParagraph
  /* INFO a FreeNLG choosebest mixin present here with params {among: 10} */
  \\beginSynonym
    \\choice
      A
    \\choice
      B
  \\endSynonym
\\endParagraph
`,
  ],
};
