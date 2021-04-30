/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

function syn_fct(items) {
  return util.synManager.synFct(items);
}

function printObj(before, obj) {
  console.log(before + ' ' + JSON.stringify(obj).substring(0, 20));
}

function logParams(params) {
  console.log('params: ' + JSON.stringify(params));
}

function valueToSorP(val) {
  return util.languageImpl.isPlural(val) ? 'P' : 'S';
}

function debug(filename, line) {
  if (filename !== null) {
    pug_debug_filename = filename;
  }
  pug_debug_line = line;

  if (locals.renderDebug) {
    // locals is available
    let id = line;
    if (filename !== null) {
      id = filename.replace(/"/g, '') + ': ' + id;
    }
    pug_html = pug_html + `<span class="rosaenlg-debug" id="${id}"></span>`;
  }
}
