//const { src, dest, parallel, series } = require('gulp');

const grammars = require('./grammars');
const mainpug = require('./mainpug');

exports.grammars = grammars.all;
exports.mainpug = mainpug.all;
