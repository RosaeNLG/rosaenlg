const { src, dest, parallel, series } = require('gulp');
const pegjs = require('gulp-pegjs');

function grammars() {
  return src('src/grammars/*.pegjs')
    .pipe(pegjs({format: "commonjs"}))
    .pipe(dest('dist'));
}

exports.all = grammars;
