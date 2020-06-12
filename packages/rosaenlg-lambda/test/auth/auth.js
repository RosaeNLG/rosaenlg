const assert = require('assert');

process.env.IS_TESTING = '1';

const auth = require('../../dist/auth');

describe('auth after', function () {
  describe('Rapid API', function () {
    it('should auth', function () {
      return auth
        .handler({
          type: 'TOKEN',
          authorizationToken: 'IS_TESTING',
        })
        .then((result) => {
          assert(result.principalId == 'RAPID_API');
          assert(result.policyDocument);
        });
    });
    it('Rapid should not auth', function () {
      return auth
        .handler({
          type: 'TOKEN',
          authorizationToken: 'IS_TESTING_XXXX',
        })
        .then((result) => {
          assert(!result.principalId);
          assert(result.indexOf('Unauthorized') > -1);
        });
    });
  });
  describe('Bearer', function () {
    describe('should not auth', function () {
      it('random invalid bearer', function () {
        return auth
          .handler({
            type: 'TOKEN',
            authorizationToken: 'Bearer blabla',
          })
          .then((result) => {
            assert(result.indexOf('Unauthorized') > -1);
          });
      });
      describe('bearer can be decoded', function () {
        it('no kid in header', function () {
          return auth
            .handler({
              type: 'TOKEN',
              authorizationToken:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            })
            .then((result) => {
              console.log(result);
              assert(result.indexOf('invalid token') > -1);
            });
        });

        it('decoded content is ok (header.kid), kid is random', function () {
          // "kid": "aaaa"
          return auth
            .handler({
              type: 'TOKEN',
              authorizationToken:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFhYWEifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.zzIISZq0N_qDhXg80yQzY9b_NeZM00UJp-U55XRzZME',
            })
            .then((result) => {
              // console.log(result);
              assert(result.indexOf('Not Found') > -1);
            });
        });
      });
    });
  });
  describe('misc', function () {
    it('no TOKEN type', function () {
      return auth
        .handler({
          type: 'TOKEN_bla',
          authorizationToken: 'Bearer blabla',
        })
        .then((result) => {
          assert(result.indexOf('TOKEN') > -1);
        });
    });
    it('no authorizationToken', function () {
      return auth
        .handler({
          type: 'TOKEN',
        })
        .then((result) => {
          assert(result.indexOf('authorizationToken') > -1);
        });
    });
  });
});
