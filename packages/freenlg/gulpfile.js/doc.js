const { src, dest, parallel } = require('gulp');

//const fs = require('fs');
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const merge = require('merge-stream');
const fs = require('fs');
const { version } = require('../package.json');

function copyStaticElts() {
  return src([
    `../../node_modules/codemirror-minified/lib/codemirror.js`,
    `dist/browser/freenlg_tiny_*_comp.js`,
    `../../node_modules/codemirror-minified/lib/codemirror.css`,
    `../../node_modules/codemirror-minified/mode/pug/pug.js`,
    `../../node_modules/codemirror-minified/mode/javascript/javascript.js`,
    `../../node_modules/vue-codemirror/dist/vue-codemirror.js`,
    'doc/editor/lib/vue.min.js',
    'doc/editor/editor.css',
  ]).pipe(dest('doc_output/'));
}

function js(cb) {
  let dir = 'doc_output';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('📁  folder created:', dir);
  }
  let editorJs = fs.readFileSync('doc/editor/editor.js', 'utf8');
  editorJs = editorJs.replace('$FREENLG_VERSION', version);
  fs.writeFileSync('doc_output/editor.min.js', editorJs, 'utf8');
  cb();
}

function publishS3() {
  var publisher = awspublish.create({
    params: {
      Bucket: 'freenlg.org',
    },
  });

  var gzip = src(`doc_output/freenlg_tiny_*_comp.js`)
    .pipe(
      rename(function(path) {
        path.dirname = 'doc_secret/' + path.dirname;
      }),
    )
    .pipe(awspublish.gzip());

  var plain = src(['doc_output/*', `!doc_output/freenlg_tiny_*_comp.js`]);

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
