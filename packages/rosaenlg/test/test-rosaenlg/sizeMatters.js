/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

// last size version 2.1.8 kB
const noCompSize = {
  fr_FR: 248,
  en_US: 336,
  de_DE: 220,
  it_IT: 244,
  es_ES: 223,
  OTHER: 139,
};

const compSize = {
  fr_FR: 8459,
  en_US: 1493,
  de_DE: 43810,
  it_IT: 9925,
  es_ES: 1346,
  OTHER: 1219,
};

const assert = require('assert');
const fs = require('fs');

const filesDir = 'dist/rollup/';

function getIsComp(filename) {
  return filename.indexOf('_comp') > -1;
}

function getLanguage(filename) {
  const res = filename.match(/rosaenlg_tiny_(.*)_[0-9]+\.[0-9]+\.[0-9]+.*\.js/);
  return res[1];
}

function getRefSize(isComp, lang) {
  if (isComp) {
    return compSize[lang];
  } else {
    return noCompSize[lang];
  }
}

function getSize(filename) {
  const stats = fs.statSync(filesDir + filename);
  return stats.size / 1024;
}

const toleration = 0.05; // 5%

describe('rosaenlg', function () {
  describe('check bundle size', function () {
    const files = fs.readdirSync(filesDir);
    for (const file of files) {
      const lang = getLanguage(file);
      const isComp = getIsComp(file);
      const refSize = getRefSize(isComp, lang);
      const realSize = getSize(file);
      it(file, function () {
        const diff = Math.abs(refSize - realSize) / refSize;
        assert(diff < toleration, `${file} is ${realSize} kB, while expected is ${refSize}, diff is ${diff}`);
      });
    }
  });
});
