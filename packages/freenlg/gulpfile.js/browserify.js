const browserify = require('browserify');
const fs = require('fs');
const version = require('../package.json').version;

const { parallel } = require('gulp');

const alwaysIgnore = ['@freenlg/german-dict-helper', '@freenlg/lefff-helper'];

// language specific libs
const langSpecificLibs = {
  en_US: ['stopwords-us', 'snowball-stemmer.jsx/dest/english-stemmer.common.js', 'compromise', 'better-title-case'],
  de_DE: [
    'stopwords-de',
    'snowball-stemmer.jsx/dest/german-stemmer.common.js',
    '@freenlg/german-words',
    '@freenlg/german-adjectives',
    '@freenlg/german-ordinals',
    'write-int',
  ],
  fr_FR: [
    'stopwords-fr',
    'snowball-stemmer.jsx/dest/french-stemmer.common.js',
    '@freenlg/french-adjectives',
    'pluralize-fr',
    'titlecase-french',
    'written-number',
    '@freenlg/french-adjectives',
    '@freenlg/french-verbs',
    '@freenlg/french-ordinals',
    '@freenlg/french-words-gender',
  ],
};

function getIgnoreList(lang) {
  var res = [];

  res.push(...alwaysIgnore);

  Object.keys(langSpecificLibs).forEach(function(langKey) {
    if (langKey != lang) {
      res.push(...langSpecificLibs[langKey]);
    }
  });

  return res;
}

function generateNoCompile(lang) {
  let writeStream = fs.createWriteStream(`dist/browser/freenlg_tiny_${lang}_${version}.js`);

  var b = browserify({
    standalone: `freenlg_${lang}`,
    transform: ['brfs'],
  });

  b.add(`gulpfile.js/browserify/${lang}.js`);

  b.ignore(getIgnoreList(lang));

  b.transform('browserify-versionify', {
    placeholder: '__VERSION__',
    version: version,
  })
    .transform('unassertify', { global: true })
    .transform('envify', { global: true })
    .transform('uglifyify', { global: true })
    .plugin('common-shakeify')
    /*.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';*/
    .bundle()
    .pipe(require('minify-stream')({ sourceMap: false }))
    .pipe(writeStream);
}

function generateCompile(lang) {
  let writeStream = fs.createWriteStream(`dist/browser/freenlg_tiny_${lang}_${version}_comp.js`);

  var b = browserify({
    standalone: `freenlg_${lang}`,
    transform: ['brfs'],
  });

  b.add(`gulpfile.js/browserify/${lang}_comp.js`);

  b.ignore(getIgnoreList(lang));

  if (lang == 'fr_FR' || lang == 'en_US') {
    b.transform('browserify-versionify', {
      placeholder: '__VERSION__',
      version: version,
    })
      .transform('unassertify', { global: true })
      .transform('envify', { global: true })
      .transform('uglifyify', { global: true })
      .plugin('common-shakeify')
      /*.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';*/
      .bundle()
      .pipe(require('minify-stream')({ sourceMap: false }))
      .pipe(writeStream);
  } else if (lang == 'de_DE') {
    b.transform('browserify-versionify', {
      placeholder: '__VERSION__',
      version: version,
    })
      //.transform('unassertify', { global: true })
      //.transform('envify', { global: true })
      //.transform('uglifyify', { global: true })
      //.plugin('common-shakeify')
      /*.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';*/
      .bundle()
      //.pipe(require('minify-stream')({ sourceMap: false }))
      .pipe(writeStream);
  }
}

function generateNoCompile_fr_FR(cb) {
  generateNoCompile('fr_FR');
  cb();
}
function generateNoCompile_de_DE(cb) {
  generateNoCompile('de_DE');
  cb();
}
function generateNoCompile_en_US(cb) {
  generateNoCompile('en_US');
  cb();
}

function generateCompile_fr_FR(cb) {
  generateCompile('fr_FR');
  cb();
}
function generateCompile_de_DE(cb) {
  generateCompile('de_DE');
  cb();
}
function generateCompile_en_US(cb) {
  generateCompile('en_US');
  cb();
}

exports.fr_FR_compile = generateCompile_fr_FR;
exports.de_DE_compile = generateCompile_de_DE;
exports.en_US_compile = generateCompile_en_US;

exports.fr_FR = generateNoCompile_fr_FR;
exports.de_DE = generateNoCompile_de_DE;
exports.en_US = generateNoCompile_en_US;

exports.noCompile = parallel(exports.fr_FR, exports.de_DE, exports.en_US);
exports.compile = parallel(exports.fr_FR_compile, exports.de_DE_compile, exports.en_US_compile);

exports.all = parallel(exports.noCompile, exports.compile);
