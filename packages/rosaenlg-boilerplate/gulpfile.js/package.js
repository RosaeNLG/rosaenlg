const packager = require('rosaenlg-packager');
const rosaenlg = require('rosaenlg');
const fs = require('fs');

function doPackage(cb) {
  const packageObj = {
    templateId: 'phones',
    src: {
      entryTemplate: 'templates/phoneForJson.pug',
      compileInfo: {
        language: 'en_US',
      },
      autotest: {
        activate: true,
        input: {
          language: 'en_US',
          phone: {
            name: 'OnePlus 5T',
            colors: ['Black', 'Red', 'White'],
            displaySize: 6,
            screenRatio: 80.43,
            battery: 3300,
          },
        },
        expected: ['phone', 'battery'],
      },
    },
  };

  packager.completePackagedTemplateJson(packageObj, rosaenlg);

  fs.writeFile('dist/phone_package.json', JSON.stringify(packageObj), 'utf8', () => {
    cb();
  });
}

exports.all = doPackage;
