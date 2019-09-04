module.exports = {
  simple: [
    `
p
  each elt in elts
    | #{elt}
`,
    `
\\beginParagraph
  \\foreach(elt, elts) /* TODO MIGRATE foreach */
    \\value(elt) /* TODO MIGRATE VALUE */
  \\endForeach
\\endParagraph
`,
  ],
};
