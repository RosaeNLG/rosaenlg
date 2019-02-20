module.exports = {
"simple": [
`
p
  | #{test.val}
`,
`
\\beginStyle("p")
  \\value(test.val) /* TODO MIGRATE VALUE */
\\endStyle
`],

"with text just after": [
`
p
  | #{test.val} bla
`,
`
\\beginStyle("p")
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
\\endStyle
`],

"with text line after": [
`
p
  | #{test.val} 
  | bla
`,
`
\\beginStyle("p")
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
\\endStyle
`],

"multiple": [
`
p
  | #{test.val} bla #{getTest().val}
`,
`
\\beginStyle("p")
  \\value(test.val) /* TODO MIGRATE VALUE */
  bla
  \\value(getTest().val) /* TODO MIGRATE VALUE */
\\endStyle
`],

"ignore empty": [
`
p
  | #{''}
  | #{""}
  | bla
`,
`
\\beginStyle("p")
  bla
\\endStyle
`],
}
