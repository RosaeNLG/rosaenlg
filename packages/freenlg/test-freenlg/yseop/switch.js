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
  
  }
  