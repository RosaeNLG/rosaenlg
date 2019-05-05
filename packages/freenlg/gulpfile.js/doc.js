const { src, dest, parallel, series } = require('gulp');

//const fs = require('fs');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const merge = require('merge-stream');

const freeNlgVersion = '0.15.6';

function copyStaticElts() {
  return src([
    `../../node_modules/codemirror-minified/lib/codemirror.js`,
    `dist/browser/freenlg_tiny_*_${freeNlgVersion}_comp.js`,
    `../../node_modules/codemirror-minified/lib/codemirror.css`,
    `../../node_modules/codemirror-minified/mode/pug/pug.js`,
    `../../node_modules/codemirror-minified/mode/javascript/javascript.js`,
    `../../node_modules/vue-codemirror/dist/vue-codemirror.js`,
    'doc/editor/lib/vue.min.js',
    'doc/editor/editor.css',
  ]).pipe(dest('doc_output/'));
}

function js() {
  return src(['doc/editor/editor.js'])
    .pipe(concat('editor.min.js'))
    .pipe(dest('doc_output/'));
}

function publishS3() {
  var publisher = awspublish.create({
    params: {
      Bucket: 'freenlg.org',
    },
  });

  var gzip = src(`doc_output/freenlg_tiny_*_${freeNlgVersion}_comp.js`)
    .pipe(
      rename(function(path) {
        path.dirname = 'doc_secret/' + path.dirname;
      }),
    )
    .pipe(awspublish.gzip());

  var plain = src(['doc_output/*', `!doc_output/freenlg_tiny_*_${freeNlgVersion}_comp.js`]);

  return merge(gzip, plain)
    .pipe(
      rename(function(path) {
        path.dirname = 'doc_secret/' + path.dirname;
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

exports.all = parallel(copyStaticElts, js);

exports.s3 = publishS3;
