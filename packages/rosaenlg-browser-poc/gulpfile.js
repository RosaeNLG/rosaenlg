const { src, dest, parallel, series } = require('gulp');
const fs = require('fs');
const packager = require('rosaenlg-packager');
const rosaenlg = require('rosaenlg');

const rosaeNlgVersion = require('../rosaenlg/package.json').version;
console.log(`rosaenlg-browser-poc: using RosaeNLG version ${rosaeNlgVersion}`);

function init(cb) {
  const folders = ['dist'];
  folders.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log('📁  folder created:', dir);
    }
  });
  cb();
}

const dataPerLanguage = [
  ['fr_FR', `, data: ['pommes', 'bananes', 'abricots', 'pêches']`],
  ['en_US', `, data: ['apples', 'bananas', 'apricots']`],
  ['de_DE', `, data: ['Äpfel', 'Bananen', 'Aprikosen', 'Birnen']`],
  ['es_ES', ``],
  ['it_IT', ``],
  ['OTHER', `, data: ['appels', 'bananen', 'abrikozen', 'peren']`],
];

function copyStaticElts() {
  return src([`../rosaenlg/dist/rollup/rosaenlg_tiny_*_${rosaeNlgVersion}.js`]).pipe(dest('dist/'));
}

function html(cb) {
  const demoHtml = fs.readFileSync('src/browser.html', 'utf-8');
  for (let i = 0; i < dataPerLanguage.length; i++) {
    const line = dataPerLanguage[i];
    const language = line[0];
    const data = line[1];

    const htmlLanguage = demoHtml
      .replace(/\$lang\$/g, language)
      .replace(/\$version\$/g, rosaeNlgVersion)
      .replace(/\$data\$/g, data);
    fs.writeFileSync(`dist/browser_${language}.html`, htmlLanguage);
  }

  cb();
}

function compile(lang, cb) {
  const compiled = packager.compileTemplateToJsString(`src/template_${lang}.pug`, lang, null, rosaenlg);
  fs.writeFileSync(`dist/compiled_${lang}.js`, compiled, 'utf8');
  cb();
}

function compFr(cb) {
  compile('fr_FR', cb);
}

function compEn(cb) {
  return compile('en_US', cb);
}

function compDe(cb) {
  return compile('de_DE', cb);
}

function compIt(cb) {
  return compile('it_IT', cb);
}

function compEs(cb) {
  return compile('es_ES', cb);
}

function compOther(cb) {
  return compile('OTHER', cb);
}

exports.all = series(init, parallel(copyStaticElts, html, compIt, compOther, compDe, compFr, compEn, compEs));
