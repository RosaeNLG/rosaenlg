const { src, dest, series } = require('gulp');
const fs = require('fs');
const rename = require('gulp-rename');
const resolve = require('json-refs').resolveRefsAt;
const awspublish = require('gulp-awspublish');
const version = require('rosaenlg/package.json').version;

function copylibs() {
  const base = '../rosaenlg/dist/rollup';
  return src([`${base}/rosaenlg_*_${version}*.js`])
    .pipe(
      rename(function (path) {
        path.basename = path.basename.replace(version, 'lambda');
      }),
    )
    .pipe(dest('lib/'));
}

function versionName(cb) {
  fs.writeFileSync(`lib/version_flag_${version}`, version, 'utf8');
  cb();
}

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
        path.basename = path.basename + '_lambda';
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

//const languages = [['fr_FR', 'French']];

function swagger(done) {
  resolve('../rosaenlg-server-toolkit/src/swagger/openApiDocumentation.json').then(
    function (res) {
      const swag = res.resolved;
      // dynamically add version
      swag.info.version = version;
      // and change what is specific to lambda
      swag.info.description = 'API over the Natural Language Generation library RosaeNLG, on AWS lambda.';
      delete swag.servers;
      delete swag.paths['/templates/render'];
      delete swag.paths['/templates/{templateId}/reload'];
      delete swag.paths['/health'];
      // add language in the path
      const languageInpath = {
        name: 'language',
        in: 'path',
        schema: {
          type: 'string',
          enum: ['fr_FR', 'de_DE', 'it_IT', 'en_US', 'es_ES', 'OTHER'],
        },
        example: 'fr_FR',
        required: 'true',
        description: 'language',
      };
      // for render
      const render = swag.paths['/templates/{templateId}/{templateSha1}/render'];
      delete swag.paths['/templates/{templateId}/{templateSha1}/render'];
      swag.paths[`/templates/{language}/{templateId}/{templateSha1}`] = render;
      render.post.parameters.unshift(languageInpath);
      // for create
      const create = swag.paths['/templates'].put;
      delete swag.paths['/templates'].put;
      swag.paths['/templates/{language}'] = {
        put: create,
      };
      create.parameters.unshift(languageInpath);

      fs.writeFileSync('dist/openApiDocumentation_merged.json', JSON.stringify(swag), 'utf8');
    },
    function (err) {
      console.log(err.stack);
    },
  );
  done();
}
exports.copylibs = series(copylibs, versionName);
exports.swagger = swagger;
exports.s3 = publishS3;
