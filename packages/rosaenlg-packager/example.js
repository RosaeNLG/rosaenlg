const packager = require('./dist/index.js');
const rosaenlg = require('rosaenlg');

const compiled = packager.compileTemplateToJsString('test/test.pug', 'en_US', null, rosaenlg);

const compiledFct = new Function('params', `${compiled}; return template(params);`);
const rendered = compiledFct({
  util: new rosaenlg.NlgLib({ language: 'en_US' }),
});
console.log(rendered);
