/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const fs = require('fs');
const recursiveReadSync = require('recursive-readdir-sync');

function getJsFromAdoc(file) {
  const adocLines = fs.readFileSync(file, 'utf8').split('\n');

  const jsLines = [];
  let inScript = false;
  for (let i = 0; i < adocLines.length; i++) {
    const line = adocLines[i];
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// overrides spawnEditor function that is in doc
function spawnEditor(lang, template, expected) {
  const templateStart = template.replace(/[\n\r]/g, '').substring(0, 50);
  const rendered = rosaenlgPug.render(template, {
    language: lang,
    forceRandomSeed: 42, // freeze syn to whatever value
  });
  //console.log(rendered);

  if (!expected) {
    it(`${lang} ${templateStart}... should render something`, function () {
      assert(rendered.length > 0);
    });
  } else if (expected) {
    it(`${lang} ${templateStart}... => ${expected}`, function () {
      assert(rendered.indexOf(expected) > -1, `\ngot:\n<${rendered}>, \nexpected:\n<${expected}>`);
    });
  }
}

describe('rosaenlg code in doc', function () {
  files = recursiveReadSync('../rosaenlg-doc/doc/modules/');
  files.forEach(function (file) {
    if (file.endsWith('adoc')) {
      describe(`${file}`, function () {
        //console.log('-----------------------------------------------------------');
        //console.log(file);
        const js = getJsFromAdoc(file);
        //console.log(js);
        eval(js);
        //console.log('DONE');
      });
    }
  });
});
