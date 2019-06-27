var ItalianAdjectives = require('./dist/index.js');

// azzurre
console.log(ItalianAdjectives.agreeItalianAdjective('azzurro', 'F', 'P'));

// Sant'
console.log(ItalianAdjectives.agreeItalianAdjective('Santo', 'F', 'S', 'Anna', true));
