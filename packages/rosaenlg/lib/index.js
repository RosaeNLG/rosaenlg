'use strict';

/*!
 * Pug
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

/*
compileFileClient 
	-> compileClient
		-> compileClientWithDependenciesTracked
			-> compileBody

compileFile
	-> handleTemplateCache
		NlgLib object gets created
		-> compile
			-> compileBody

*/

const fs = require('fs');
const path = require('path');
const lex = require('rosaenlg-pug-lexer');
const stripComments = require('pug-strip-comments');
const parse = require('rosaenlg-pug-parser');
const load = require('rosaenlg-pug-load');
const link = require('rosaenlg-pug-linker');
const generateCode = require('rosaenlg-pug-code-gen');
const generateYseopCode = require('rosaenlg-yseop');
const runtime = require('pug-runtime');
const runtimeWrap = require('pug-runtime/wrap');

// fr_FR
const frenchVerbs = require('french-verbs');
const frenchVerbsLefff = require('french-verbs-lefff');
const frenchWords = require('french-words');
const frenchWordsGenderLefff = require('french-words-gender-lefff');
const frenchAdjectivesWrapper = require('french-adjectives-wrapper');

// de_DE
const germanWords = require('german-words');
const germanWordsDict = require('german-words-dict');
const germanVerbs = require('german-verbs');
const germanVerbsDict = require('german-verbs-dict');
const germanAdjectives = require('german-adjectives');
const germanAdjectivesDict = require('german-adjectives-dict');

// it_IT
const italianWords = require('italian-words');
const italianWordsDict = require('italian-words-dict');
const italianAdjectives = require('italian-adjectives');
const italianAdjectivesDict = require('italian-adjectives-dict');
const italianVerbs = require('italian-verbs');
const italianVerbsDict = require('italian-verbs-dict');

// es_ES
const spanishWords = require('spanish-words');
const spanishVerbsWrapper = require('spanish-verbs-wrapper');
const spanishAdjectivesWrapper = require('spanish-adjectives-wrapper');

// en_US
const englishPluralsList = require('english-plurals-list');
const englishPlurals = require('english-plurals');

const NlgLib = require('./NlgLib.js').NlgLib;

exports.NlgLib = NlgLib;

/**
 * Name for detection
 */

exports.name = 'Pug';

/**
 * Pug runtime helpers.
 */

exports.runtime = runtime;

/**
 * Template function cache.
 */

exports.cache = {};

function applyPlugins(value, options, plugins, name) {
  return plugins.reduce(function (value, plugin) {
    return plugin[name] ? plugin[name](value, options) : value;
  }, value);
}

function findReplacementFunc(plugins, name) {
  const eligiblePlugins = plugins.filter(function (plugin) {
    return plugin[name];
  });

  if (eligiblePlugins.length > 1) {
    throw new Error('Two or more plugins all implement ' + name + ' method.');
  } else if (eligiblePlugins.length) {
    return eligiblePlugins[0][name].bind(eligiblePlugins[0]);
  }
  return null;
}

/**
 * Object for global custom filters.  Note that you can also just pass a `filters`
 * option to any other method.
 */
exports.filters = {};

