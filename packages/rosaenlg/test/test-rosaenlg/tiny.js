var assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const browserify = require('browserify');
const stream = require('stream');
const util = require('util');
const Writable = stream.Writable;

const version = require('../../package.json').version;

const rosaenlgPugBrowserFr = require(`../../dist/browser/rosaenlg_tiny_fr_FR_${version}`);
const rosaenlgPugBrowserDe = require(`../../dist/browser/rosaenlg_tiny_de_DE_${version}`);
const rosaenlgPugBrowserEn = require(`../../dist/browser/rosaenlg_tiny_en_US_${version}`);
const rosaenlgPugBrowserIt = require(`../../dist/browser/rosaenlg_tiny_it_IT_${version}`);
const rosaenlgPugBrowserOther = require(`../../dist/browser/rosaenlg_tiny_OTHER_${version}`);

const templateVerbFr = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
`;
const templateVerbDe = `
p
  | er #[+verb(getAnonMS(), {verb: 'singen', tense:'PRASENS'} )]
`;
const templateVerbEn = `
p
  | he #[+verb(getAnonMS(), {verb: 'sing', tense:'PAST'} )]
`;
const templateIt = `
p
  | #[+value('torta', {adj:'delizioso', adjPos:'BEFORE', number:'P'})]  
`;
const templateVerbIt = `
p
  | #[+verb(getAnonMP(), {verb:'mangiare', aux:'AVERE', tense:'TRAPASSATO_REMOTO'})]
`;
const templateOther = `
p
  | een #[+value('man', {adj: 'goede', adjPos:'BEFORE'})]
`;

// http://codewinds.com/blog/2013-08-19-nodejs-writable-streams.html#!

var memStore = {};
/* Writable memory stream */
function WMStrm(key, options) {
  // allow use without new operator
  if (!(this instanceof WMStrm)) {
    return new WMStrm(key, options);
  }
  Writable.call(this, options); // init super
  this.key = key; // save key
  memStore[key] = new Buffer.from(''); // empty
}
util.inherits(WMStrm, Writable);

WMStrm.prototype._write = function(chunk, enc, cb) {
  // our memory store stores things in buffers
  var buffer = Buffer.isBuffer(chunk)
    ? chunk // already is Buffer use it
    : new Buffer.from(chunk, enc); // string, convert

  // concat to the buffer already there
  memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
  cb();
};

const testCases = [
  ['fr_FR', templateVerbFr, 'Il chantera'],
  ['de_DE', templateVerbDe, 'Er singt'],
  ['en_US', templateVerbEn, 'He sang'],
  ['it_IT', templateIt, 'Deliziose torte'],
  ['it_IT', templateVerbIt, 'Ebbero mangiato'],
  ['nl_NL', templateOther, 'Een goede man'],
];

describe('rosaenlg', function() {
  describe('tiny', function() {
    testCases.forEach(function(testCase) {
      //const testCase = testCases[0];
      const lang = testCase[0];
      const template = testCase[1];
      const expected = testCase[2];

      it(`${lang} ${expected}`, function(done) {
        var s = new stream.Readable();
        const compiled = rosaenlgPug.compileClient(template, {
          language: lang,
          compileDebug: false,
          embedResources: true,
          name: 'template',
        });
        s.push(compiled.toString());
        s.push(`\nmodule.exports = {template};`);
        s.push(null);

        let wstream = new WMStrm(lang);
        let b = browserify({
          standalone: 'templates_holder',
        });
        b.add(s);
        b.bundle().pipe(wstream);

        wstream.on('finish', function() {
          //console.log(memStore[lang].toString());
          //console.log(`size: ${memStore[lang].toString().length}` );

          const compiledFct = new Function(
            'params',
            `${memStore[lang].toString()}; return templates_holder.template(params);`,
          );

          let util;
          switch (lang) {
            case 'fr_FR': {
              util = new rosaenlgPugBrowserFr.NlgLib({ language: lang });
              break;
            }
            case 'en_US': {
              util = new rosaenlgPugBrowserEn.NlgLib({ language: lang });
              break;
            }
            case 'de_DE': {
              util = new rosaenlgPugBrowserDe.NlgLib({ language: lang });
              break;
            }
            case 'it_IT': {
              util = new rosaenlgPugBrowserIt.NlgLib({ language: lang });
              break;
            }
            default: {
              util = new rosaenlgPugBrowserOther.NlgLib({ language: lang });
              break;
            }
          }

          let rendered = compiledFct({
            util: util,
          });

          // console.log(rendered);

          assert(rendered.indexOf(expected) > -1);
          done();
        });
      });
    });
  });
});