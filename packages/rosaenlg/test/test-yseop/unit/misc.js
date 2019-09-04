module.exports = {
  simple: [
    `
p
  | #[+syn('colors', 'tints', 'tones')]
`,
  // no single quotes in YML
    `
\\beginParagraph
  \\synonym("colors", "tints", "tones")
\\endParagraph
`,
  ],
};
