module.exports = {
  simple: [
    `
p
  each elt in elts
    | #{elt}
`,
    `
\\beginStyle("p")
  \\foreach(elt, elts) /* TODO MIGRATE foreach */
    \\value(elt) /* TODO MIGRATE VALUE */
  \\endForeach
\\endStyle
`,
  ],
};
