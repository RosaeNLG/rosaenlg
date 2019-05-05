//const { src, dest, parallel, series } = require('gulp');

const grammars = require('./grammars');
const browserify = require('./browserify');
const mainpug = require('./mainpug');
const doc = require('./doc');

exports.grammars = grammars.all;
exports.browserify = browserify.all;
exports.mainpug = mainpug.all;
exports.doc = doc.all;

exports.doc_s3 = doc.s3;

// shortcuts
// exports.browserify_compile = browserify.compile;
