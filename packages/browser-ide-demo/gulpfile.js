const { src, dest, parallel } = require('gulp');

const fs = require('fs');
const concat = require('gulp-concat');
const inject = require('gulp-inject-string');
const rename = require('gulp-rename');
const awspublish = require('gulp-awspublish');
const merge = require('merge-stream');

const rosaeNlgVersion = require('../rosaenlg/package.json').version;
console.log(`browser-ide-demo: using RosaeNLG version ${rosaeNlgVersion}`);

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

function copyStaticElts() {
  // js: when already minified
  return src([
    `../../node_modules/codemirror-minified/lib/codemirror.js`,
    `../../node_modules/codemirror-minified/lib/codemirror.css`,
    `../../node_modules/codemirror-minified/mode/pug/pug.js`,
    `../../node_modules/codemirror-minified/mode/javascript/javascript.js`,
    `../../node_modules/vue-codemirror/dist/vue-codemirror.js`,
    `../rosaenlg/dist/browser/rosaenlg_tiny_en_US_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/browser/rosaenlg_tiny_fr_FR_${rosaeNlgVersion}_comp.js`,
    `../rosaenlg/dist/browser/rosaenlg_tiny_de_DE_${rosaeNlgVersion}_comp.js`,
    'lib/vue.min.js',
    'src/app.css',
  ]).pipe(dest('dist/'));
}

function html(cb) {
  const demoHtml = fs.readFileSync('src/demo.html', 'utf-8');
  const languages = ['fr_FR', 'en_US', 'de_DE'];
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    const demoHtmlLanguage = demoHtml.replace(/\$lang\$/g, language).replace(/\$version\$/g, rosaeNlgVersion);
    fs.writeFileSync(`dist/demo_${language}.html`, demoHtmlLanguage);
  }
  cb();
}

function getAllTemplates() {
  const templatesParLang = JSON.parse(fs.readFileSync('src/templates.json'));
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

function templates(cb) {
  const templates = getAllTemplates();
  console.log(templates);
  cb();
}

function js() {
  const templates = `\n\nconst templates=${JSON.stringify(getAllTemplates())};\n`;

  return src(['src/app.js', 'src/lib/*.js'] /*, { sourcemaps: true }*/)
    .pipe(concat('app.min.js'))
    .pipe(inject.append(templates))
    .pipe(dest('dist/' /*, { sourcemaps: true }*/));
}

function publishS3() {
  const publisher = awspublish.create({
    params: {
      Bucket: 'rosaenlg.org',
    },
  });

  const destFolder = 'ide/';

  const gzip = src([
    `dist/rosaenlg_tiny_en_US_${rosaeNlgVersion}_comp.js`,
    `dist/rosaenlg_tiny_fr_FR_${rosaeNlgVersion}_comp.js`,
    `dist/rosaenlg_tiny_de_DE_${rosaeNlgVersion}_comp.js`,
  ])
    .pipe(
      rename(function(path) {
        path.dirname = destFolder + path.dirname;
      }),
    )
    .pipe(awspublish.gzip());

  const plain = src([
    'dist/*',
    `!dist/rosaenlg_tiny_en_US_${rosaeNlgVersion}_comp.js`,
    `!dist/rosaenlg_tiny_fr_FR_${rosaeNlgVersion}_comp.js`,
    `!dist/rosaenlg_tiny_de_DE_${rosaeNlgVersion}_comp.js`,
  ]);

  return merge(gzip, plain)
    .pipe(
      rename(function(path) {
        path.dirname = destFolder + path.dirname;
      }),
    )
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

exports.templates = templates;
exports.html = html;
exports.js = js;
exports.all = parallel(init, copyStaticElts, html, js);

exports.s3 = publishS3;
