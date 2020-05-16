const version = require('./package.json').version;

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import modify from 'rollup-plugin-modify';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';
import unassert from 'rollup-plugin-unassert';
import analyze from 'rollup-plugin-analyzer';

// lib / language specific / for run / for comp
// for run => for comp
/*
  ALWAYS_IGNORE
  COMP_AND_RUN
  COMP_ONLY
*/
const libs = [
  // always ignore
  ['german-dict-helper', null, 'ALWAYS_IGNORE'],
  ['lefff-helper', null, 'ALWAYS_IGNORE'],
  ['morph-it-helper', null, 'ALWAYS_IGNORE'],
  ['rosaenlg-yseop', null, 'ALWAYS_IGNORE'],
  // looks like the new versions do not work in a browser? and used only by pug transformers
  ['uglify-js', null, 'ALWAYS_IGNORE'],
  ['jstransformer-uglify-js', null, 'ALWAYS_IGNORE'],
  // only used for comp
  ['rosaenlg-pug-code-gen', null, 'COMP_ONLY'],
  ['rosaenlg-pug-lexer', null, 'COMP_ONLY'],
  ['rosaenlg-pug-linker', null, 'COMP_ONLY'],
  ['rosaenlg-pug-load', null, 'COMP_ONLY'],
  ['rosaenlg-pug-parser', null, 'COMP_ONLY'],
  ['rosaenlg-pug-walk', null, 'COMP_ONLY'],

  // en_US specific
  // there are all for use in run too
  ['stopwords-en', 'en_US', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/english-stemmer.common.js', 'en_US', 'COMP_AND_RUN'],
  ['better-title-case', 'en_US', 'COMP_AND_RUN'],
  ['english-determiners', 'en_US', 'COMP_AND_RUN'],
  ['english-a-an', 'en_US', 'COMP_AND_RUN'],
  ['english-a-an-list', 'en_US', 'COMP_AND_RUN'],
  ['english-ordinals', 'en_US', 'COMP_AND_RUN'],
  // some comp only
  ['english-verbs-helper', 'en_US', 'COMP_AND_RUN'],
  ['english-verbs-gerunds', 'en_US', 'COMP_ONLY'],
  ['english-verbs-irregular', 'en_US', 'COMP_ONLY'],
  ['english-plurals', 'en_US', 'COMP_AND_RUN'],
  ['english-plurals-list', 'en_US', 'COMP_ONLY'],
  //['/dist/english-grammar.js', 'en_US', 'COMP_ONLY'],

  // de_DE specific
  ['stopwords-de', 'de_DE', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/german-stemmer.common.js', 'de_DE', 'COMP_AND_RUN'],
  ['german-adjectives', 'de_DE', 'COMP_AND_RUN'],
  ['german-adjectives-dict', 'de_DE', 'COMP_ONLY'],
  ['german-determiners', 'de_DE', 'COMP_AND_RUN'],
  ['german-ordinals', 'de_DE', 'COMP_AND_RUN'],
  ['german-verbs', 'de_DE', 'COMP_AND_RUN'],
  ['german-verbs-dict', 'de_DE', 'COMP_ONLY'],
  ['german-words', 'de_DE', 'COMP_AND_RUN'],
  ['german-words-dict', 'de_DE', 'COMP_ONLY'],
  //['/dist/german-grammar.js', 'de_DE', 'COMP_ONLY'],

  // fr_FR specific
  ['stopwords-fr', 'fr_FR', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/french-stemmer.common.js', 'fr_FR', 'COMP_AND_RUN'],
  ['french-adjectives', 'fr_FR', 'COMP_ONLY'], // is not a list but a set of rules
  ['french-adjectives-wrapper', 'fr_FR', 'COMP_AND_RUN'],
  ['french-determiners', 'fr_FR', 'COMP_AND_RUN'],
  ['french-contractions', 'fr_FR', 'COMP_AND_RUN'], // is required by filter
  ['french-ordinals', 'fr_FR', 'COMP_AND_RUN'],
  ['french-verbs', 'fr_FR', 'COMP_AND_RUN'],
  ['french-verbs-lefff', 'fr_FR', 'COMP_ONLY'],
  ['french-verbs-transitive', 'fr_FR', 'COMP_ONLY'],
  ['french-words', 'fr_FR', 'COMP_AND_RUN'],
  ['french-words-gender-lefff', 'fr_FR', 'COMP_ONLY'],
  ['pluralize-fr', 'fr_FR', 'COMP_ONLY'],
  ['titlecase-french', 'fr_FR', 'COMP_AND_RUN'],
  //['/dist/french-grammar.js', 'fr_FR', 'COMP_ONLY'],

  // it_IT specific
  ['stopwords-it', 'it_IT', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/italian-stemmer.common.js', 'it_IT', 'COMP_AND_RUN'],
  ['italian-adjectives', 'it_IT', 'COMP_AND_RUN'],
  ['italian-adjectives-dict', 'it_IT', 'COMP_ONLY'],
  ['italian-determiners', 'it_IT', 'COMP_AND_RUN'],
  ['italian-ordinals-cardinals', 'it_IT', 'COMP_AND_RUN'],
  ['italian-verbs', 'it_IT', 'COMP_AND_RUN'],
  ['italian-verbs-dict', 'it_IT', 'COMP_ONLY'],
  ['italian-words', 'it_IT', 'COMP_AND_RUN'],
  ['italian-words-dict', 'it_IT', 'COMP_ONLY'],

  // es_ES specific
  // TO BE COMPLETED
  ['stopwords-es', 'es_ES', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/spanish-stemmer.common.js', 'es_ES', 'COMP_AND_RUN'],
  ['spanish-verbs-wrapper', 'es_ES', 'COMP_AND_RUN'],
  ['spanish-verbs', 'es_ES', 'COMP_ONLY'],
  ['ordinal-spanish', 'es_ES', 'COMP_AND_RUN'],
  ['spanish-determiners', 'es_ES', 'COMP_AND_RUN'],
  ['spanish-words', 'es_ES', 'COMP_AND_RUN'],
  ['rosaenlg-pluralize-es', 'es_ES', 'COMP_ONLY'],
  ['rosaenlg-gender-es', 'es_ES', 'COMP_ONLY'],
  ['spanish-adjectives', 'es_ES', 'COMP_ONLY'],
  ['spanish-adjectives-wrapper', 'es_ES', 'COMP_AND_RUN'],

  // for rosaenlg-filter
  ['./italian', 'it_IT', 'COMP_AND_RUN'],
  ['./french', 'fr_FR', 'COMP_AND_RUN'],
  ['./english', 'en_US', 'COMP_AND_RUN'],
  ['./spanish', 'es_ES', 'COMP_AND_RUN'],

  // grammars
  ['../dist/french-grammar.js', 'fr_FR', 'COMP_ONLY'],
  ['../dist/english-grammar.js', 'en_US', 'COMP_ONLY'],
  ['../dist/german-grammar.js', 'de_DE', 'COMP_ONLY'],
  ['../dist/italian-grammar.js', 'it_IT', 'COMP_ONLY'],

  // from stemmer
  ['./eng-contractions.js', 'en_US', 'COMP_AND_RUN'],

  // numeral
  ['numeral/locales/fr', 'fr_FR', 'COMP_AND_RUN'],
  ['numeral/locales/it', 'it_IT', 'COMP_AND_RUN'],
  ['numeral/locales/de', 'de_DE', 'COMP_AND_RUN'],
  ['numeral/locales/es-es', 'es_ES', 'COMP_AND_RUN'],

  // moment
  ['moment/locale/de', 'de_DE', 'COMP_AND_RUN'],
  ['moment/locale/fr', 'fr_FR', 'COMP_AND_RUN'],
  ['moment/locale/it', 'it_IT', 'COMP_AND_RUN'],
  ['moment/locale/es', 'es_ES', 'COMP_AND_RUN'],

  // misc
  ['./EnglishOrdinals', 'en_US', 'COMP_AND_RUN'],
];

function getIgnoreList(lang, isCompile) {
  const res = [];

  for (let i = 0; i < libs.length; i++) {
    if (libs[i].length != 3) {
      const err = new Error();
      err.message = `improper conf line ${libs[i]}`;
      throw err;
    }
    const libName = libs[i][0];
    const libLang = libs[i][1];
    const type = libs[i][2];

    if (type == 'ALWAYS_IGNORE') {
      // always ignore
      res.push(libName);
    } else if (libLang && libLang != lang) {
      // not the proper language
      res.push(libName);
    } else if (!isCompile && type == 'COMP_ONLY') {
      // required for comp but not for run
      res.push(libName);
    }
  }

  // console.log(res);
  return res;
}

function ignoreLanguageCompPlugin(language, isComp) {
  const ignoreList = getIgnoreList(language, isComp);

  function idMustBeIgnored(id) {
    if (
      id &&
      (ignoreList.indexOf(id) > -1 ||
        // as there is a strange char on
        (id.indexOf('?commonjs-proxy') > -1 && ignoreList.indexOf(id.substr(1).replace('?commonjs-proxy', '')) > -1))
    ) {
      return true;
    } else {
      return false;
    }
  }

  return {
    name: 'ignore stuff that is not relevant for a specific language or when not compiling',
    resolveId(importee, _importer) {
      // console.log(importee + ' ' + importer);
      if (idMustBeIgnored(importee, language, isComp)) {
        return importee;
      } else {
        // console.log('we keep ' + importee);
        return null;
      }
    },
    load(id) {
      if (idMustBeIgnored(id, language, isComp)) {
        return `export default "This is virtual ${id}/${language}/${isComp}!"`;
      }
      return null;
    },
  };
}

function getRollupConf(language, isComp) {
  const conf = {
    input: `gulpfile.js/rollup/${isComp ? 'comp' : 'noComp'}.js`,
    output: {
      file: `dist/rollup/rosaenlg_tiny_${language}_${version}${isComp ? '_comp' : ''}.js`,
      format: 'umd',
      name: `rosaenlg_${language}`,
      exports: 'named',
      intro: `console.log('using RosaeNLG version ${version} for ${language} ${
        isComp ? '(with comp)' : '(render only)'
      }');`,
    },
    plugins: [
      ignoreLanguageCompPlugin(language, isComp),
      ...(isComp
        ? [
            replace({
              'os$1.EOL': 'null', // in recast
              't.buildMatchMemberExpression': 'void', // somewhere in babel types related to React...
            }),
          ]
        : []),
      ...(language != 'en_US'
        ? [
            modify({
              // remove long list of contractions, used by wink-tokenizer for English but always added
              find: /\s+contractions\[\s'.*\];/g,
              replace: '',
            }),
          ]
        : []),
      ...(isComp ? [resolve({ preferBuiltins: true })] : [resolve({ preferBuiltins: false })]),
      commonjs(), // so Rollup can convert `ms` to an ES module
      json(), // comp: to include compiledMain_client.json; no comp: used by aan
      unassert(),
      ...(isComp ? [globals(), builtins()] : []),
      terser(),
      analyze({ stdout: true, summaryOnly: true, limit: 20 }),
    ],
    treeshake: true,
    onwarn(warning, warn) {
      // silenting a few warnings
      if (warning.code == 'MISSING_GLOBAL_NAME' && warning.message.indexOf('snowball-stemmer.jsx/dest') > -1) {
        // we skip the messages related to the stemmer. related to the patch above
      } else if (warning.code == 'EVAL' && warning.loc.file.indexOf('to-fast-properties') > -1) {
        // eval in to-fast-properties
      } else if (warning.code == 'CIRCULAR_DEPENDENCY' && warning.message.indexOf('babel') > -1) {
        // ..\..\node_modules\babel-types\lib\index.js -> ..\..\node_modules\babel-types\lib\retrievers.js -> ..\..\node_modules\babel-types\lib\index.js
      } else {
        // console.log(`${warning.code} / ${warning.message} / ${JSON.stringify(warning.loc)}`);
        warn(warning);
      }
    },
  };

  return conf;
}

// language, isComp, run terser
const configs = [
  ['es_ES', false],
  ['es_ES', true],
  ['en_US', false],
  ['en_US', true],
  ['fr_FR', false],
  ['fr_FR', true],
  ['de_DE', false],
  ['de_DE', true],
  ['it_IT', false],
  ['it_IT', true],
  ['OTHER', false],
  ['OTHER', true],
];

export default (commandLineArgs) => {
  let lang;
  const possibleLangs = ['fr_FR', 'en_US', 'it_IT', 'de_DE', 'es_ES', 'OTHER'];
  for (const aLang of possibleLangs) {
    if (commandLineArgs[aLang] === true) {
      lang = aLang;
      break;
    }
  }
  if (!lang) {
    throw 'must specify a language!';
  } else {
    delete commandLineArgs[lang];
    console.log(`rollup for ${lang}...`);
    const res = [];
    for (let i = 0; i < configs.length; i++) {
      if (configs[i][0] === lang) {
        res.push(getRollupConf(configs[i][0], configs[i][1]));
      }
    }
    return res;
  }
};
