const { src } = require('gulp');
const fs = require('fs');
const resolve = require('json-refs').resolveRefs;
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');

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
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

function swagger(done) {
  const doc = JSON.parse(fs.readFileSync('src/swagger/openApiDocumentation.json'));

  resolve(doc).then(
    function(res) {
      // dynamically add version
      const packageJson = JSON.parse(fs.readFileSync('package.json'));
      res.resolved.version = packageJson.version;
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
  const fs = require('fs');
  const path = 'dist/server.js';
  const shebang = '#!/usr/bin/env node\n\n';
  fs.writeFileSync(path, shebang + fs.readFileSync(path), 'utf8');
  done();
}

exports.swagger = swagger;
exports.shebangify = shebangify;
exports.s3 = publishS3;
