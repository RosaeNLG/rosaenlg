module.exports = {
"simple": [
`
p
  if test==true
    | content if
`,
`
\\beginStyle("p")
  \\if (test==true) /* TODO migrate condition */
    content if
  \\endIf
\\endStyle
`],

"else": [
`
p
  if test==true
    | content if
  else
    | content else
`,
`
\\beginStyle("p")
  \\if (test==true) /* TODO migrate condition */
    content if
  \\else
    content else
  \\endIf
\\endStyle
`],

"one after the other": [
`
p
  if test==true
    | content if
  if test2==true
    | content if 2
`,
`
\\beginStyle("p")
  \\if (test==true) /* TODO migrate condition */
    content if
  \\endIf
  \\if (test2==true) /* TODO migrate condition */
    content if 2
  \\endIf
\\endStyle
`], 
"intricated": [
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
\\beginStyle("p")
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
\\endStyle
`],
}

