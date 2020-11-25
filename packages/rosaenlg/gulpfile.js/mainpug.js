/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const { parallel } = require('gulp');
const rosaenlgPug = require('../dist/index.js');
const fs = require('fs');

function compileMainInFile(side, cb) {
  let fct;
  if (side === 'client') {
    fct = rosaenlgPug.compileFileClient;
  } else if (side === 'server') {
    fct = rosaenlgPug.compileFile;
  }

  const compiled = fct('mixins/main.pug', {
    language: 'en_US',
    compileDebug: false,
    embedResources: false,
    name: 'main',
    mainpug: true,
  });
  //console.log(compiled.toString());

  const lines = compiled.toString().split(/[\r\n]+/);
  const linesToKeep = [];
  let keep = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.indexOf('BEGIN_MAIN') > -1) {
      keep = true;
      continue;
    }
    if (line.indexOf('END_MAIN') > -1) {
      break;
    }
    if (keep) {
      linesToKeep.push(line);
    }
  }

  // it will be used by rosaenlg-pug-code-gen
  const obj = {
    code: linesToKeep.join('\n'),
  };
  fs.writeFileSync(`../rosaenlg-pug-code-gen/dist/compiledMain_${side}.json`, JSON.stringify(obj));

  cb();
}

function compileMainInFileClient(cb) {
  compileMainInFile('client', cb);
}
function compileMainInFileServer(cb) {
  compileMainInFile('server', cb);
}

exports.all = parallel(compileMainInFileServer, compileMainInFileClient);
