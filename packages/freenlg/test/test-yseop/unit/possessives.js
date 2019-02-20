module.exports = {
"French simple": [
`
p
  +thirdPossession(BAGUE, 'poids')
`,
`
\\beginStyle("p")
  \\possessive(BAGUE, 'poids') /* TODO MIGRATE */
\\endStyle
`, 'fr_FR'],

"German simple": [
`
p
  +thirdPossession(PRODUKT, adjective)
`,
`
\\beginStyle("p")
  \\possessive(PRODUKT, adjective) /* TODO MIGRATE */
\\endStyle
`, 'de_DE'],

"German complex": [
`
p
  +thirdPossession(PRODUKT, 'Farbe', {case:'GENITIVE'})
  +thirdPossession(PRODUKT, adjectives[index], {'FORCE_N': true})
`,
`
\\beginStyle("p")
  \\possessive(PRODUKT, 'Farbe', {case:'GENITIVE'}) /* TODO MIGRATE */
  \\possessive(PRODUKT, adjectives[index], {'FORCE_N': true}) /* TODO MIGRATE */
\\endStyle
`, 'de_DE'],

}
