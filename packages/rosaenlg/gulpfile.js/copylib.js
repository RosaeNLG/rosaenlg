const { src, dest } = require('gulp');
const replace = require('gulp-replace');
const version = require('../package.json').version;

function copyAndChange() {
  return (
    src(['../lib/index.js'])
      // See http://mdn.io/string.replace#Specifying_a_string_as_a_parameter
      .pipe(replace(/PLACEHOLDER_ROSAENLG_VERSION/, version))
      .pipe(dest('../dist/'))
  );
}

exports.all = copyAndChange;
