var hljs = (window.hljs = require('highlight.js/lib/core'))

// only the ones (potentially) used in RosaeNLG documentation
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'))
hljs.registerLanguage('dockerfile', require('highlight.js/lib/languages/dockerfile'))
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))
hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'))
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'))
