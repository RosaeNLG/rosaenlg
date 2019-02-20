module.exports = {
"simple": [
`
p
  | #[+value("bla")]
`,
`
\\beginStyle("p")
  \\value("bla") /* TODO MIGRATE */
\\endStyle
`],

"words with params": [
`
p
  | #[+value('largeur', {owner:BIJOU})]
  | #[+value('bague', {represents: PRODUIT3})]
  | #[+value('bague', {represents:BAGUE, det:'DEFINITE'})] 
  | #[+value('Durchmesser', {owner:PRODUKT, case:'GENITIVE'})]
`,
`
\\beginStyle("p")
  \\value('largeur', {owner:BIJOU}) /* TODO MIGRATE */
  \\value('bague', {represents: PRODUIT3}) /* TODO MIGRATE */
  \\value('bague', {represents:BAGUE, det:'DEFINITE'}) /* TODO MIGRATE */
  \\value('Durchmesser', {owner:PRODUKT, case:'GENITIVE'}) /* TODO MIGRATE */
\\endStyle
`],

"with numbers": [
`
p
  | #[+value(9000)]
  | #[+value(1562.407)]
  | #[+value(5500, {'TEXTUAL':true })]
  | #[+value(21, {'ORDINAL_TEXTUAL':true })]
  | #[+value(20, {'ORDINAL_NUMBER':true })]
  | #[+value(1230974, {'FORMAT': '0.0a'})]
`,
`
\\beginStyle("p")
  \\value(9000) /* TODO MIGRATE */
  \\value(1562.407) /* TODO MIGRATE */
  \\value(5500, {'TEXTUAL':true }) /* TODO MIGRATE */
  \\value(21, {'ORDINAL_TEXTUAL':true }) /* TODO MIGRATE */
  \\value(20, {'ORDINAL_NUMBER':true }) /* TODO MIGRATE */
  \\value(1230974, {'FORMAT': '0.0a'}) /* TODO MIGRATE */ 
\\endStyle
`],

"date": [
`
p
  | #[+value(new Date('2018-06-01'), "Do MMMM YYYY")]
`,
`
\\beginStyle("p")
  \\value(new Date('2018-06-01'), "Do MMMM YYYY") /* TODO MIGRATE */
\\endStyle
`],

"det and adjectives": [
`
p
  | #[+value('OnePlus 5T', {represents: PRODUKT2, gender:'N', det: 'DEFINITE'})]
  | #[+value('affaire',     {det:'INDEFINITE',  adj:'sale',       adjPos:'BEFORE', number:'P'})]
  | #[+value('OnePlus 3T', {case:'ACCUSATIVE', det:'DEFINITE', adj:'neu', gender:'N'})]
`,
`
\\beginStyle("p")
  \\value('OnePlus 5T', {represents: PRODUKT2, gender:'N', det: 'DEFINITE'}) /* TODO MIGRATE */
  \\value('affaire', {det:'INDEFINITE',  adj:'sale',       adjPos:'BEFORE', number:'P'}) /* TODO MIGRATE */
  \\value('OnePlus 3T', {case:'ACCUSATIVE', det:'DEFINITE', adj:'neu', gender:'N'}) /* TODO MIGRATE */
\\endStyle
`],

"POS tagger": [
`
p
  | #[+value("<diese neu Gurke>", {case:'GENITIVE'})]
  | #[+value("<des sale affaires P>")]
`,
`
\\beginStyle("p")
  \\value("<diese neu Gurke>", {case:'GENITIVE'}) /* TODO MIGRATE */
  \\value("<des sale affaires P>") /* TODO MIGRATE */
\\endStyle
`],

}
