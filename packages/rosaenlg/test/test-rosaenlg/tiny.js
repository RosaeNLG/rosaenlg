const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const browserify = require('browserify');
const stream = require('stream');
const util = require('util');
const Writable = stream.Writable;

const version = require('../../package.json').version;

const rosaenlgPugBrowserFr = require(`../../dist/rollup/rosaenlg_tiny_fr_FR_${version}`);
const rosaenlgPugBrowserDe = require(`../../dist/rollup/rosaenlg_tiny_de_DE_${version}`);
const rosaenlgPugBrowserEn = require(`../../dist/rollup/rosaenlg_tiny_en_US_${version}`);
const rosaenlgPugBrowserIt = require(`../../dist/rollup/rosaenlg_tiny_it_IT_${version}`);
const rosaenlgPugBrowserEs = require(`../../dist/rollup/rosaenlg_tiny_es_ES_${version}`);
const rosaenlgPugBrowserOther = require(`../../dist/rollup/rosaenlg_tiny_OTHER_${version}`);

const rosaenlgPugBrowserFrComp = require(`../../dist/rollup/rosaenlg_tiny_fr_FR_${version}_comp`);
const rosaenlgPugBrowserDeComp = require(`../../dist/rollup/rosaenlg_tiny_de_DE_${version}_comp`);
const rosaenlgPugBrowserEnComp = require(`../../dist/rollup/rosaenlg_tiny_en_US_${version}_comp`);
const rosaenlgPugBrowserItComp = require(`../../dist/rollup/rosaenlg_tiny_it_IT_${version}_comp`);
const rosaenlgPugBrowserEsComp = require(`../../dist/rollup/rosaenlg_tiny_es_ES_${version}_comp`);
const rosaenlgPugBrowserOtherComp = require(`../../dist/rollup/rosaenlg_tiny_OTHER_${version}_comp`);

const templateVerbEn = `
p
  | he #[+verb(getAnonMS(), {verb: 'sing', tense:'PAST'} )] /
  | he #[+verb(getAnonMS(), {verb: 'swim', tense: 'PROGRESSIVE_PRESENT'})] /
  | he #[+verb(getAnonMS(), {verb: 'eat', tense: 'PAST'})]
`;

// subjectVerbAdj : [] for adj on behalf, but only one to avoid syn issues
const templateVerbFr = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | .
  | elles #[+subjectVerb(getAnonFP(), { verb:'aller', tense:'PASSE_COMPOSE' } )]
  | .
  | #[+value('genou', {det:'INDEFINITE', adj:'beau', adjPos:'BEFORE', number:'P'})]
  | .
  | #[+value('plage', {det:'DEFINITE', adj:'beau', adjPos:'BEFORE', number:'P'})]
  | .
  | #[+subjectVerbAdj(['lampe'], ['sembler'], ['somptueux'], {det:'DEFINITE'})]
  | .
`;
const templateVerbDe = `
p
  | er #[+verb(getAnonMS(), {verb: 'singen', tense:'PRASENS'} )]
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
const templateWithP = `
p
  | this
  | is
  | a sentence .
  p
    | and yes ,
    | this is another sentence
    | !
`;
const templateWordsEn = `
p
  | #[+value("industry", {number:getAnonMP()})] /
  | #[+value("tomato", {number:getAnonMP()})]
`;

const templateEnAAn = `
p
  | a industry
`;

const templateEnNumber = `
p
  | #[+value(1.3333, {'TEXTUAL':true })] / #[+value(20, {'TEXTUAL':true })]
`;

const templateEs = `
| #[+verb(getAnonMS(), {verb:'ser', tense:'SUBJUNCTIVE_PLUPERFECT'})]
| .
| #[+value('luz', {det:'INDEFINITE', number:'P'})]
| .
| #[+value('árbol', { det:'DEFINITE', number:'P', adj:{BEFORE:['grande'], AFTER:['blanco', 'beige']} })]
| .
`;

