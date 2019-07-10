module.exports = {
  simple: [
    `
p
  case model.getSomeString()
    when "1"
      | case 1
    when '2'
      | case 2
    when '3'
      | case 3
`,
    `
\\beginParagraph
  \\switch(model.getSomeString()) /* TODO MIGRATION case */
    \\case("1")
      case 1
    \\case("2")
      case 2
    \\case("3")
      case 3
  \\endSwitch
\\endParagraph
`,
  ],

  'with default': [
    `
p
  case something
    when first
      | case first
    default
      | case default
`,
    `
\\beginParagraph
  \\switch(something) /* TODO MIGRATION case */
    \\case(first)
      case first
    \\default
      case default
  \\endSwitch
\\endParagraph
`,
  ],
};
