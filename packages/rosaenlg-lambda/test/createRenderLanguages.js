const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');

// process.env.IS_TESTING = '1';

const bucketName = 'test-bucket';
const hostname = 'localhost';
const s3port = 4569;
const s3endpoint = `http://${hostname}:${s3port}`;

// config of the lambda BEFORE including it
process.env.S3_BUCKET = bucketName;
process.env.S3_ENDPOINT = s3endpoint;
process.env.S3_ACCESSKEYID = 'S3RVER';
process.env.S3_SECRETACCESSKEY = 'S3RVER';

const getEvent = require('./helper').getEvent;

const deleteFunction = require('../dist/delete');

const createEnglish = require('../dist/create/createEnglish');
const renderEnglish = require('../dist/render/renderEnglish');
const createFrench = require('../dist/create/createFrench');
const renderFrench = require('../dist/render/renderFrench');
const createGerman = require('../dist/create/createGerman');
const renderGerman = require('../dist/render/renderGerman');
const createItalian = require('../dist/create/createItalian');
const renderItalian = require('../dist/render/renderItalian');
const createOther = require('../dist/create/createOther');
const renderOther = require('../dist/render/renderOther');

const dataPerLanguage = [
  ['en_US', createEnglish, renderEnglish, ['apples', 'bananas', 'apricots'], 'An industry'],
  ['it_IT', createItalian, renderItalian, null, 'Deliziose torte'],
  ['fr_FR', createFrench, renderFrench, ['pommes', 'bananes', 'abricots', 'pêches'], 'ils chanteront'],
  ['de_DE', createGerman, renderGerman, ['Äpfel', 'Bananen', 'Aprikosen', 'Birnen'], 'Aprikosen und Birnen'],
  ['OTHER', createOther, renderOther, ['appels', 'bananen', 'abrikozen', 'peren'], 'abrikozen en peren'],
];

describe('test on all languages', function () {
  let s3instance;
  const testFolder = 'test-fake-s3-all';

  before(function (done) {
    fs.mkdir(testFolder, () => {
      s3instance = new S3rver({
        port: s3port,
        hostname: hostname,
        silent: false,
        directory: `./${testFolder}`,
        configureBuckets: [
          {
            name: bucketName,
          },
        ],
      }).run(done);
    });
  });

  after(function (done) {
    s3instance.close(() => {
      fs.rmdir(`${testFolder}/${bucketName}`, () => {
        fs.rmdir(testFolder, done);
      });
    });
  });

  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < dataPerLanguage.length; i++) {
      const dataForLanguage = dataPerLanguage[i];
      const language = dataForLanguage[0];
      const createFct = dataForLanguage[1];
      const renderFct = dataForLanguage[2];
      const renderData = dataForLanguage[3];
      const expected = dataForLanguage[4];
      const templateId = `test_${language}`;
      let templateSha1;

      describe(`create render delete for ${language}`, function () {
        it(`create`, function (done) {
          fs.readFile(`./test/templates/template_${language}.pug`, 'utf8', (_err, pugData) => {
            const packaged = {
              templateId: templateId,
              src: {
                entryTemplate: 'test.pug',
                compileInfo: {
                  language: language,
                },
                templates: {
                  'test.pug': pugData,
                },
              },
            };
            createFct.handler(
              {
                ...getEvent('DEFAULT_USER'),
                body: JSON.stringify(packaged),
              },
              {},
              (err, result) => {
                assert(!err);
                assert(result != null);
                //console.log(result);
                assert.strictEqual(result.statusCode, '201');
                const parsed = JSON.parse(result.body);
                assert(parsed.templateSha1 != null);
                templateSha1 = parsed.templateSha1;
                done();
              },
            );
          });
        });
        it(`render`, function (done) {
          renderFct.handler(
            {
              ...getEvent('DEFAULT_USER'),
              pathParameters: {
                templateId: templateId,
                templateSha1: templateSha1,
              },
              body: JSON.stringify({
                language: language,
                data: renderData,
              }),
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              console.log(result);
              assert.strictEqual(result.statusCode, '200');
              assert(JSON.parse(result.body).renderedText.indexOf(expected) > -1);
              done();
            },
          );
        });

        it(`delete`, function (done) {
          deleteFunction.handler(
            {
              ...getEvent('DEFAULT_USER'),
              pathParameters: {
                templateId: templateId,
              },
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              assert.strictEqual(result.statusCode, '204');
              done();
            },
          );
        });
      });
    }
  }
});