const testCases = [
  [
    'fr_FR',
    templateVerbFr,
    '<p>Il chantera. Elles sont allées. Des beaux genoux. Les belles plages. La lampe semble somptueuse.</p>',
  ],
  ['de_DE', templateVerbDe, '<p>Er singt</p>'],
  ['it_IT', templateIt, '<p>Deliziose torte</p>'],
  ['it_IT', templateVerbIt, '<p>Ebbero mangiato</p>'],
  ['nl_NL', templateOther, '<p>Een goede man</p>'],
  ['en_US', templateWithP, '<p>This is a sentence. <p>And yes, this is another sentence!</p></p>'],
  ['en_US', templateVerbEn, '<p>He sang / he is swimming / he ate</p>'],
  ['en_US', templateWordsEn, '<p>Industries / tomatoes</p>'],
  ['en_US', templateEnAAn, '<p>An industry</p>'],
  ['en_US', templateEnNumber, '<p>One point three three three three / twenty</p>'],
  ['es_ES', templateEs, 'Hubiera sido. Unas luces. Los grandes árboles blancos y beige.'],
];

function getCompVersionRenderFct(lang) {
  const mapping = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    fr_FR: rosaenlgPugBrowserFrComp,
    // eslint-disable-next-line @typescript-eslint/camelcase
    en_US: rosaenlgPugBrowserEnComp,
    // eslint-disable-next-line @typescript-eslint/camelcase
    de_DE: rosaenlgPugBrowserDeComp,
    // eslint-disable-next-line @typescript-eslint/camelcase
    it_IT: rosaenlgPugBrowserItComp,
    // eslint-disable-next-line @typescript-eslint/camelcase
    es_ES: rosaenlgPugBrowserEsComp,
    OTHER: rosaenlgPugBrowserOtherComp,
  };
  if (mapping[lang]) {
    return mapping[lang].render;
  } else {
    return mapping['OTHER'].render;
  }
}

function getNoCompNlgLib(lang) {
  const mapping = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    fr_FR: rosaenlgPugBrowserFr,
    // eslint-disable-next-line @typescript-eslint/camelcase
    en_US: rosaenlgPugBrowserEn,
    // eslint-disable-next-line @typescript-eslint/camelcase
    de_DE: rosaenlgPugBrowserDe,
    // eslint-disable-next-line @typescript-eslint/camelcase
    it_IT: rosaenlgPugBrowserIt,
    // eslint-disable-next-line @typescript-eslint/camelcase
    es_ES: rosaenlgPugBrowserEs,
    OTHER: rosaenlgPugBrowserOther,
  };
  if (mapping[lang]) {
    return new mapping[lang].NlgLib({ language: lang });
  } else {
    return new mapping['OTHER'].NlgLib({ language: lang });
  }
}

describe('rosaenlg', function () {
  describe('tiny', function () {
    // http://codewinds.com/blog/2013-08-19-nodejs-writable-streams.html#!
    const memStore = {};
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

    WMStrm.prototype._write = function (chunk, enc, cb) {
      // our memory store stores things in buffers
      const buffer = Buffer.isBuffer(chunk)
        ? chunk // already is Buffer use it
        : new Buffer.from(chunk, enc); // string, convert

      // concat to the buffer already there
      memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
      cb();
    };

    testCases.forEach(function (testCase) {
      //const testCase = testCases[0];
      const lang = testCase[0];
      const template = testCase[1];
      const expected = testCase[2];

      it(`${lang} ${expected}`, function (done) {
        const s = new stream.Readable();
        const compiled = rosaenlgPug.compileClient(template, {
          language: lang,
          compileDebug: false,
          embedResources: true,
          name: 'template',
        });
        s.push(compiled.toString());
        s.push(`\nmodule.exports = {template};`);
        s.push(null);

        const wstream = new WMStrm(lang);
        const b = browserify({
          standalone: 'templates_holder',
        });
        b.add(s);
        b.bundle().pipe(wstream);

        wstream.on('finish', function () {
          // console.log(memStore[lang].toString());
          // console.log(`size: ${memStore[lang].toString().length}`);

          const compiledFct = new Function(
            'params',
            `${memStore[lang].toString()}; return templates_holder.template(params);`,
          );
          // console.log(compiledFct.toString());

          const util = getNoCompNlgLib(lang);

          const rendered = compiledFct({
            util: util,
          });

          // console.log(rendered);

          assert.equal(rendered, expected);
          done();
        });
      });
    });
  });

  describe('tiny with compilation', function () {
    testCases.forEach(function (testCase) {
      const lang = testCase[0];
      const template = testCase[1];
      const expected = testCase[2];

      it(`${lang} ${expected}`, function (done) {
        const rendered = getCompVersionRenderFct(lang)(template, { language: lang });

        assert.equal(rendered, expected);
        done();
      });
    });
  });
});
