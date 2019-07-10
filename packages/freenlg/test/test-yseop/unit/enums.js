module.exports = {
  simple: [
    `
p
  itemz {"separator": ',', last_separator: "and"}
    item
      | first
    item
      | second
    item
      | third
`,
    `
\\beginParagraph
  \\beginList(-> TextListSentenceAssembly --> separator [",", _LAST, "and"];)
    \\nextItem
      first
    \\nextItem
      second
    \\nextItem
      third
  \\endList
\\endParagraph

`,
  ],
  // this test case is here to check that parameters not supported by the migration tool, here "some_unknow_option",
  // are still kept in the migration process so that the user can migrate it manually
  leftitems: [
    `
p
  itemz {"separator": ', ', some_unknow_option:"blabla"}
    item
      | first
    item
      | second
    item
      | third
`,
    `
\\beginParagraph
  \\beginList(-> TextListSentenceAssembly --> separator ", ";) /* TODO MIGRATE {"some_unknow_option":"blabla"} */
    \\nextItem
      first
    \\nextItem
      second
    \\nextItem
      third
  \\endList
\\endParagraph

`,
  ],
};
