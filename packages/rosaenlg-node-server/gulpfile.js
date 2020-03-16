const { src } = require('gulp');
const fs = require('fs');
const resolve = require('json-refs').resolveRefsAt;
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const version = require('./package.json').version;

function publishS3() {
  const publisher = awspublish.create({
    params: {
      Bucket: 'rosaenlg.org',
    },
  });

  const destFolder = 'openapi/';

  return src(['dist/redoc-static.html'])
    .pipe(
      rename(function(path) {
        path.dirname = destFolder + path.dirname;
        path.basename = path.basename + '_node';
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

function swagger(done) {
  resolve('../rosaenlg-server-toolkit/src/swagger/openApiDocumentation.json').then(
    function(res) {
      // dynamically add version
      res.resolved.info.version = version;
      fs.writeFileSync('dist/openApiDocumentation_merged.json', JSON.stringify(res.resolved), 'utf8');
    },
    function(err) {
      console.log(err.stack);
    },
  );
  done();
}

// thanks to https://stackoverflow.com/questions/23298295/how-to-make-a-shell-executable-node-file-using-typescript
function shebangify(done) {
  const path = 'dist/server.js';
  const shebang = '#!/usr/bin/env node\n\n';
  fs.writeFileSync(path, shebang + fs.readFileSync(path), 'utf8');
  done();
}

exports.swagger = swagger;
exports.shebangify = shebangify;
exports.s3 = publishS3;
