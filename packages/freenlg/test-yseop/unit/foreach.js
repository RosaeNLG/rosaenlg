module.exports = {
"simple": [
`
p
  eachz elt in ['A','B','C'] with {"separator": ', ', last_separator: "and"}
    | #{elt}
`,
`
\\beginStyle("p")
  \\foreach(elt, ['A','B','C'], -> assembly --> SEP ", " --> LAST "and";) /* TODO MIGRATE foreach */
    \\value(elt) /* TODO MIGRATE VALUE */
  \\endForeach
\\endStyle
`],

}
