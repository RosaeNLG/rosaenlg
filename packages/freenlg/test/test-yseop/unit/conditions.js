module.exports = {
  simple: [
    `
p
  if test==true
    | content if
`,
    `
\\beginParagraph
  \\if (test==true) /* TODO migrate condition */
    content if
  \\endIf
\\endParagraph
`,
  ],

  else: [
    `
p
  if test==true
    | content if
  else
    | content else
`,
    `
\\beginParagraph
  \\if (test==true) /* TODO migrate condition */
    content if
  \\else
    content else
  \\endIf
\\endParagraph
`,
  ],

  'one after the other': [
    `
p
  if test==true
    | content if
  if test2==true
    | content if 2
`,
    `
\\beginParagraph
  \\if (test==true) /* TODO migrate condition */
    content if
  \\endIf
  \\if (test2==true) /* TODO migrate condition */
    content if 2
  \\endIf
\\endParagraph
`,
  ],
  intricated: [
    `
p
  if test==true
    | content if
    if test2==true
      | content if 2
    else
      | content else 2
  else
    | content else
`,
    `
\\beginParagraph
  \\if (test==true) /* TODO migrate condition */
    content if
    \\if (test2==true) /* TODO migrate condition */
      content if 2
    \\else
      content else 2
    \\endIf
  \\else
    content else
  \\endIf
\\endParagraph
`,
  ],
};
