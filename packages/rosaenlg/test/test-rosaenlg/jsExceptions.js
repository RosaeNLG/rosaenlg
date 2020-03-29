const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const templateParsingException = `
| bla
if [{
  | xxxx
`;

const runtimeExceptionCases = [
  [
    'invalid property',
    `
| bla
if bla.bli
  | xxxx
`,
    ' > 3| if bla.bli',
  ],
  [
    'thrown exception',
    `
-
  function test() {
    throw new Error('some runtime exception');
  }
+value(test())
`,
    '> 6| +value(test())',
  ],
];

// [... excepted line, expected col]
const compileErrorCases = [
  [
    'basic',
    `
-
  // is error
  function test() {
    let toto = [};
  }
`,
    5,
    14,
  ],
  [
    'error at the very end',
    `
-
  function isOk() {
    // this one is ok
  }
  // is error
  function test() {

+value(123)
`,
    5,
    25,
  ],
  [
    'another one',
    `
-
  // is error
  function test() {
    if ()
  }
  function isOk() {
    // this one is ok
  }
+value(123)
`,
    5,
    6,
  ],
];

describe('rosaenlg', function () {
  describe('template runtime exceptions', function () {
    for (let i = 0; i < runtimeExceptionCases.length; i++) {
      const runtimeExceptionCase = runtimeExceptionCases[i];
      const name = runtimeExceptionCase[0];
      const template = runtimeExceptionCase[1];
      const excepted = runtimeExceptionCase[2];

      it(name, function () {
        assert.throws(
          () => rosaenlgPug.render(template, { language: 'en_US', compileDebug: true }),
          (err) => {
            // console.log(err.message);
            assert(err.message);
            assert(err.message.indexOf(excepted) > -1, err.message);
            return true;
          },
          'unexpected error',
        );
      });
    }
  });

  describe('template parsing exceptions', function () {
    it(`(very) invalid if syntax`, function () {
      assert.throws(
        () => rosaenlgPug.render(templateParsingException, { language: 'en_US' }),
        (err) => {
          // console.log(err.message);
          assert(err.message);
          assert(err.message.indexOf(' > 3| if [{') > -1);
          return true;
        },
        'unexpected error',
      );
    });
  });

  describe('javascript compile exceptions', function () {
    for (let i = 0; i < compileErrorCases.length; i++) {
      const compileErrorCase = compileErrorCases[i];
      const name = compileErrorCase[0];
      const template = compileErrorCase[1];
      const line = compileErrorCase[2];
      const col = compileErrorCase[3];

      it(name, function () {
        assert.throws(
          () => rosaenlgPug.render(template, { language: 'en_US' }),
          (err) => {
            // console.log(err.message);
            assert(err.message);
            assert(err.message.indexOf('error when parsing js') > -1);
            assert(err.message.indexOf(`at column ${col},`) > -1, err.message);
            assert(err.message.indexOf(`> ${line}`) > -1, err.message);
            return true;
          },
          'unexpected error',
        );
      });
    }
  });
});
