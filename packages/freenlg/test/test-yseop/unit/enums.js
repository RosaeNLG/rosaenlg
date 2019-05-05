module.exports = {
  simple: [
    `
p
  itemz {"separator": ', ', last_separator: "and"}
    item
      | first
    item
      | second
    item
      | third
`,
    `
\\beginStyle("p")
  \\beginList(-> assembly --> SEP ", " --> LAST "and";)
    \\nextItem
      first
    \\nextItem
      second
    \\nextItem
      third
  \\endList
\\endStyle

`,
  ],

  leftitems: [
    `
p
  itemz {"separator": ', ', misc:"blabla"}
    item
      | first
    item
      | second
    item
      | third
`,
    `
\\beginStyle("p")
  \\beginList(-> assembly --> SEP ", " ;) /* TODO MIGRATE {"misc":"blabla"} */
    \\nextItem
      first
    \\nextItem
      second
    \\nextItem
      third
  \\endList
\\endStyle

`,
  ],
};
