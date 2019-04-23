const { src, dest, parallel, series } = require('gulp');

const grammars = require('./grammars');
const browserify = require('./browserify');
const mainpug = require('./mainpug');

exports.grammars = grammars.all;
exports.browserify = browserify.all;
exports.mainpug = mainpug.all;
