/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const helpers = require('yeoman-test');
const path = require('path');
const yeomanassert = require('yeoman-assert');
const assert = require('assert');

describe('generator-rosaenlg', function () {
  this.timeout(5000);
  describe('nominal', function () {
    it('has a README', function () {
      return helpers
        .run(path.join(__dirname, '../generators/app'))
        .withPrompts({ name: 'testing' })
        .then(function () {
          yeomanassert.file('README.md');
        });
    });
    it('package.json contains title', function () {
      return helpers
        .run(path.join(__dirname, '../generators/app'))
        .withPrompts({ name: 'testing' })
        .then(function () {
          yeomanassert.fileContent('package.json', /testing/);
        });
    });
    it('there are some templates', function () {
      return helpers
        .run(path.join(__dirname, '../generators/app'))
        .withPrompts({ name: 'testing' })
        .then(function () {
          yeomanassert.fileContent('templates/phone.pug', /battery/);
        });
    });
    it('existing packaged json', function () {
      return helpers
        .run(path.join(__dirname, '../generators/app'))
        .withPrompts({ name: 'testing' })
        .withOptions({ unpack: path.join(__dirname, 'chanson.json') })
        .then(function () {
          yeomanassert.fileContent('templates/chanson.pug', /getAnonMS/);
        });
    });
  });

  describe('edge', function () {
    it('invalid file name', async function () {
      try {
        async function fct() {
          return helpers
            .run(path.join(__dirname, '../generators/app'))
            .withPrompts({ name: 'testing' })
            .withOptions({ unpack: path.join(__dirname, 'toto.json') });
        }
        await fct();
        assert(false);
      } catch (err) {
        assert(err.message.indexOf('no such') > -1, err.message);
      }
    });
    it('invalid JSON', async function () {
      try {
        async function fct() {
          return helpers
            .run(path.join(__dirname, '../generators/app'))
            .withPrompts({ name: 'testing' })
            .withOptions({ unpack: path.join(__dirname, 'invalid.json') });
        }
        await fct();
        assert(false);
      } catch (err) {
        assert(err.message.indexOf('Unexpected token') > -1, err.message);
      }
    });
  });
});
