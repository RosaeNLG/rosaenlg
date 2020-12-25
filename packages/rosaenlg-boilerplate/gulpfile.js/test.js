const { src, series } = require('gulp');
const fs = require('fs');
const mocha = require('gulp-mocha');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

function test(cb, testFile, reportDir) {
  return (
    src(testFile, { read: false })
      // `gulp-mocha` needs filepaths so you can't have any plugins before it
      .pipe(
        mocha({
          inlineDiffs: true,
          reporter: 'mochawesome',
          reporterOptions: {
            code: false,
            reportDir: reportDir,
          },
        }),
      )
      .on('error', handleError)
  );
}

function hackcss(cb, reportDir) {
  // hack result css
  const cssPath = `${reportDir}/assets/app.css`;
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace('pre{', 'pre{white-space: pre-wrap;');
  fs.writeFileSync(cssPath, css, 'utf8');

  cb();
}

exports.all = series(
  (cb) => test(cb, 'test/test.js', 'mochawesome-report'),
  (cb) => hackcss(cb, 'mochawesome-report'),
);
