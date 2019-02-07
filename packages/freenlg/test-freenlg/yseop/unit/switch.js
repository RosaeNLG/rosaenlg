module.exports = {
"simple": [
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
\\beginStyle("p")
  \\beginCase(model.getSomeString()) /* TODO MIGRATION case */
    \\when("1")
      case 1
    \\when("2")
      case 2
    \\when("3")
      case 3
  \\endCase
\\endStyle
`],
  
"with default": [
`
p
  case something
    when first
      | case first
    default
      | case default
`,
`
\\beginStyle("p")
  \\beginCase(something) /* TODO MIGRATION case */
    \\when(first)
      case first
    \\default
      case default
  \\endCase
\\endStyle
`],
  }
  