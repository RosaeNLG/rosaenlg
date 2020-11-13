const assert = require('assert');

process.env.IS_TESTING = '1';

const getVersion = require('../../dist/version');

const getEvent = require('../helper').getEvent;

describe('version', function () {
  it(`should get version`, function (done) {
    getVersion.handler(getEvent('toto'), {}, (err, result) => {
      assert(!err);
      assert(result != null);
      // console.log(result);
      assert.strictEqual(result.statusCode, '200');
      const parsed = JSON.parse(result.body);
      assert(parsed.version != null);
      assert(/[0-9]+\.[0-9]+\.[0-9]+/.test(parsed.version), parsed.version);
      done();
    });
  });
});
