/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishAAnList = require('../dist/aan.json');

const shouldBeHere = ['elephant', 'egg', 'apple', 'idiot', 'orphan', 'hour', 'unusual', 'heir', 'English', 'AND'];

const shouldNotBeHere = [
  'boy',
  'car',
  'bike',
  'zoo',
  'dog',
  'user',
  'university',
  'unicycle',
  'horse',
  'historical',
  'broken',
  'european',
  'one-armed',
  'unicorn',
  'unionized worker',
  'hotel',
  'helmet',
  'european',
  'and',
];

describe('english-a-an', function () {
  describe('should be here', function () {
    for (let i = 0; i < shouldBeHere.length; i++) {
      const word = shouldBeHere[i];
      it(`${word} is here`, function () {
        assert(EnglishAAnList[word] != null);
      });
    }
  });
  describe('should not be here', function () {
    for (let i = 0; i < shouldNotBeHere.length; i++) {
      const word = shouldNotBeHere[i];
      it(`${word} is not here`, function () {
        assert(!EnglishAAnList[word]);
      });
    }
  });
});
