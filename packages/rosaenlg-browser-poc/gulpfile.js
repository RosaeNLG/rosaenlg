const { src, dest, parallel, series } = require('gulp');
const fs = require('fs');
const gulpRosaenlgHelpers = require('gulp-rosaenlg');

const rosaeNlgVersion = require('../rosaenlg/package.json').version;
console.log(`rosaenlg-browser-poc: using RosaeNLG version ${rosaeNlgVersion}`);

function init(cb) {
  const folders = ['dist'];
  folders.forEach(dir => {
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

function compile(lang) {
  return gulpRosaenlgHelpers.compileTemplates(
    [{ source: `src/template_${lang}.pug`, name: `template_${lang}` }],
    lang,
    `dist/compiled_${lang}.js`,
    'templates_holder',
    true,
  );
}

function compFr() {
  return compile('fr_FR');
}

function compEn() {
  return compile('en_US');
}

function compDe() {
  return compile('de_DE');
}

function compIt() {
  return compile('it_IT');
}

function compOther() {
  return compile('OTHER');
}

exports.all = series(init, parallel(copyStaticElts, html, compIt, compOther, compDe, compFr, compEn));
