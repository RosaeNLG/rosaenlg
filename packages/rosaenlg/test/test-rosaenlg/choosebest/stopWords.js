/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

const stopWordsAdd = `
p
  - var param = {among:20, stop_words_add:['stopWord'], debug:false}
  choosebest param
    synz
      syn
        | stopWord stopWord AAA stopWord BBB
      syn
        | AAA AAA
  //- console.log(param.debugRes)
`;

const stopWordsRemove = `
p
  - var param = {among:20, stop_words_remove:['thus'], debug:false}
  choosebest param
    synz
      syn
        | thus thus thus AAA BBB
      syn
        | AAA AAA
  //- console.log(param.debugRes)
`;

const stopWordsOverride = `
p
  - var param = {among:20, stop_words_override:['AAA'], debug:true}
  choosebest param
    synz
      syn
        | BBB AAA AAA CCC AAA
      syn
        | BBB BBB
  //- console.log(param.debugRes)
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`stop words add`, function () {
      const rendered = rosaenlgPug.render(stopWordsAdd, { language: 'en_US' });
      assert(rendered.toLowerCase().indexOf('stopWord stopWord AAA stopWord BBB'.toLowerCase()) > -1);
    });

    it(`stop words remove`, function () {
      const rendered = rosaenlgPug.render(stopWordsRemove, { language: 'en_US' });
      assert(rendered.toLowerCase().indexOf('AAA AAA'.toLowerCase()) > -1);
    });

    it(`stop words override`, function () {
      const rendered = rosaenlgPug.render(stopWordsOverride, { language: 'en_US' });
      assert(rendered.toLowerCase().indexOf('BBB AAA AAA CCC AAA'.toLowerCase()) > -1);
    });
  });
});
