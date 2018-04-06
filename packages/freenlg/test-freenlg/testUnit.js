var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();


module.exports = it => {
  
  var commandLineTests = process.argv.slice(3);

  var testCasesByLang = {
    'fr_FR': [
      'test_lang_fr_FR',
      'test_adj_fr_FR',
      'test_verbs_ana',
      'test_possessives',
      {name: 'test_ana_gender', params: {forceRandomSeed: 797}},
      'test_verb_fr_FR', 
      'test_assembly_single_sentence', 
      'test_foreach',
      'test_multilingual_fr_FR'
    ],
    'en_US': [
      'test_a_an',
      'test_verb_en_US', 
      'test_lang_en_US',
      'test_substantive',
      'test_hasSaid',
      'test_hasSaid_values',
      'test_assembly_sentences',
      'test_syn_sequence',
      {name: 'test_syn_global_sequence', params: {defaultSynoType: 'sequence'}},
      {name: 'test_syn_global_random', params: {defaultSynoType: 'random', forceRandomSeed: 666}},
      {name: 'test_isNotEmpty', params: {forceRandomSeed: 508}},
      {name: 'test_ana_nextref', params: {forceRandomSeed: 591}},
      {name: 'test_ana_syn', params: {forceRandomSeed: 796}},
      {name: 'test_shuffle', params: {forceRandomSeed: 123}},
      {name: 'test_syno_sentences', params: {forceRandomSeed: 508}},
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
  //console.log(JSON.stringify(params));
  var rendered = freenlgPug.renderFile('test-freenlg/' + testCase + '.pug', params);
  return { rendered: rendered, expected: params.util.expected };
}