function getLinguisticResources(options) {
  const res = {};

  // language must be set if there are resources to embed
  if ((options.verbs || options.word || options.adjectives) && !options.language) {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'language must be set at compile time when embedding resources';
    throw err;
  }

  if (options.verbs) {
    // console.log(`verbs to embed: ${options.verbs.join(' ')}`);
    res.verbs = {};
    switch (options.language) {
      case 'fr_FR': {
        options.verbs.forEach(function (verb) {
          res.verbs[verb] = frenchVerbs.getVerbInfo(frenchVerbsLefff, verb);
        });
        break;
      }
      case 'de_DE': {
        options.verbs.forEach(function (verb) {
          res.verbs[verb] = germanVerbs.getVerbInfo(germanVerbsDict, verb);
        });
        break;
      }
      case 'it_IT': {
        options.verbs.forEach(function (verb) {
          res.verbs[verb] = italianVerbs.getVerbInfo(italianVerbsDict, verb);
        });
        break;
      }
      case 'es_ES': {
        options.verbs.forEach(function (verb) {
          res.verbs[verb] = spanishVerbsWrapper.getVerbInfo(verb);
        });
        break;
      }
      default: {
        const err = new Error();
        err.name = 'InvalidArgumentException';
        err.message = `nothing to do with embedded verbs in ${options.language}`;
        throw err;
      }
    }
  }

  if (options.words) {
    // console.log(`words to embed: ${options.words.join(' ')}`);
    res.words = {};

    switch (options.language) {
      case 'fr_FR': {
        options.words.forEach(function (word) {
          res.words[word] = frenchWords.getWordInfo(frenchWordsGenderLefff, word);
        });
        break;
      }
      case 'it_IT': {
        options.words.forEach(function (word) {
          res.words[word] = italianWords.getWordInfo(italianWordsDict, word);
        });
        break;
      }
      case 'de_DE': {
        options.words.forEach(function (word) {
          res.words[word] = germanWords.getWordInfo(germanWordsDict, word);
        });
        break;
      }
      case 'es_ES': {
        options.words.forEach(function (word) {
          res.words[word] = spanishWords.getWordInfo(word);
        });
        break;
      }
      case 'en_US': {
        options.words.forEach(function (word) {
          res.words[word] = englishPlurals.getPlural(null, englishPluralsList, word);
        });
        break;
      }
      default:
        const err = new Error();
        err.name = 'InvalidArgumentException';
        err.message = `nothing to do with embedded words in ${options.language}`;
        throw err;
    }
  }

  if (options.adjectives) {
    // console.log(`adjs to embed: ${options.adjs.join(' ')}`);
    res.adjectives = {};
    switch (options.language) {
      case 'de_DE': {
        options.adjectives.forEach(function (adjective) {
          res.adjectives[adjective] = germanAdjectives.getAdjectiveInfo(germanAdjectivesDict, adjective);
        });
        break;
      }
      case 'it_IT': {
        options.adjectives.forEach(function (adjective) {
          res.adjectives[adjective] = italianAdjectives.getAdjectiveInfo(italianAdjectivesDict, adjective);
        });
        break;
      }
      case 'es_ES': {
        options.adjectives.forEach(function (adjective) {
          res.adjectives[adjective] = spanishAdjectivesWrapper.getAdjectiveInfo(adjective);
        });
        break;
      }
      case 'fr_FR': {
        options.adjectives.forEach(function (adjective) {
          // NB no need to give an custom list here
          res.adjectives[adjective] = frenchAdjectivesWrapper.getAdjectiveInfo(adjective, null);
        });
        break;
      }
      default: {
        const err = new Error();
        err.name = 'InvalidArgumentException';
        err.message = `nothing to do with embedded adjectives in ${options.language}`;
        throw err;
      }
    }
  }
  return res;
}

/**
 * Compile the given `str` of pug and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */

