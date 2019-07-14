//const { src, dest, parallel, series } = require('gulp');

const grammars = require('./grammars');
const browserify = require('./browserify');
const mainpug = require('./mainpug');

exports.grammars = grammars.all;
exports.mainpug = mainpug.all;



// browser versions

//exports.browserify = browserify.all;

exports.browser_it_IT_compile = browserify.it_IT_compile;
exports.browser_it_IT = browserify.it_IT;

exports.browser_fr_FR_compile = browserify.fr_FR_compile;
exports.browser_fr_FR = browserify.fr_FR;

exports.browser_de_DE_compile = browserify.de_DE_compile;
exports.browser_de_DE = browserify.de_DE;

exports.browser_en_US_compile = browserify.en_US_compile;
exports.browser_en_US = browserify.en_US;

exports.browser_OTHER_compile = browserify.OTHER_compile;
exports.browser_OTHER = browserify.OTHER;
