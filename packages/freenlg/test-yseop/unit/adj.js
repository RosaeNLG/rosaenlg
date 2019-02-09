module.exports = {
"English": [
`
p
  +agreeAdj('cool', adjWith)
`,
`
\\beginStyle("p")
  \\adjective('cool', adjWith) /* TODO MIGRATE */
\\endStyle
`, 'en_US'],

"French": [
`
p
  +agreeAdj('vieux', 'caméra', {det:'DEFINITE'})
`,
`
\\beginStyle("p")
  \\adjective('vieux', 'caméra', {det:'DEFINITE'}) /* TODO MIGRATE */
\\endStyle
`, 'fr_FR'],

"German": [
`
p
  +agreeAdj('alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'})
`,
`
\\beginStyle("p")
  \\adjective('alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}) /* TODO MIGRATE */
\\endStyle
`, 'de_DE'],

}