function compileBody(str, options) {
  // console.log(`compileBody options: ${options}`);

  // transform any param into packaged linguistic resources
  const linguisticResources = options.embedResources ? getLinguisticResources(options) : null;

  // console.log('I am in compileBody');
  // console.log('options.embedResources ? ' + options.embedResources);
  // console.log(`fetched resources: ${JSON.stringify(linguisticResources)}`);

  /*
  var coreBaseDir = path.dirname( require.resolve('rosaenlg') );
  if (options.basedir && options.basedir!=coreBaseDir) {
    let err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'basedir option cannot be used in RosaeNLG - sorry!';
    throw err;
  }
  options.basedir = coreBaseDir;
  */

  const debug_sources = {};
  debug_sources[options.filename] = str;
  const dependencies = [];
  const plugins = options.plugins || [];
  let ast = load.string(str, {
    staticFs: options.staticFs, // when no fs, graal or client
    filename: options.filename,
    basedir: options.basedir,
    yseop: options.yseop,
    lex: function (str, options) {
      const lexOptions = {};
      Object.keys(options).forEach(function (key) {
        lexOptions[key] = options[key];
      });
      lexOptions.plugins = plugins
        .filter(function (plugin) {
          return !!plugin.lex;
        })
        .map(function (plugin) {
          return plugin.lex;
        });
      return applyPlugins(lex(str, lexOptions), options, plugins, 'postLex');
    },
    parse: function (tokens, options) {
      tokens = tokens.map(function (token) {
        if (token.type === 'path' && path.extname(token.val) === '') {
          return {
            type: 'path',
            loc: token.loc,
            val: token.val + '.pug', // here is the default filename added
          };
        }
        return token;
      });
      tokens = stripComments(tokens, options);
      tokens = applyPlugins(tokens, options, plugins, 'preParse');
      const parseOptions = {};
      Object.keys(options).forEach(function (key) {
        parseOptions[key] = options[key];
      });
      parseOptions.plugins = plugins
        .filter(function (plugin) {
          return !!plugin.parse;
        })
        .map(function (plugin) {
          return plugin.parse;
        });

      return applyPlugins(
        applyPlugins(parse(tokens, parseOptions), options, plugins, 'postParse'),
        options,
        plugins,
        'preLoad',
      );
    },
    resolve: function (filename, source, loadOptions) {
      const replacementFunc = findReplacementFunc(plugins, 'resolve');
      if (replacementFunc) {
        return replacementFunc(filename, source, options);
      }

      return load.resolve(filename, source, loadOptions);
    },
    read: function (filename, loadOptions) {
      dependencies.push(filename);

      let contents;

      const replacementFunc = findReplacementFunc(plugins, 'read');
      if (replacementFunc) {
        contents = replacementFunc(filename, options);
      } else {
        contents = load.read(filename, loadOptions);
      }

      const str = applyPlugins(contents, { filename: filename }, plugins, 'preLex');
      debug_sources[filename] = str;
      return str;
    },
  });
  ast = applyPlugins(ast, options, plugins, 'postLoad');
  ast = applyPlugins(ast, options, plugins, 'preFilters');

  const filtersSet = {};
  Object.keys(exports.filters).forEach(function (key) {
    filtersSet[key] = exports.filters[key];
  });
  if (options.filters) {
    Object.keys(options.filters).forEach(function (key) {
      filtersSet[key] = options.filters[key];
    });
  }
  // ast = filters.handleFilters(ast, filtersSet, options.filterOptions, options.filterAliases);

  ast = applyPlugins(ast, options, plugins, 'postFilters');
  ast = applyPlugins(ast, options, plugins, 'preLink');
  ast = link(ast);
  ast = applyPlugins(ast, options, plugins, 'postLink');

  // Compile
  ast = applyPlugins(ast, options, plugins, 'preCodeGen');

  if (options.yseop) {
    const yseopCode = generateYseopCode(ast, {
      pretty: options.pretty,
      compileDebug: options.compileDebug,
      doctype: options.doctype,
      inlineRuntimeFunctions: options.inlineRuntimeFunctions,
      globals: options.globals,
      self: options.self,
      includeSources: options.includeSources ? debug_sources : false,
      templateName: options.templateName,
      yseop: true,
      language: options.language, // yseop only
    });

    return yseopCode;
  } else {
    let js = generateCode(ast, {
      pretty: options.pretty,
      compileDebug: options.compileDebug,
      doctype: options.doctype,
      inlineRuntimeFunctions: options.inlineRuntimeFunctions,
      globals: options.globals,
      self: options.self,
      includeSources: options.includeSources ? debug_sources : false,
      yseop: false,
      templateName: options.templateName,

      linguisticResources: linguisticResources,
      embedResources: options.embedResources,
      language: options.language, // language required when compiling for browser rendering

      mainpug: options.mainpug,

      forSide: options.forSide,
    });
    js = applyPlugins(js, options, plugins, 'postCodeGen');

    // Debug compiler
    if (options.debug) {
      console.error('\nCompiled Function:\n\n\u001b[90m%s\u001b[0m', js.replace(/^/gm, '  '));
    }
    return { body: js, dependencies: dependencies };
  }
}

