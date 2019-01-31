module.exports = {
"simple": [
`
p
  itemz {separator: ', ', last_separator: 'and'}
    item
      | first
    item
      | second
    item
      | third
`,
`
\\beginStyle("p")
  \\beginList(TODO)
    \\nextItem
      first
    \\nextItem
      second
    \\nextItem
      third
  \\endList
\\endStyle

`],

}
