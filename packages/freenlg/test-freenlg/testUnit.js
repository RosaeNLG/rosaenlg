var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();


module.exports = it => {
  
  var commandLineTests = process.argv.slice(3);

  var testCasesByLang = {
    'de_DE': [
      'test_lang_de_DE',
      'test_date_numbers_de_DE',
      'test_multilingual_de_DE',
      'test_refexpr_gender_de_DE',
      {name: 'test_cases_de_DE', params: {forceRandomSeed: 333}},
      // 'test_possessives_de_DE'

    ],
    'fr_FR': [
      'test_lang_fr_FR',
      'test_date_numbers_fr_FR',
      'test_adj_fr_FR',
      'test_verbs_refexpr',
      'test_possessives_fr_FR',
      {name: 'test_refexpr_gender_fr_FR', params: {forceRandomSeed: 797}},
      {name: 'test_refexpr_nextref', params: {forceRandomSeed: 591}},
      'test_verb_fr_FR', 
      'test_assembly_single_sentence', 
      'test_multilingual_fr_FR'
    ],
    'en_US': [
      'test_filter',
      'test_protectString',
      'test_a_an',
      'test_verb_en_US', 
      'test_lang_en_US',
      'test_date_numbers_en_US',
      'test_substantive',
      'test_foreach',
      'test_hasSaid',
      'test_hasSaid_values',
      'test_assembly_sentences',
      'test_syn_sequence',
      {name: 'test_synz_force', params: {forceRandomSeed: 1}},
      {name: 'test_synz_params', params: {forceRandomSeed: 591}},
      {name: 'test_syn_global_sequence', params: {defaultSynoMode: 'sequence'}},
      {name: 'test_syn_global_random', params: {defaultSynoMode: 'random', forceRandomSeed: 666}},
      {name: 'test_refexpr_syn', params: {forceRandomSeed: 796}},
      {name: 'test_mix', params: {forceRandomSeed: 123}},
      {name: 'test_synz', params: {forceRandomSeed: 508}},
      'test_sentence_start',
      'test_multilingual_en_US',
      'test_misc',
      'test_new_struct'
    ]
  }

  for (var langKey in testCasesByLang) {
    var testCases = testCasesByLang[langKey];
    
    for (let testCase of testCases) {
      var testCaseName = testCase.name!=null ? testCase.name : testCase;

      if (commandLineTests.length==0 || commandLineTests.indexOf(testCaseName)>-1) {
        var params = testCase.params!=null ? testCase.params : {};
        params.language = langKey;
        var runResult = getRunResult(testCaseName, params);
        it(testCaseName, () => it.eq(runResult.rendered, runResult.expected));
      }
    }
  }

};



function getRunResult(testCase, params) {
  var rendered = freenlgPug.renderFile('test-freenlg/' + testCase + '.pug', params);
  return { rendered: rendered, expected: params.util.expected };
}
