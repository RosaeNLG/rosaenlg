module.exports = {
"definition": [
`
mixin testMixin
  | some text
`,
`
TextFunction testMixin
--> text \\(
  some text
\\);
`],

"with args": [
`
mixin testMixin(arg1, arg2)
  | some text
  | #{arg1}
`,
`
TextFunction testMixin(Object arg1, Object arg2)
--> text \\(
  some text
  \\value(arg1) /* TODO MIGRATE VALUE */
\\);
`],

"call simple mixin - other syntax": [
`
p
  +simple
`,
`
\\beginStyle("p")
  \\simple
\\endStyle
`],

"call simple mixin": [
`
p
  | #[+simple]
`,
`
\\beginStyle("p")
  \\simple
\\endStyle
`],

"call mixin with args": [
`
p
  | #[+withargs(arg1, arg2)]
`,
`
\\beginStyle("p")
  \\withargs(arg1, arg2)
\\endStyle
`],


}
