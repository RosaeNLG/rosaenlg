var gulpFreenlpg = require('./dist/index.js');
const fs = require('fs');

const tmpFile = 'tmp.js';

let os = gulpFreenlpg.compileTemplates(
  [{ source: 'test/test.pug', name: 'test' }],
  'en_US',
  tmpFile,
  'templates_holder',
);

os.on('finish', function() {
  console.log('DONE');
  const compiledString = fs.readFileSync(tmpFile, 'utf-8');
  //console.log(compiledString);
  console.log(`done: ${compiledString.length}`);
  // fs.unlinkSync(tmpFile);
});
