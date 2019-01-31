module.exports = {
"simple": [
`
p
  if test==true
    | content if
`,
`
\\beginStyle(p)
  \\if (test==true) /* TODO migrate condition */
    content if
  \\endIf
\\endStyle
`],
/*
"else": [
`
p
  if test==true
    | content if
  else
    | content else
`,
`
todo
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
todo
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
todo
`],
*/
}

