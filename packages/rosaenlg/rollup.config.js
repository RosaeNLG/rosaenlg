const version = require('./package.json').version;

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';
import unassert from 'rollup-plugin-unassert';

// lib / language specific / for run / for comp
// for run => for comp
const libs = [
  // always ignore
  ['german-dict-helper', null, false, false],
  ['lefff-helper', null, false, false],
  ['morph-it-helper', null, false, false],
  ['rosaenlg-yseop', null, false, false],
  // looks like the new versions do not work in a browser? and used only by pug transformers
  ['uglify-js', null, false, false],
  ['jstransformer-uglify-js', null, false, false],
  // only used for comp
  ['rosaenlg-pug-code-gen', null, false, true],
  ['rosaenlg-pug-lexer', null, false, true],
  ['rosaenlg-pug-linker', null, false, true],
  ['rosaenlg-pug-load', null, false, true],
  ['rosaenlg-pug-parser', null, false, true],
  ['rosaenlg-pug-walk', null, false, true],
  // en_US specific
  // there are all for use in run too
  ['stopwords-us', 'en_US', true, null],
  ['snowball-stemmer.jsx/dest/english-stemmer.common.js', 'en_US', true, null],
  ['compromise', 'en_US', true, null],
  ['better-title-case', 'en_US', true, null],
  ['english-determiners', 'en_US', true, null],
  // some comp only
  ['english-verbs-helper', 'en_US', true, null],
  ['english-verbs-gerunds', 'en_US', false, true],
  ['english-verbs-irregular', 'en_US', false, true],
  // de_DE specific
  ['stopwords-de', 'de_DE', true, null],
  ['snowball-stemmer.jsx/dest/german-stemmer.common.js', 'de_DE', true, null],
  ['german-adjectives', 'de_DE', true, null],
  ['german-adjectives-dict', 'de_DE', false, true],
  ['german-determiners', 'de_DE', true, null],
  ['german-ordinals', 'de_DE', true, null],
  ['german-verbs', 'de_DE', true, null],
  ['german-verbs-dict', 'de_DE', false, true],
  ['german-words', 'de_DE', true, null],
  ['german-words-dict', 'de_DE', false, true],
  ['write-int', 'de_DE', true, null],
  // fr_FR specific
  ['stopwords-fr', 'fr_FR', true, null],
  ['snowball-stemmer.jsx/dest/french-stemmer.common.js', 'fr_FR', true, null],
  ['french-adjectives', 'fr_FR', false, true],
  ['french-determiners', 'fr_FR', true, null],
  ['french-h-muet-aspire', 'fr_FR', true, null],
  ['french-ordinals', 'fr_FR', true, null],
  ['french-verbs', 'fr_FR', true, null],
  ['french-verbs-lefff', 'fr_FR', false, true],
  ['french-verbs-transitive', 'fr_FR', false, true],
  ['french-words-gender', 'fr_FR', true, null],
  ['french-words-gender-lefff', 'fr_FR', false, true],
  ['pluralize-fr', 'fr_FR', true, null],
  ['titlecase-french', 'fr_FR', true, null],
  ['written-number', 'fr_FR', true, null],
  // it_IT specific
  ['stopwords-it', 'it_IT', true, null],
  ['snowball-stemmer.jsx/dest/italian-stemmer.common.js', 'it_IT', true, null],
  ['italian-adjectives', 'it_IT', true, null],
  ['italian-adjectives-dict', 'it_IT', false, true],
  ['italian-determiners', 'it_IT', true, null],
  ['italian-ordinals-cardinals', 'it_IT', true, null],
  ['italian-verbs', 'it_IT', true, null],
  ['italian-verbs-dict', 'it_IT', false, true],
  ['italian-words', 'it_IT', true, null],
  ['italian-words-dict', 'it_IT', false, true],
];

function getIgnoreList(lang, isCompile) {
  const res = [];

  for (let i = 0; i < libs.length; i++) {
    if (libs[i].length != 4) {
      const err = new Error();
      err.message = `improper conf line ${libs[i]}`;
      throw err;
    }
    const libName = libs[i][0];
    const libLang = libs[i][1];
    const libForRun = libs[i][2];
    const libForComp = libs[i][3];

    if (!libForRun && !libForComp) {
      // always ignore
      res.push(libName);
    } else if (libLang && libLang != lang) {
      // not the proper language
      res.push(libName);
    } else if (!isCompile && libForComp) {
      // required for comp but not for run
      res.push(libName);
    }
  }

  // console.log(res);
  return res;
}

function getGlobalsToIgnore(lang, isCompile) {
  const res = {};
  const ignoreList = getIgnoreList(lang, isCompile);
  for (let i = 0; i < ignoreList.length; i++) {
    if (!ignoreList[i].startsWith('snowball-stemmer.jsx')) {
      // patch; if we don't, even the proper stemmer is removed from the package
      res[ignoreList[i]] = 'IGNORED_' + ignoreList[i];
    }
  }
  // console.log(res);
  return res;
}

function getRollupConf(language, isComp) {
  const conf = {
    input: `gulpfile.js/rollup/${isComp ? 'comp' : 'noComp'}.js`,
    external: getIgnoreList(language, isComp),
    output: {
      file: `dist/rollup/rosaenlg_tiny_${language}_${version}${isComp ? '_comp' : ''}.js`,
      format: 'umd',
      name: `rosaenlg_${language}`,
      exports: 'named',
      globals: getGlobalsToIgnore(language, isComp),
      intro: `console.log('using RosaeNLG version ${version} for ${language}');`,
    },
    plugins: [
      ...(isComp
        ? [
            replace({
              'os$1.EOL': 'null', // in recast
              't.buildMatchMemberExpression': 'void', // somewhere in babel types related to React...
            }),
          ]
        : []),
      ...(isComp ? [resolve({ preferBuiltins: true })] : [resolve({ preferBuiltins: false })]),
      commonjs(), // so Rollup can convert `ms` to an ES module
      json(), // comp: to include compiledMain_client.json; no comp: used by written-number
      unassert(),
      ...(isComp ? [globals(), builtins()] : []),
      terser(),
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

export default commandLineArgs => {
  let lang;
  if (commandLineArgs.fr_FR === true) {
    lang = 'fr_FR';
  } else if (commandLineArgs.en_US === true) {
    lang = 'en_US';
  } else if (commandLineArgs.it_IT === true) {
    lang = 'it_IT';
  } else if (commandLineArgs.de_DE === true) {
    lang = 'de_DE';
  } else if (commandLineArgs.OTHER === true) {
    lang = 'OTHER';
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
