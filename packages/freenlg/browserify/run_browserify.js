var browserify = require('browserify')

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

function generateFor(lang, writeStream) {
  var b = browserify({
    standalone: 'freenlg',
    transform: ['brfs'],
  });

  b.add( `browserify/${lang}.js` );

  b.ignore( getIgnoreList(lang) );

  b
    .transform('unassertify', { global: true })
    .transform('envify', { global: true })
    .transform('uglifyify', { global: true })
    .plugin('common-shakeify')
    //.plugin('browser-pack-flat/plugin') <= does not work properly when using import 'moment/locale/*';
    .bundle()
    .pipe(require('minify-stream')({ sourceMap: false }))
    .pipe(writeStream);
}

const args = process.argv.slice(2);
const lang = args[0];


//console.log(args);

generateFor(lang, process.stdout);


