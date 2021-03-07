/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { src, dest, series } = require('gulp');
const fs = require('fs');
const rename = require('gulp-rename');
const resolve = require('json-refs').resolveRefsAt;
const awspublish = require('gulp-awspublish');
const version = require('rosaenlg/package.json').version;
const swaggerProps = require('./public-swagger-props.json');

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

function copyschemas() {
  const base = '../rosaenlg-server-toolkit/src/swagger/';
  return src([`${base}/renderOptionsInput.schema.json`, `${base}/jsonPackage.schema.json`]).pipe(dest('schemas/'));
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
        required: true,
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

      // add server info
      swag.servers = [
        {
          url: 'https://' + swaggerProps.dev.domainName,
          description: 'development version on AWS Lambda',
        },
        {
          url: 'https://' + swaggerProps.prod.domainName,
          description: 'prod version on AWS Lambda',
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
              tokenUrl: swaggerProps.misc.tokenUrl, // is same on dev and prod
              'x-audience-dev': swaggerProps.dev.audience,
              'x-audience-prod': swaggerProps.prod.audience,
            },
          },
        },
        rapidApi: {
          type: 'apiKey',
          description: 'using secret key RapidAPI-Proxy-Secret in header (when called by RapidAPI)',
          name: 'RapidAPI-Proxy-Secret',
          in: 'header',
        },
      };

      swag.security = [
        {
          auth0: [],
          rapidApi: [],
        },
      ];

      // espace non ASCII, as AWS doc does not like them raw?
      let swagAsString = JSON.stringify(swag);
      swagAsString = swagAsString.replace(/[\u007F-\uFFFF]/g, function (chr) {
        return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
      });

      fs.writeFileSync('dist/openApiDocumentation_merged.json', swagAsString, 'utf8');
    },
    function (err) {
      console.log(err.stack);
    },
  );
  done();
}

function createConfForEnv(env) {
  const rawProps = fs.readFileSync('serverless-props.json', 'utf8');
  const parsed = JSON.parse(rawProps);
  const perEnv = parsed[env];
  fs.writeFileSync('conf-depl.json', JSON.stringify(perEnv), 'utf8');
}

function createConfForDev(cb) {
  createConfForEnv('dev');
  cb();
}
function createConfForProd(cb) {
  createConfForEnv('prod');
  cb();
}

function createConfForTest(cb) {
  testConf = {
    tokenIssuer: 'https://someissuer.auth0.com/',
    jwksUri: 'https://someissuer.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://someurl.org',
    sharedUser: 'RAPID_API_SHARED',
  };
  fs.writeFileSync('conf-depl.json', JSON.stringify(testConf), 'utf8');
  cb();
}

exports.copylibs = series(copylibs, versionName);
exports.copyschemas = copyschemas;
exports.swagger = swagger;
exports.s3 = publishS3;
exports.createConfForDev = createConfForDev;
exports.createConfForProd = createConfForProd;
exports.createConfForTest = createConfForTest;
