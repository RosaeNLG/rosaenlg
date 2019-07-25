var assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const fs = require('fs');
const recursiveReadSync = require('recursive-readdir-sync');

function getJsFromAdoc(file) {
  let adocLines = fs.readFileSync(file, 'utf8').split('\n');

  let jsLines = [];
  let inScript = false;
  for (let i = 0; i < adocLines.length; i++) {
    let line = adocLines[i];
    if (line.indexOf('<script>') > -1) {
      inScript = true;
      continue;
    }
    if (line.indexOf('</script>') > -1) {
      inScript = false;
      continue;
    }
    if (inScript) {
      jsLines.push(line);
    }
  }

  return jsLines.join('\n');
}

function spawnEditor(lang, template, expected) {
  const templateStart = template.replace(/[\n\r]/g, '').substring(0, 50);
  let rendered = rosaenlgPug.render(template, {
    language: lang,
  });
  //console.log(rendered);
  it(`${lang} ${templateStart}... => ${expected ? expected : '-'}`, function() {
    if (expected) {
      assert(rendered.indexOf(expected) > -1, `got: ${rendered}, expected: ${expected}`);
    }
  });
}

describe('rosaenlg code in doc', function() {
  files = recursiveReadSync('doc/modules/');
  files.forEach(function(file) {
    if (file.endsWith('adoc')) {
      describe(`${file}`, function() {
        //console.log('-----------------------------------------------------------');
        //console.log(file);
        let js = getJsFromAdoc(file);
        //console.log(js);
        eval(js);
        //console.log('DONE');
      });
    }
  });
});
