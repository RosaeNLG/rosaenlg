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
\\beginStyle("p")
  /* TODO migrate choosebest {among: 10} */
  \\beginSynonym
    \\syn
      A
    \\syn
      B
  \\endSynonym
\\endStyle
`,
  ],
};
