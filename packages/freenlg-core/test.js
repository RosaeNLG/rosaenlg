const pug = require('freenlg-pug');

const NlgLib = require('./index').NlgLib;
const filter = require('./filter');


test('test_hasSaid_values');

function test(testCase) {

  /*
  const compiledFunction = pug.compileFile('test/' + testCase + '.pug', {compileDebug: false, pretty: false});
  
  var rendered = compiledFunction({
    util: new NlgLib({language: "fr_FR"})
  });
  rendered = util.filter(rendered);
  */
  var util = new NlgLib({language: "fr_FR"});
  var rendered = pug.renderFile('test/' + testCase + '.pug', { util: util });

  console.log(rendered);
  console.log('seed: ' + util.randomSeed);
}
