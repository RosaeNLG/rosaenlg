var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCasesByLang = {
  'de_DE': [
    'lang',
    'date_numbers',
    'multilingual',
    'refexpr_gender',
    {name: 'cases', params: {forceRandomSeed: 333}},
    'possessives',
    'adj',
    'verb',
  ],
  'fr_FR': [
    'lang',
    'date_numbers',
    'adj',
    'verbs_refexpr',
    'possessives',
    {name: 'refexpr_gender', params: {forceRandomSeed: 797}},
    {name: 'refexpr_nextref', params: {forceRandomSeed: 591}},
    'verb', 
    'assembly_single_sentence', 
    'multilingual',
  ],
  'en_US': [
    'filter',
    'protectString',
    'a_an',
    'verb', 
    'possessives',
    'adj', 
    'lang',
    'date_numbers',
    'substantive',
    {name:'foreach', params: {forceRandomSeed: 202}},
    'hasSaid',
    'hasSaid_values',
    'assembly_sentences',
    'syn_sequence',
    {name: 'synz_force', params: {forceRandomSeed: 1}},
    {name: 'synz_params', params: {forceRandomSeed: 591}},
    {name: 'syn_global_sequence', params: {defaultSynoMode: 'sequence'}},
    {name: 'syn_global_random', params: {defaultSynoMode: 'random', forceRandomSeed: 666}},
    {name: 'refexpr_syn', params: {forceRandomSeed: 796}},
    'refexpr_edge',
    {name: 'mix', params: {forceRandomSeed: 123}},
    {name: 'synz', params: {forceRandomSeed: 508}},
    'sentence_start',
    'multilingual',
    {name: 'misc', params: {forceRandomSeed: 123}},
    'new_struct',
  ]
}

const commandLineTests = process.argv.slice(3);

function getExpected(util) {
  if (util.expected!=null) {
    var res = '';

    const lines = util.expected.split('\n');
    for (var i=0; i<lines.length; i++) {
      if (lines[i].trim()!='') {
        res += `<l>${lines[i].trim()}</l>`;
      }
    }

    return `<t>${res}</t>`;

  } else {
    return util.rawExpected;
  }
}

describe('freenlg', function() {
  describe('unit', function() {

    Object.keys(testCasesByLang).forEach(function(langKey) {
      const testCases = testCasesByLang[langKey];
      
      describe(langKey, function() {

        testCases.forEach(function(testCase) {
          const testCaseFileName = testCase.name!=null ? testCase.name : testCase;
  
          it(testCaseFileName, function() {
            const params = testCase.params!=null ? testCase.params : {};
            params.language = langKey;

            const rendered = freenlgPug.renderFile(`${__dirname}/${langKey}/${testCaseFileName}.pug`, params);
            
            assert.equal(rendered, getExpected(params.util));
          });

        });

      });
    });


    
  
  });
});

