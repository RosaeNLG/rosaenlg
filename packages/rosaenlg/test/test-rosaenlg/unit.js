var assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const testCasesByLang = {
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
    'adj',
    'verbs_refexpr',
    'possessives',
    { name: 'refexpr_gender', params: { forceRandomSeed: 797 } },
    { name: 'refexpr_nextref', params: { forceRandomSeed: 591 } },
    'verb',
    'multilingual',
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  en_US: [
    'filter',
    'protectString',
    'a_an',
    'verb',
    'possessives',
    'adj',
    'lang',
    'date_numbers',
    'substantive',
    { name: 'foreach', params: { forceRandomSeed: 202 } },
    'hasSaid',
    'hasSaid_values',
    'assembly_sentences',
    'assembly_single_sentence',
    'syn_sequence',
    { name: 'synz_force', params: { forceRandomSeed: 1 } },
    { name: 'synz_params', params: { forceRandomSeed: 591 } },
    { name: 'syn_global_sequence', params: { defaultSynoMode: 'sequence' } },
    { name: 'syn_global_random', params: { defaultSynoMode: 'random', forceRandomSeed: 666 } },
    { name: 'refexpr_syn', params: { forceRandomSeed: 796 } },
    'refexpr_edge',
    { name: 'mix', params: { forceRandomSeed: 123 } },
    { name: 'synz', params: { forceRandomSeed: 508 } },
    'sentence_start',
    'multilingual',
    { name: 'misc', params: { forceRandomSeed: 123 } },
    'new_struct',
  ],
};

describe('rosaenlg', function() {
  describe('unit', function() {
    Object.keys(testCasesByLang).forEach(function(langKey) {
      const testCases = testCasesByLang[langKey];

      describe(langKey, function() {
        testCases.forEach(function(testCase) {
          const testCaseFileName = testCase.name != null ? testCase.name : testCase;

          describe(testCaseFileName, function() {
            const params = testCase.params != null ? testCase.params : {};
            params.language = langKey;

            const rendered = rosaenlgPug.renderFile(`${__dirname}/${langKey}/${testCaseFileName}.pug`, params);

            if (params.util.rawExpected) {
              it('check equal raw', function() {
                assert.equal(rendered, params.util.rawExpected);
              });
            } else {
              let withoutEnglobing = rendered.replace(/^<t><l>/, '').replace(/<\/l><\/t>$/, '');
              let renderedChunks = withoutEnglobing.split('</l><l>');
              //console.log(renderedChunks);

              let expected = [];
              const lines = params.util.expected.split('\n');
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() != '') {
                  expected.push(lines[i].trim());
                }
              }
              it(`check size expected ${expected.length} vs real ${renderedChunks.length}`, function() {
                assert.equal(
                  expected.length,
                  renderedChunks.length,
                  `expected: ${expected}, rendered: ${renderedChunks}`,
                );
              });
              describe('check line by line', function() {
                for (let i = 0; i < expected.length; i++) {
                  it(expected[i], function() {
                    assert.equal(renderedChunks[i], expected[i]);
                  });
                }
              });
            }
          });
        });
      });
    });
  });
});
