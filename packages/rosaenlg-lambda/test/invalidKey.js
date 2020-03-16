const assert = require('assert');

process.env.IS_TESTING = '1';

const get = require('../dist/get');

describe('get', function() {
  it('invalid key', function(done) {
    get.handler(
      {
        headers: {
          'X-RapidAPI-Proxy-Secret': 'IS_TESTING_WRONGLY',
        },
        pathParameters: {
          templateId: 'blabla',
        },
      },
      {},
      (err, result) => {
        assert(!err);
        assert(result != null);
        // console.log(result);
        assert.equal(result.statusCode, '401');
        done();
      },
    );
  });
});
