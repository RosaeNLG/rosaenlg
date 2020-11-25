/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { series, parallel, src, dest } = require('gulp');
const fs = require('fs');
const rosaeNlgVersion = require('../rosaenlg/package.json').version;
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const merge = require('merge-stream');
const s3 = require('s3');

function getAllTemplates() {
  const templatesParLang = JSON.parse(fs.readFileSync('src/templates/templates.json'));
  const languages = Object.keys(templatesParLang);
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    const templates = templatesParLang[language];
    for (let j = 0; j < templates.length; j++) {
      // const name = templates[j][0];
      const filename = templates[j][1];
      const template = fs.readFileSync(`src/templates/${language}/${filename}`);
      //console.log(`${name} => ${template}`);

      // remplace filename by content
      templates[j][1] = template.toString();
    }
  }
  return templatesParLang;
}

function jsTemplates(cb) {
  const templates = `const templates=${JSON.stringify(getAllTemplates())};\nexport default templates;`;
  fs.writeFile('src/assets/templates.js', templates, 'utf8', cb);
}

function cleanPublic(cb) {
  fs.readdir('public', (_err, files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (/rosaenlg_tiny_.*\.js/.test(file)) {
        fs.unlinkSync('public/' + file);
        // console.log('deleted ' + file);
      }
    }
    cb();
  });
}

function copyRosaeLibs() {
  // js: when already minified
  return src([
    `../rosaenlg/dist/rollup/rosaenlg_tiny_en_US_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/rollup/rosaenlg_tiny_fr_FR_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/rollup/rosaenlg_tiny_de_DE_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/rollup/rosaenlg_tiny_it_IT_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/rollup/rosaenlg_tiny_es_ES_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/rollup/rosaenlg_tiny_OTHER_${rosaeNlgVersion}_comp.js`,
    '../rosaenlg-packager/dist/rosaenlg-packager-bundle.js',
  ]).pipe(dest('public/'));
}

const destFolder = 'ide/';

function publishS3() {
  const publisher = awspublish.create({
    params: {
      Bucket: 'rosaenlg.org',
    },
  });

  const gzipRosae = src([
    `dist/rosaenlg_tiny_*_*_comp.js`,
  ])
    .pipe(
      rename(function (path) {
        path.dirname = destFolder;
      }),
    )
    .pipe(awspublish.gzip());

  const gzipJs = src([
    `dist/js/chunk-vendors.*.js`,
  ])
    .pipe(
      rename(function (path) {
        path.dirname = destFolder + 'js/';
      }),
    )
    .pipe(awspublish.gzip());

  const otherRoot = src([
    'dist/*',
    `!dist/rosaenlg_tiny_*_*_comp.js`,
  ])
    .pipe(
      rename(function (path) {
        path.dirname = destFolder;
      }),
    );

  const allJs = src([
    `dist/js/*`,
    `!dist/js/chunk-vendors.*.js`,
  ])
    .pipe(
      rename(function (path) {
        path.dirname = destFolder + 'js/';
      }),
    );

  function getFolder(name) {
    return src([
      `dist/${name}/*`,
    ])
      .pipe(
        rename(function (path) {
          path.dirname = destFolder + name + '/';
        }),
      );
  }

  return merge(gzipRosae, gzipJs, otherRoot, getFolder('css'), getFolder('fonts'), getFolder('img'), allJs)
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

function cleanupS3(cb) {
  const client = s3.createClient({
    s3Options: {
      region: 'eu-west-1',
    },
  });

  let contents = [];
  const lister = client.listObjects({
    s3Params: {
      Bucket: "rosaenlg.org",
      Prefix: destFolder,
    },
  });
  lister.on('error', function (err) {
    console.error("unable to list:", err.stack);
    cb(err);
  });
  lister.on('data', function (data) {
    for (let i = 0; i < data.Contents.length; i++) {
      contents.push({
        Key: data.Contents[i].Key
      })
    }
  });
  lister.on('end', function () {
    if (contents.length == 0) {
      console.log("is already empty, nothing to delete.");
      cb();
    } else {
      console.log("done listing, start deleting...");
      // console.log(contents);
      const deleter = client.deleteObjects({
        Delete: {
          Objects: contents
        },
        Bucket: "rosaenlg.org",
      });
      deleter.on('error', function (err) {
        console.error("unable to delete:", err.stack);
        cb(err);
      });
      deleter.on('progress', function () {
        console.log("progress delete", deleter.progressMd5Amount,
          deleter.progressAmount, deleter.progressTotal);
      });
      deleter.on('end', function () {
        console.log("done deleting.");
        cb();
      });
    }

  });
}

exports.all = parallel(jsTemplates, series(cleanPublic, copyRosaeLibs));

exports.s3 = series(cleanupS3, publishS3);
