const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const testCasesByLang = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  es_ES: ['lang', 'verb', 'date_numbers', 'det_words', 'adj', 'multilingual', 'refexpr_gender'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  nl_NL: ['anylang'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  it_IT: ['lang', 'date_numbers', 'multilingual', 'adj', 'refexpr_gender', 'verb'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  de_DE: [
    'lang',
    'date_numbers',
    'multilingual',
    'refexpr_gender',
    { name: 'cases', params: { forceRandomSeed: 333 } },
    'possessives',
    'adj',
    'verb',
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  fr_FR: [
    'lang',
    'date_numbers',
    'value',
    { name: 'arrays', params: { forceRandomSeed: 123 } },
    { name: 'adj', params: { forceRandomSeed: 420 } },
    'verbs_refexpr',
    'possessives',
    { name: 'refexpr_gender', params: { forceRandomSeed: 797 } },
    { name: 'refexpr_nextref', params: { forceRandomSeed: 591 } },
    'verb',
    'multilingual',
    'chanson',
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  en_US: [
    'protectString',
    'a_an',
    { name: 'verb', params: { forceRandomSeed: 123 } },
    'possessives',
    'adj',
    'lang',
    'date_numbers',
    'words',
    { name: 'foreach', params: { forceRandomSeed: 202 } },
    'hasSaid',
    'hasSaid_values',
    'assembly_sentences',
    'assembly_single_sentence',
    'synz_sequence',
    { name: 'synz_force', params: { forceRandomSeed: 1 } },
    { name: 'synz_once', params: { forceRandomSeed: 3 } },
    { name: 'synz_params', params: { forceRandomSeed: 591 } },
    { name: 'syn_global_sequence', params: { defaultSynoMode: 'sequence' } },
    { name: 'syn_global_random', params: { defaultSynoMode: 'random', forceRandomSeed: 666 } },
    { name: 'refexpr_syn', params: { forceRandomSeed: 796 } },
    'refexpr_edge',
    { name: 'mix', params: { forceRandomSeed: 123 } },
    { name: 'synz', params: { forceRandomSeed: 508 } },
    'synz_strange',
    'sentence_start',
    'multilingual',
    { name: 'misc', params: { forceRandomSeed: 123 } },
    'new_struct',
    { name: 'value_basic', params: { forceRandomSeed: 123 } },
    'spaces_bug',
    'choosebest_imbricated',
    { name: 'dynamic_asm', params: { forceRandomSeed: 123 } },
    'bullet',
    'dynamic_last_elt_itemz',
    'dynamic_last_elt_foreach',
    'itemz_eachz_imbricated',
  ],
};

function check(lang, testCaseFileName, params) {
  const rendered = rosaenlgPug.renderFile(`${__dirname}/${lang}/${testCaseFileName}.pug`, params);

  if (params.util.rawExpected) {
    it('check equal raw', function () {
      assert.equal(rendered, params.util.rawExpected);
    });
  } else {
    const withoutEnglobing = rendered.replace(/^<t><l>/, '').replace(/<\/l><\/t>$/, '');
    const renderedChunks = withoutEnglobing.split('</l><l>');
    //console.log(renderedChunks);

    const expected = [];
    const lines = params.util.expected.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() != '') {
        expected.push(lines[i].trim());
      }
    }
    it(`check size expected ${expected.length} vs real ${renderedChunks.length}`, function () {
      assert.equal(expected.length, renderedChunks.length, `expected: ${expected}, rendered: ${renderedChunks}`);
    });
    for (let i = 0; i < expected.length; i++) {
      it(expected[i], function () {
        // we have to trim as .<l/> generates a space after
        assert.equal(renderedChunks[i].trim(), expected[i]);
      });
    }
  }
}

describe('rosaenlg', function () {
  describe('unit', function () {
    Object.keys(testCasesByLang).forEach(function (langKey) {
      const testCases = testCasesByLang[langKey];

      describe(langKey, function () {
        testCases.forEach(function (testCase) {
          const testCaseFileName = testCase.name ? testCase.name : testCase;

          describe(testCaseFileName, function () {
            const params = testCase.params ? testCase.params : {};
            params.language = langKey;

            describe('with compileDebug true', function () {
              params.compileDebug = true;
              check(langKey, testCaseFileName, params);
            });
            describe('with compileDebug false', function () {
              params.compileDebug = false;
              check(langKey, testCaseFileName, params);
            });
          });
        });
      });
    });
  });
});
