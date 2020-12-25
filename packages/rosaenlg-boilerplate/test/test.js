var assert = require('assert');
const fs = require('fs');
const rosaenlgPug = require('rosaenlg');

describe('phones', function () {
  let referenceData = JSON.parse(fs.readFileSync('test/phonesNonreg.json', 'utf8'));
  const phones = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
  assert((referenceData.length = phones.length));

  for (let i = 0; i < phones.length; i++) {
    let reference = referenceData[i];
    let rendered = rosaenlgPug.renderFile('templates/phoneForJson.pug', {
      phone: phones[i],
      cache: true,
      language: 'en_US',
      forceRandomSeed: reference.seed,
    });
    it(`phone #${i}`, function () {
      assert.equal(reference.rendered, rendered, 'different from reference');
    });
  }
});