function readFileVirtualized(filename, options) {
  if (options.staticFs) {
    // we are running in an env without fs: client or Graal thus we try to read from "includes" option
    const str =
      options.staticFs[filename] ||
      options.staticFs[filename.replace(/\//g, '\\')] ||
      options.staticFs[filename.replace(/\\/g, '/')];
    if (!str) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `readFileVirtualized: using file content from staticFs opt but cannot be found for ${filename}`;
      throw err;
    }
    return str;
  } else {
    return fs.readFileSync(filename, 'utf8');
  }
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `str` is not set, the file specified in `options.filename` will be read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @param {Object} options
 * @param {String=} str
 * @return {Function}
 * @api private
 */
function handleTemplateCache(options, str) {
  if (!options.yseop) {
    // NlgLib init
    const nlgLib = new NlgLib(options);
    options.util = nlgLib;
  }

  const key = options.filename;
  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  } else {
    if (str === undefined) {
      str = readFileVirtualized(options.filename, options);
    }

    const templ = exports.compile(str, options);
    //console.log(templ.toString());
    if (options.cache) exports.cache[key] = templ;
    return templ;
  }
}

/**
 * Compile a `Function` representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function (str, options) {
  var options = options || {};

  str = String(str);

  if (options.yseop) {
    options.compileDebug = false;
  }

  const parsed = compileBody(str, {
    staticFs: options.staticFs,
    compileDebug: options.compileDebug !== false,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug === true,
    debug: options.debug,
    templateName: 'template',
    filters: options.filters,
    filterOptions: options.filterOptions,
    filterAliases: options.filterAliases,
    plugins: options.plugins,
    yseop: options.yseop,
    language: options.language, // when generating templates for yseop only

    mainpug: options.mainpug, // when generating main.pug
    forSide: 'server',
  });

  if (options.yseop) {
    options.fs = require('fs'); // do not put '= fs' directly otherwise brfs will fail
    const code = `
      var mixins = ${JSON.stringify(parsed)};
      if (options.string===true) {
        var res = '';
        for (var name in mixins) {
          res += mixins[name] + '\\n\\n';
        }
        return res;
      } else if (options.yseopPath && options.yseopPath!='') {
        if (!options.fs) {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'must provide a link to fs in options';
          throw err;
        } else {
          var fs = options.fs;
          if (fs.existsSync(options.yseopPath)) {

            for (var name in mixins) {
              fs.writeFileSync(options.yseopPath + '/' + name + '.ytextfunction', mixins[name], {encoding:'utf-8'});
              
            }
    
          } else {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = options.yseopPath + ' is not a valid path';
            throw err;
          }
        }
      }

    `;

    return new Function('options', code);
  } else {
    const res = options.inlineRuntimeFunctions
      ? new Function('', parsed.body + ';return template;')()
      : runtimeWrap(parsed.body);

    res.dependencies = parsed.dependencies;

    return res;
  }
};

/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *   - `module` when it is explicitly `true`, the source code include export module syntax
 *
 * @param {String} str
 * @param {Options} options
 * @return {Object}
 * @api public
 */

exports.compileClientWithDependenciesTracked = function (str, options) {
  var options = options || {};

  str = String(str);
  const parsed = compileBody(str, {
    staticFs: options.staticFs,
    compileDebug: options.compileDebug,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions !== false,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug,
    debug: options.debug,
    templateName: options.name || 'template',
    filters: options.filters,
    filterOptions: options.filterOptions,
    filterAliases: options.filterAliases,
    plugins: options.plugins,

    // linguistic resources which can be integrated in the compiled template
    verbs: options.verbs,
    words: options.words,
    adjectives: options.adjectives,

    embedResources: options.embedResources,

    // when embedding resources language is provided; is not used if no embedded resources
    language: options.language,

    // when build main.pug
    mainpug: options.mainpug,

    forSide: 'client',
  });

  let body = parsed.body;

  if (options.module) {
    if (options.inlineRuntimeFunctions === false) {
      body = 'var pug = require("pug-runtime");' + body;
    }
    body += ' module.exports = ' + (options.name || 'template') + ';';
  }

  return { body: body, dependencies: parsed.dependencies };
};

/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */
exports.compileClient = function (str, options) {
  return exports.compileClientWithDependenciesTracked(str, options).body;
};

/**
 * Compile a `Function` representation of the given pug file.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */
exports.compileFile = function (path, options) {
  options = options || {};
  options.filename = path;
  return handleTemplateCache(options);
};

/**
 * Render the given `str` of pug.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

exports.render = function (str, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === 'function') {
    let res;
    try {
      res = exports.render(str, options);
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  // cache requires .filename
  if (options.cache && !options.filename) {
    throw new Error('the "filename" option is required for caching');
  }

  return handleTemplateCache(options, str)(options);
};

/**
 * Render a Pug file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

exports.renderFile = function (path, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === 'function') {
    let res;
    try {
      res = exports.renderFile(path, options);
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  options.filename = path;

  return handleTemplateCache(options)(options);
};

exports.getRosaeNlgVersion = function () {
  return 'PLACEHOLDER_ROSAENLG_VERSION'; // will be replaced by gulp when copied into dist/
};

/**
 * Compile a Pug file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */

exports.compileFileClient = function (path, options) {
  const key = path + ':client';
  options = options || {};

  options.filename = path;

  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  }

  const str = readFileVirtualized(options.filename, options);

  const out = exports.compileClient(str, options);
  if (options.cache) exports.cache[key] = out;
  return out;
};

/**
 * Express support.
 */

exports.__express = function (path, options, fn) {
  if (options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
    options.compileDebug = false;
  }
  exports.renderFile(path, options, fn);
};
