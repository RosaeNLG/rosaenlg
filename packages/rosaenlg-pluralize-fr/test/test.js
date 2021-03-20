/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

const pluralize = require('../');
const assert = require('assert');

const testCasesPlural = [
  // original tests
  ['test', 'tests'],
  ['chou', 'choux'],
  ['poireau', 'poireaux'],
  ['ananas', 'ananas'],
  ['cheval', 'chevaux'],
  ['spiral', 'spiraux'],
  ['bail', 'baux'],
  ['éventail', 'éventails'],
  ['héro', 'héros'],
  ['tracteur agricole', 'tracteurs agricoles'],
  // new ones
  ['chaise', 'chaises'],
  ['cheveu', 'cheveux'],
  ['drapeau', 'drapeaux'],
  ['landau', 'landaus'],
  ['sarrau', 'sarraus'],
  ['pneu', 'pneus'],
  ['rebeu', 'rebeus'],
  ['sou', 'sous'],
  ['bijou', 'bijoux'],
  ['bois', 'bois'],
  ['prix', 'prix'],
  ['gaz', 'gaz'],
  ['animal', 'animaux'],
  ['cheval', 'chevaux'],
  ['carnaval', 'carnavals'],
  ['bal', 'bals'],
  ['chacal', 'chacals'],
  ['portail', 'portails'],
  ['détail', 'détails'],
  ['corail', 'coraux'],
  ['émail', 'émaux'],
  ['œil', 'yeux'],
  ['ail', 'aulx'],
  // new
  ['machine à laver', 'machines à laver'],
  ['restau', 'restaus'],
];

describe('rosaenlg-pluralize-fr', function () {
  for (let i = 0; i < testCasesPlural.length; i++) {
    const testCase = testCasesPlural[i];
    it(`${testCase[0]} => ${testCase[1]}`, function () {
      assert.strictEqual(pluralize(testCase[0]), testCase[1]);
    });
  }
});
