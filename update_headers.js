/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');

var walk = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      if (
        (file.endsWith('.js') || file.endsWith('.ts')) &&
        file.indexOf('node_modules') == -1 &&
        file.indexOf('/dist/') == -1
      ) {
        results.push(file);
      }
    }
  });
  return results;
};

const res = walk('.');

const template = `/**
 * @license
 * EXISTING_COPYRIGHT
 * EXISTING_LICENSE
 */

`;

for (let i = 0; i < res.length; i++) {
  const file = res[i];
  const content = fs.readFileSync(file, 'utf-8');
  var firstLine = content.split(/\r?\n/)[0];
  var secondLine = content.split(/\r?\n/)[1];
  if (firstLine.startsWith('// Copyright') && secondLine.startsWith('// SPDX-License-Identifier:')) {
    console.log(file);
    const filled = template
      .replace('EXISTING_COPYRIGHT', firstLine.substring(3))
      .replace('EXISTING_LICENSE', secondLine.substring(3));
    const final = filled + content.split(/\r?\n/).slice(2).join('\r\n');
    // console.log(final);
    fs.writeFileSync(file, final, 'utf-8');
  }
}

// console.log(JSON.stringify(res));
