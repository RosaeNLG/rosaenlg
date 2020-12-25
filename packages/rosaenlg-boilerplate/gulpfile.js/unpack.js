const packager = require('rosaenlg-packager');
const rimraf = require('rimraf');
const fs = require('fs');

function doUnpack(cb) {
  const rawPackage = fs.readFileSync('packaged.json');
  const parsed = JSON.parse(rawPackage);

  rimraf('templates', () => {
    packager.expandPackagedTemplateJson(parsed, 'templates');
    cb();
  });
}

exports.all = doUnpack;
