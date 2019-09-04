module.exports = {
  simple: [
    `
p
  synz
    syn
      | A
    syn
      | B
    syn
      | C
`,
    `
\\beginParagraph
  \\beginSynonym
    \\choice
      A
    \\choice
      B
    \\choice
      C
  \\endSynonym
\\endParagraph
`,
  ],
  random: [
    `
p
  synz {mode: 'random'}
    syn
      | A
    syn
      | B
`,
    `
\\beginParagraph
  \\beginSynonym
    \\choice
      A
    \\choice
      B
  \\endSynonym
\\endParagraph
`,
  ],
  sequence: [
    `
p
  synz {mode: 'sequence'}
    syn
      | A
    syn
      | B
`,
    `
\\beginParagraph
  \\beginSynonym /* TODO MIGRATE {"mode":"sequence"} */
    \\choice
      A
    \\choice
      B
  \\endSynonym
\\endParagraph
`,
  ],
  strange: [
    `
p
  synz {mode: getMode()}
    syn
      | A
    syn
      | B
`,
    `
\\beginParagraph
  \\beginSynonym /* TODO MIGRATE {mode: getMode()} */
    \\choice
      A
    \\choice
      B
  \\endSynonym
\\endParagraph
`,
  ],
};
