var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCasesByLang = {
  'de_DE': [
    '_lang_de_DE',
    '_date_numbers_de_DE',
    '_multilingual_de_DE',
    '_refexpr_gender_de_DE',
    {name: '_cases_de_DE', params: {forceRandomSeed: 333}},
    '_possessives_de_DE',
    '_adj_de_DE'

  ],
  'fr_FR': [
    '_lang_fr_FR',
    '_date_numbers_fr_FR',
    '_adj_fr_FR',
    '_verbs_refexpr',
    '_possessives_fr_FR',
    {name: '_refexpr_gender_fr_FR', params: {forceRandomSeed: 797}},
    {name: '_refexpr_nextref', params: {forceRandomSeed: 591}},
    '_verb_fr_FR', 
    '_assembly_single_sentence', 
    '_multilingual_fr_FR'
  ],
  'en_US': [
    '_filter',
    '_protectString',
    '_a_an',
    '_verb_en_US', 
    '_possessives_en_US',
    '_adj_en_US', 
    '_lang_en_US',
    '_date_numbers_en_US',
    '_substantive',
    {name:'_foreach', params: {forceRandomSeed: 232}},
    '_hasSaid',
    '_hasSaid_values',
    '_assembly_sentences',
    '_syn_sequence',
    {name: '_synz_force', params: {forceRandomSeed: 1}},
    {name: '_synz_params', params: {forceRandomSeed: 591}},
    {name: '_syn_global_sequence', params: {defaultSynoMode: 'sequence'}},
    {name: '_syn_global_random', params: {defaultSynoMode: 'random', forceRandomSeed: 666}},
    {name: '_refexpr_syn', params: {forceRandomSeed: 796}},
    '_refexpr_edge',
    {name: '_mix', params: {forceRandomSeed: 123}},
    {name: '_synz', params: {forceRandomSeed: 508}},
    '_sentence_start',
    '_multilingual_en_US',
    {name: '_misc', params: {forceRandomSeed: 123}},
    '_new_struct'
  ]
}

const commandLineTests = process.argv.slice(3);

describe('freenlg', function() {
  describe('unit', function() {

    Object.keys(testCasesByLang).forEach(function(langKey) {
      const testCases = testCasesByLang[langKey];
      
      testCases.forEach(function(testCase) {
        const testCaseName = testCase.name!=null ? testCase.name : testCase;
 
        it(testCaseName, function() {
          const params = testCase.params!=null ? testCase.params : {};
          params.language = langKey;

          const rendered = freenlgPug.renderFile(__dirname + '/' + testCaseName + '.pug', params);
          
          assert.equal(rendered, params.util.expected);
        });

      });
    });


    
  
  });
});

