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
      rename(function (path) {
        path.dirname = destFolder + path.dirname;
        path.basename = path.basename + '_node';
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

function swagger(done) {
  resolve('../rosaenlg-server-toolkit/src/swagger/openApiDocumentation.json').then(
    function (res) {
      const swag = res.resolved;

      // dynamically add version
      swag.info.version = version;

      // override default description
      swag.description = 'API over the Natural Language Generation library RosaeNLG, written in node.js.';

      // servers
      swag.servers = [
        {
          url: 'http://localhost:5000/',
          description: 'local development server',
        },
      ];

      // oauth
      swag.components.securitySchemes = {
        auth0: {
          type: 'oauth2',
          description:
            "oauth2 using auth0, machine to machine. \n\n Don't use *scope*, but add *audience* in the token request.",
          flows: {
            clientCredentials: {
              tokenUrl: 'some token URL, to be configured',
              'x-audience': 'some audience, to be configured',
            },
          },
        },
      };

      swag.security = [
        {
          auth0: [],
        },
      ];

      // no security on health
      swag.paths['/health'].get.security = [];

      fs.writeFileSync('dist/openApiDocumentation_merged.json', JSON.stringify(res.resolved), 'utf8');
    },
    function (err) {
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
