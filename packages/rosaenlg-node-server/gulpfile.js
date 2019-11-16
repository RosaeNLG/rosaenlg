// const { src, dest, parallel, series } = require('gulp');
const fs = require('fs');
const resolve = require('json-refs').resolveRefs;

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
