/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

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
import license from 'rollup-plugin-license';

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

  //['', null, 'ALWAYS_IGNORE'],

  // only used for comp
  ['rosaenlg-pug-code-gen', null, 'COMP_ONLY'],
  ['rosaenlg-pug-lexer', null, 'COMP_ONLY'],
  ['rosaenlg-pug-linker', null, 'COMP_ONLY'],
  ['rosaenlg-pug-load', null, 'COMP_ONLY'],
  ['rosaenlg-pug-parser', null, 'COMP_ONLY'],
  ['rosaenlg-pug-walk', null, 'COMP_ONLY'],

  // en specific
  // there are all for use in run too
  ['stopwords-en', 'en', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/english-stemmer.common.js', 'en', 'COMP_AND_RUN'],
  ['better-title-case', 'en', 'COMP_AND_RUN'],
  ['english-determiners', 'en', 'COMP_AND_RUN'],
  ['english-a-an', 'en', 'COMP_AND_RUN'],
  ['english-a-an-list', 'en', 'COMP_AND_RUN'],
  ['english-ordinals', 'en', 'COMP_AND_RUN'],
  // some comp only
  ['english-verbs-helper', 'en', 'COMP_AND_RUN'],
  ['english-verbs-gerunds', 'en', 'COMP_ONLY'],
  ['english-verbs-irregular', 'en', 'COMP_ONLY'],
  ['english-plurals', 'en', 'COMP_AND_RUN'],
  ['english-plurals-list', 'en', 'COMP_ONLY'],
  //['/dist/english-grammar.js', 'en', 'COMP_ONLY'],

  // de specific
  ['stopwords-de', 'de', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/german-stemmer.common.js', 'de', 'COMP_AND_RUN'],
  ['german-adjectives', 'de', 'COMP_AND_RUN'],
  ['german-adjectives-dict', 'de', 'COMP_ONLY'],
  ['german-determiners', 'de', 'COMP_AND_RUN'],
  ['german-ordinals', 'de', 'COMP_AND_RUN'],
  ['german-verbs', 'de', 'COMP_AND_RUN'],
  ['german-verbs-dict', 'de', 'COMP_ONLY'],
  ['german-words', 'de', 'COMP_AND_RUN'],
  ['german-words-dict', 'de', 'COMP_ONLY'],
  //['/dist/german-grammar.js', 'de', 'COMP_ONLY'],

  // fr specific
  ['stopwords-fr', 'fr', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/french-stemmer.common.js', 'fr', 'COMP_AND_RUN'],
  ['french-adjectives', 'fr', 'COMP_ONLY'], // is not a list but a set of rules
  ['french-adjectives-wrapper', 'fr', 'COMP_AND_RUN'],
  ['french-determiners', 'fr', 'COMP_AND_RUN'],
  ['french-contractions', 'fr', 'COMP_AND_RUN'], // is required by filter
  ['french-ordinals', 'fr', 'COMP_AND_RUN'],
  ['french-verbs', 'fr', 'COMP_AND_RUN'],
  ['french-verbs-lefff', 'fr', 'COMP_ONLY'],
  ['french-verbs-transitive', 'fr', 'COMP_ONLY'],
  ['french-words', 'fr', 'COMP_AND_RUN'],
  ['french-words-gender-lefff', 'fr', 'COMP_ONLY'],
  ['rosaenlg-pluralize-fr', 'fr', 'COMP_ONLY'],
  ['titlecase-french', 'fr', 'COMP_AND_RUN'],
  //['/dist/french-grammar.js', 'fr', 'COMP_ONLY'],

  // it specific
  ['stopwords-it', 'it', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/italian-stemmer.common.js', 'it', 'COMP_AND_RUN'],
  ['italian-adjectives', 'it', 'COMP_AND_RUN'],
  ['italian-adjectives-dict', 'it', 'COMP_ONLY'],
  ['italian-determiners', 'it', 'COMP_AND_RUN'],
  ['italian-ordinals-cardinals', 'it', 'COMP_AND_RUN'],
  ['italian-verbs', 'it', 'COMP_AND_RUN'],
  ['italian-verbs-dict', 'it', 'COMP_ONLY'],
  ['italian-words', 'it', 'COMP_AND_RUN'],
  ['italian-words-dict', 'it', 'COMP_ONLY'],

  // es specific
  ['stopwords-es', 'es', 'COMP_AND_RUN'],
  ['snowball-stemmer.jsx/dest/spanish-stemmer.common.js', 'es', 'COMP_AND_RUN'],
  ['rosaenlg-gender-es', 'es', 'COMP_ONLY'],
  ['rosaenlg-pluralize-es', 'es', 'COMP_ONLY'],
  ['spanish-adjectives', 'es', 'COMP_ONLY'],
  ['spanish-adjectives-wrapper', 'es', 'COMP_AND_RUN'],
  ['spanish-determiners', 'es', 'COMP_AND_RUN'],
  ['spanish-verbs', 'es', 'COMP_ONLY'],
  ['spanish-verbs-wrapper', 'es', 'COMP_AND_RUN'],
  ['spanish-words', 'es', 'COMP_AND_RUN'],
  ['ordinal-spanish', 'es', 'COMP_AND_RUN'],

  // for rosaenlg main package
  ['./LanguageEnglish', 'en', 'COMP_AND_RUN'],
  ['./LanguageFrench', 'fr', 'COMP_AND_RUN'],
  ['./LanguageGerman', 'de', 'COMP_AND_RUN'],
  ['./LanguageItalian', 'it', 'COMP_AND_RUN'],
  ['./LanguageSpanish', 'es', 'COMP_AND_RUN'],
  ['./LanguageOther', 'OTHER', 'COMP_AND_RUN'],

  // for rosaenlg-filter
  ['./LanguageFilterEnglish', 'en', 'COMP_AND_RUN'],
  ['./LanguageFilterFrench', 'fr', 'COMP_AND_RUN'],
  ['./LanguageFilterGerman', 'de', 'COMP_AND_RUN'],
  ['./LanguageFilterItalian', 'it', 'COMP_AND_RUN'],
  ['./LanguageFilterSpanish', 'es', 'COMP_AND_RUN'],
  ['./LanguageFilterOther', 'OTHER', 'COMP_AND_RUN'],

  // for rosaenlg-commons
  ['./LanguageCommonEnglish', 'en', 'COMP_AND_RUN'],
  ['./LanguageCommonFrench', 'fr', 'COMP_AND_RUN'],
  ['./LanguageCommonGerman', 'de', 'COMP_AND_RUN'],
  ['./LanguageCommonItalian', 'it', 'COMP_AND_RUN'],
  ['./LanguageCommonSpanish', 'es', 'COMP_AND_RUN'],
  ['./LanguageCommonOther', 'OTHER', 'COMP_AND_RUN'],

  // for rosaenlg-pug-code-gen
  ['./LanguageCodeGenEnglish', 'en', 'COMP_ONLY'],
  ['./LanguageCodeGenFrench', 'fr', 'COMP_ONLY'],
  ['./LanguageCodeGenGerman', 'de', 'COMP_ONLY'],
  ['./LanguageCodeGenItalian', 'it', 'COMP_ONLY'],
  ['./LanguageCodeGenSpanish', 'es', 'COMP_ONLY'],
  ['./LanguageCodeGenOther', 'OTHER', 'COMP_ONLY'],

  // synonym-optimizer
  ['./LanguageSynEnglish', 'en', 'COMP_AND_RUN'],
  ['./LanguageSynFrench', 'fr', 'COMP_AND_RUN'],
  ['./LanguageSynGerman', 'de', 'COMP_AND_RUN'],
  ['./LanguageSynItalian', 'it', 'COMP_AND_RUN'],
  ['./LanguageSynSpanish', 'es', 'COMP_AND_RUN'],
  ['./LanguageSynOther', 'OTHER', 'COMP_AND_RUN'],

  // grammars
  ['../dist/french-grammar.js', 'fr', 'COMP_ONLY'],
  ['../dist/english-grammar.js', 'en', 'COMP_ONLY'],
  ['../dist/german-grammar.js', 'de', 'COMP_ONLY'],
  ['../dist/italian-grammar.js', 'it', 'COMP_ONLY'],

  // from stemmer
  ['./eng-contractions.js', 'en', 'COMP_AND_RUN'],

  // numeral
  ['numeral/locales/fr', 'fr', 'COMP_AND_RUN'],
  ['numeral/locales/it', 'it', 'COMP_AND_RUN'],
  ['numeral/locales/de', 'de', 'COMP_AND_RUN'],
  ['numeral/locales/es-es', 'es', 'COMP_AND_RUN'],

  // n2words: it is not useful at they are required through LanguageImpl, yet this one is required by global import
  ['../locale/en-US/index.js', 'en', 'COMP_AND_RUN'],

  // misc
];

const iso2toFnDate = {
  en: 'en-US',
  de: 'de',
  fr: 'fr',
  it: 'it',
  es: 'es',
};

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

  const ignoredMap = {}; // is global, thus distinguish between languages and comp / not comp
  const ignoreMapKey = `${language}_${isComp}`;
  ignoredMap[ignoreMapKey] = [];

  function doIgnore(importee, importer, ignore) {
    if (ignore) {
      ignoredMap[ignoreMapKey].push(importee);
    }
    // console.log(importee, importer, ignore ? '=> IGNORE' : '=> keep');
  }

  function mustBeIgnored(importee, importer) {
    const fnDateRe = new RegExp('^./([a-z]{2}|[a-z]{2}-[A-Za-z]*)/index.js$');
    if (
      importee &&
      (ignoreList.indexOf(importee) > -1 ||
        // as there is a strange char on
        (importee.indexOf('?commonjs-proxy') > -1 &&
          ignoreList.indexOf(importee.substr(1).replace('?commonjs-proxy', '')) > -1))
    ) {
      doIgnore(importee, importer, true);
      return true;
    } else {
      // is a date-fns locale
      const dateFnsLocaleRes = fnDateRe.exec(importee);
      if (dateFnsLocaleRes) {
        const dateFnsLocale = dateFnsLocaleRes[1];
        if (iso2toFnDate[language] === dateFnsLocale) {
          doIgnore(importee, importer, false);
          return false;
        } else {
          //console.log(importee, importer, '=> IGNORE');
          doIgnore(importee, importer, true);
          return true;
        }
      } else {
        // we only keep ./format/index.js on date-fns
        if (/date-fns.esm.index/.test(importer) && !/^\.\/format\//.test(importee)) {
          doIgnore(importee, importer, true);
          return true;
        } else {
          doIgnore(importee, importer, false);
          return false;
        }
      }
    }
  }

  return {
    name: 'ignore stuff that is not relevant for a specific language or when not compiling',
    resolveId(importee, importer) {
      // console.log(importee, importer);
      if (mustBeIgnored(importee, importer)) {
        return importee;
      } else {
        // console.log('we keep ' + importee);
        return null;
      }
    },
    load(importee) {
      if (ignoredMap[ignoreMapKey].includes(importee)) {
        return `export default "This is virtual ${importee}/${language}/${isComp}!"`;
      }
      return null;
    },
  };
}

function getRollupConf(language, isComp, languageWithLocale) {
  const conf = {
    cache: false, // does it really work?
    input: `gulpfile.js/rollup/${isComp ? 'comp' : 'noComp'}.js`,
    output: {
      file: `dist/rollup/rosaenlg_tiny_${languageWithLocale}_${version}${isComp ? '_comp' : ''}.js`,
      format: 'umd',
      name: `rosaenlg_${languageWithLocale}`,
      exports: 'named',
      intro: `console.log('using RosaeNLG (Apache 2.0) version ${version} for ${language} ${
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
      ...(language != 'en'
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
      analyze({ stdout: true, summaryOnly: true, limit: 30 }),
      license({
        banner: `Bundle of RosaeNLG, for ${language} ${isComp ? '(with comp)' : '(render only)'}
Version: <%= pkg.version %>
SPDX-License-Identifier: Apache-2.0
Copyright 2020, Ludan Stoecklé
Generated: <%= moment().format('YYYY-MM-DD') %>
`,
      }),
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

// language => locale for compatibility (file naming)
const iso2toLocale = {
  es: 'es_ES',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  OTHER: 'OTHER',
};

export default (commandLineArgs) => {
  let lang;
  const possibleLangs = ['fr', 'en', 'it', 'de', 'es', 'OTHER'];
  for (const aLang of possibleLangs) {
    if (commandLineArgs[aLang] === true) {
      lang = aLang;
      break;
    }
  }
  delete commandLineArgs[lang];

  let isComp;
  if (commandLineArgs['comp'] === true) {
    isComp = true;
  }
  if (commandLineArgs['nocomp'] === true) {
    isComp = false;
  }
  if (isComp === null) {
    throw 'must specify comp or nocomp!';
  }

  if (!lang) {
    throw 'must specify a language!';
  }
  console.log(`rollup for ${lang}/${isComp}...`);

  return [getRollupConf(lang, isComp, iso2toLocale[lang])];
};
