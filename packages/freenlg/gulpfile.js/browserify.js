const browserify = require('browserify');
const fs = require('fs');
const version = require('../package.json').version;


const { src, dest, parallel, series } = require('gulp');

const alwaysIgnore = ['german-dict-helper', 'lefff-helper'];

// language specific libs
const langSpecificLibs = {
  'en_US': [
    'stopwords-us',
    'snowball-stemmer.jsx/dest/english-stemmer.common.js',
    'compromise',
    'better-title-case',
  ],
  'de_DE': [
    'stopwords-de',
    'snowball-stemmer.jsx/dest/german-stemmer.common.js',
    'german-words',
    'german-adjectives',
    'german-ordinals',
    'write-int'
  ],
  'fr_FR': [
    'stopwords-fr',
    'snowball-stemmer.jsx/dest/french-stemmer.common.js',
    'french-adjectives',
    'pluralize-fr',
    'titlecase-french',
    'written-number',
    'french-adjectives',
    'french-verbs',
    'french-ordinals',
    'french-words-gender'
  ]
};

function getIgnoreList(lang) {
  var res = [];

  res.push(...alwaysIgnore);

  Object.keys(langSpecificLibs).forEach(function(langKey) {
    if (langKey!=lang) {
      res.push(...langSpecificLibs[langKey]);
    }
  });

  return res;
}

function generateFor(lang) {

  let writeStream = fs.createWriteStream(`dist/browser/freenlg_tiny_${lang}_${version}.js`);

  var b = browserify({
    standalone: 'freenlg',
    transform: ['brfs'],
  });

  b.add( `gulpfile.js/browserify/${lang}.js` );

  b.ignore( getIgnoreList(lang) );

  b
    .transform('browserify-versionify', {
      placeholder: '__VERSION__',
      version: version
    })
    .transform('unassertify', { global: true })
    .transform('envify', { global: true })
    .transform('uglifyify', { global: true })
    .plugin('common-shakeify')
    //.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';
    .bundle()
    .pipe(require('minify-stream')({ sourceMap: false }))
    .pipe(writeStream);
}

function generate_fr_FR(cb) {
  generateFor('fr_FR');
  cb();
}
function generate_de_DE(cb) {
  generateFor('de_DE');
  cb();
}
function generate_en_US(cb) {
  generateFor('en_US');
  cb();
}


exports.fr_FR = generate_fr_FR;
exports.de_DE = generate_de_DE;
exports.en_US = generate_en_US;

exports.all = parallel(exports.fr_FR, exports.de_DE, exports.en_US);
