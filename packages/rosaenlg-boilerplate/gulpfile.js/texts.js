const fs = require('fs');
const rosaenlgPug = require('rosaenlg');
const { parallel } = require('gulp');

const css = `
.rosaenlg-debug {
  display: block;
  font-size: xx-small;
  font-family: monospace;
}
`;

function html(file, renderDebug) {
  const phones = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
  const fd = fs.openSync(`dist/${file}`, 'w');
  fs.appendFileSync(
    fd,
    `<!DOCTYPE html><html lang="fr"><head><title>Phones Descriptions</title><meta charset="utf-8"/><style>${css}</style></head><body>`,
  );
  for (let i = 0; i < phones.length; i++) {
    let rendered = rosaenlgPug.renderFile('templates/phoneForHtml.pug', {
      phone: phones[i],
      cache: true,
      language: 'en_US',
      renderDebug: renderDebug,
    });
    fs.appendFileSync(fd, rendered);
  }
  fs.appendFileSync(fd, '</body></html>');
}

function standardHtml(cb) {
  html('allPhones.html', false);
  cb();
}

function renderDebug(cb) {
  html('renderDebug.html', true);
  cb();
}

exports.all = parallel(standardHtml, renderDebug);
