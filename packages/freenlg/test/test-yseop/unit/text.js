module.exports = {
  simple: [
    `
p
  | bla
`,
    `
\\beginStyle("p")
  bla
\\endStyle
`,
  ],

  multiline: [
    `
p
  | bla
  | bla
  | bla
`,
    `
\\beginStyle("p")
  bla
  bla
  bla
\\endStyle
`,
  ],

  sameline: [
    `
p
  | bla bla bla
  | bla
`,
    `
\\beginStyle("p")
  bla bla bla
  bla
\\endStyle
`,
  ],
};
