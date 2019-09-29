const browserify = require('browserify');
const fs = require('fs');
const version = require('../package.json').version;
const alwaysIgnore = [
  'german-dict-helper',
  'lefff-helper',
  'morph-it-helper',
  'rosaenlg-yseop',
  'uglify-js', // looks like the new versions do not work in a browser? and used only by pug transformers
  'jstransformer-uglify-js',
];

// language specific libs
const langSpecificLibs = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  en_US: ['stopwords-us', 'snowball-stemmer.jsx/dest/english-stemmer.common.js', 'compromise', 'better-title-case'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  de_DE: [
    'stopwords-de',
    'snowball-stemmer.jsx/dest/german-stemmer.common.js',
    'german-adjectives',
    'german-determiners',
    'german-ordinals',
    'german-verbs',
    'german-words',
    'write-int',
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  fr_FR: [
    'stopwords-fr',
    'snowball-stemmer.jsx/dest/french-stemmer.common.js',
    'french-adjectives',
    'french-determiners',
    'french-h-muet-aspire',
    'french-ordinals',
    'french-verbs',
    'french-words-gender',
    'pluralize-fr',
    'titlecase-french',
    'written-number',
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  it_IT: [
    'stopwords-it',
    'snowball-stemmer.jsx/dest/italian-stemmer.common.js',
    'italian-adjectives',
    'italian-determiners',
    'italian-ordinals-cardinals',
    'italian-verbs',
    'italian-words',
  ],
  OTHER: [],
};

function getIgnoreList(lang) {
  const res = [];

  res.push(...alwaysIgnore);

  Object.keys(langSpecificLibs).forEach(function(langKey) {
    if (langKey != lang) {
      res.push(...langSpecificLibs[langKey]);
    }
  });

  return res;
}

function generate(lang, compile) {
  const compSuffix = compile ? '_comp' : '';
  const writeStream = fs.createWriteStream(`dist/browser/rosaenlg_tiny_${lang}_${version}${compSuffix}.js`);

  const b = browserify({
    standalone: `rosaenlg_${lang}`,
    transform: ['brfs'],
  });

  b.add(`gulpfile.js/browserify/${lang}${compSuffix}.js`);

  b.ignore(getIgnoreList(lang));

  if (lang === 'de_DE' && compile) {
    b.transform('browserify-versionify', {
      placeholder: '__VERSION__',
      version: version,
    })
      .bundle()
      .pipe(writeStream);
  } else {
    b.transform('browserify-versionify', {
      placeholder: '__VERSION__',
      version: version,
    })
      .transform('unassertify', { global: true })
      .transform('envify', { global: true })
      .plugin('common-shakeify')
      /*.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';*/
      .bundle()
      .pipe(require('minify-stream')({ sourceMap: false }))
      .pipe(writeStream);
  }
}

function generateNoCompile(lang) {
  generate(lang, false);
}

function generateCompile(lang) {
  generate(lang, true);
}

// eslint-disable-next-line @typescript-eslint/camelcase
function generateNoCompile_fr_FR(cb) {
  generateNoCompile('fr_FR');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateNoCompile_de_DE(cb) {
  generateNoCompile('de_DE');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateNoCompile_en_US(cb) {
  generateNoCompile('en_US');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateNoCompile_it_IT(cb) {
  generateNoCompile('it_IT');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateNoCompile_OTHER(cb) {
  generateNoCompile('OTHER');
  cb();
}

// eslint-disable-next-line @typescript-eslint/camelcase
function generateCompile_fr_FR(cb) {
  generateCompile('fr_FR');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateCompile_de_DE(cb) {
  generateCompile('de_DE');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateCompile_en_US(cb) {
  generateCompile('en_US');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateCompile_it_IT(cb) {
  generateCompile('it_IT');
  cb();
}
// eslint-disable-next-line @typescript-eslint/camelcase
function generateCompile_OTHER(cb) {
  generateCompile('OTHER');
  cb();
}

// eslint-disable-next-line @typescript-eslint/camelcase
exports.fr_FR_compile = generateCompile_fr_FR;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.de_DE_compile = generateCompile_de_DE;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.en_US_compile = generateCompile_en_US;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.it_IT_compile = generateCompile_it_IT;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.OTHER_compile = generateCompile_OTHER;

// eslint-disable-next-line @typescript-eslint/camelcase
exports.fr_FR = generateNoCompile_fr_FR;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.de_DE = generateNoCompile_de_DE;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.en_US = generateNoCompile_en_US;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.it_IT = generateNoCompile_it_IT;
// eslint-disable-next-line @typescript-eslint/camelcase
exports.OTHER = generateNoCompile_OTHER;

/*
exports.noCompile = series(exports.fr_FR, exports.de_DE, exports.en_US, exports.it_IT, exports.OTHER);
exports.compile = series(
  exports.fr_FR_compile,
  exports.de_DE_compile,
  exports.en_US_compile,
  exports.it_IT_compile,
  exports.OTHER_compile,
);

exports.all = series(exports.noCompile, exports.compile);
*/
