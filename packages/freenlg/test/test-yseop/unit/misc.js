module.exports = {
  simple: [
    `
p
  | #[+syn('colors', 'tints', 'tones')]
`,
    `
\\beginStyle("p")
  \\synonym('colors', 'tints', 'tones')
\\endStyle
`,
  ],
};
