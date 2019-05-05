module.exports = {
  simple: [
    `
p
  recordSaid('TEST')
  if hasSaid('TEST')
    | ok
  deleteSaid('TEST')
`,
    `
\\beginStyle("p")
  \\action(TCEC.setKeyVal("TEST", true))
  \\if (TCEC.getKeyVal("TEST")==true) /* TODO migrate condition */
    ok
  \\endIf
  \\action(TCEC.setKeyVal("TEST", null))
\\endStyle
`,
  ],
};
