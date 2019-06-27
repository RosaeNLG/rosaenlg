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

var fs = require('fs');
var path = require('path');
var lex = require('@freenlg/freenlg-pug-lexer');
var stripComments = require('pug-strip-comments');
var parse = require('@freenlg/freenlg-pug-parser');
var load = require('@freenlg/freenlg-pug-load');
var filters = require('@freenlg/freenlg-pug-filters');
var link = require('@freenlg/freenlg-pug-linker');
var generateCode = require('@freenlg/freenlg-pug-code-gen');
var generateYseopCode = require('@freenlg/freenlg-yseop');
var runtime = require('pug-runtime');
var runtimeWrap = require('pug-runtime/wrap');

var frenchVerbs = require('@freenlg/french-verbs');
var frenchWordsGender = require('@freenlg/french-words-gender');
var germanWords = require('@freenlg/german-words');
var germanVerbs = require('@freenlg/german-verbs');
var germanAdjectives = require('@freenlg/german-adjectives');
var italianWords = require('@freenlg/italian-words');
var italianAdjectives = require('@freenlg/italian-adjectives');

var NlgLib = require('./NlgLib.js').NlgLib;

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
  return plugins.reduce(function(value, plugin) {
    return plugin[name] ? plugin[name](value, options) : value;
  }, value);
}

function findReplacementFunc(plugins, name) {
  var eligiblePlugins = plugins.filter(function(plugin) {
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
  let res = {};

  // language must be set if there are resources to embed
  if ((options.verbs || options.word || options.adjectives) && !options.language) {
    let err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'language must be set at compile time when embedding resources';
    throw err;
  }

  if (options.verbs) {
    // console.log(`verbs to embed: ${options.verbs.join(' ')}`);
    res.verbs = {};
    switch (options.language) {
      case 'fr_FR': {
        options.verbs.forEach(function(verb) {
          res.verbs[verb] = frenchVerbs.getVerbInfo(verb);
        });
        break;
      }
      case 'de_DE': {
        options.verbs.forEach(function(verb) {
          res.verbs[verb] = germanVerbs.getVerbInfo(verb);
        });
        break;
      }
      default: {
        let err = new Error();
        err.name = 'InvalidArgumentException';
        err.message = `nothing to do with embedded verbs in ${options.language}`;
        throw err;
      }
    }
  }

  if (options.words) {
    // console.log(`verbs to embed: ${options.verbs.join(' ')}`);
    res.words = {};

    switch (options.language) {
      case 'fr_FR': {
        options.words.forEach(function(word) {
          res.words[word] = frenchWordsGender.getGenderFrenchWord(word, null);
        });
        break;
      }
      case 'it_IT': {
        options.words.forEach(function(word) {
          res.words[word] = italianWords.getWordInfo(word, null);
        });
        break;
      }
      case 'de_DE': {
        options.words.forEach(function(word) {
          res.words[word] = germanWords.getWordInfo(word, null);
        });
        break;
      }
      default:
        let err = new Error();
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
        options.adjectives.forEach(function(adjective) {
          res.adjectives[adjective] = germanAdjectives.getAdjectiveInfo(adjective);
        });
        break;
      }
      case 'it_IT': {
        options.adjectives.forEach(function(adjective) {
          res.adjectives[adjective] = italianAdjectives.getAdjectiveInfo(adjective);
        });
        break;
      }
      default: {
        let err = new Error();
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
  let linguisticResources = options.embedResources ? getLinguisticResources(options) : null;

  // console.log(`fetched resources: ${JSON.stringify(linguisticResources)}`);

  /*
  var coreBaseDir = path.dirname( require.resolve('freenlg') );
  if (options.basedir && options.basedir!=coreBaseDir) {
    let err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = 'basedir option cannot be used in FreeNLG - sorry!';
    throw err;
  }
  options.basedir = coreBaseDir;
  */

  var debug_sources = {};
  debug_sources[options.filename] = str;
  var dependencies = [];
  var plugins = options.plugins || [];
  var ast = load.string(str, {
    filename: options.filename,
    basedir: options.basedir,
    yseop: options.yseop,
    lex: function(str, options) {
      var lexOptions = {};
      Object.keys(options).forEach(function(key) {
        lexOptions[key] = options[key];
      });
      lexOptions.plugins = plugins
        .filter(function(plugin) {
          return !!plugin.lex;
        })
        .map(function(plugin) {
          return plugin.lex;
        });
      return applyPlugins(lex(str, lexOptions), options, plugins, 'postLex');
    },
    parse: function(tokens, options) {
      tokens = tokens.map(function(token) {
        if (token.type === 'path' && path.extname(token.val) === '') {
          return {
            type: 'path',
            loc: token.loc,
            val: token.val + '.pug',
          };
        }
        return token;
      });
      tokens = stripComments(tokens, options);
      tokens = applyPlugins(tokens, options, plugins, 'preParse');
      var parseOptions = {};
      Object.keys(options).forEach(function(key) {
        parseOptions[key] = options[key];
      });
      parseOptions.plugins = plugins
        .filter(function(plugin) {
          return !!plugin.parse;
        })
        .map(function(plugin) {
          return plugin.parse;
        });

      return applyPlugins(
        applyPlugins(parse(tokens, parseOptions), options, plugins, 'postParse'),
        options,
        plugins,
        'preLoad',
      );
    },
    resolve: function(filename, source, loadOptions) {
      var replacementFunc = findReplacementFunc(plugins, 'resolve');
      if (replacementFunc) {
        return replacementFunc(filename, source, options);
      }

      return load.resolve(filename, source, loadOptions);
    },
    read: function(filename, loadOptions) {
      dependencies.push(filename);

      var contents;

      var replacementFunc = findReplacementFunc(plugins, 'read');
      if (replacementFunc) {
        contents = replacementFunc(filename, options);
      } else {
        contents = load.read(filename, loadOptions);
      }

      var str = applyPlugins(contents, { filename: filename }, plugins, 'preLex');
      debug_sources[filename] = str;
      return str;
    },
  });
  ast = applyPlugins(ast, options, plugins, 'postLoad');
  ast = applyPlugins(ast, options, plugins, 'preFilters');

  var filtersSet = {};
  Object.keys(exports.filters).forEach(function(key) {
    filtersSet[key] = exports.filters[key];
  });
  if (options.filters) {
    Object.keys(options.filters).forEach(function(key) {
      filtersSet[key] = options.filters[key];
    });
  }
  ast = filters.handleFilters(ast, filtersSet, options.filterOptions, options.filterAliases);

  ast = applyPlugins(ast, options, plugins, 'postFilters');
  ast = applyPlugins(ast, options, plugins, 'preLink');
  ast = link(ast);
  ast = applyPlugins(ast, options, plugins, 'postLink');

  // Compile
  ast = applyPlugins(ast, options, plugins, 'preCodeGen');

  if (options.yseop == true) {
    var yseopCode = generateYseopCode(ast, {
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
    var js = generateCode(ast, {
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
    let nlgLib = new NlgLib(options);
    options.util = nlgLib;
  }

  var key = options.filename;
  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  } else {
    if (str === undefined) {
      str = fs.readFileSync(options.filename, 'utf8');
    }

    var templ = exports.compile(str, options);
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

exports.compile = function(str, options) {
  var options = options || {};

  str = String(str);

  if (options.yseop) {
    options.compileDebug = false;
  }

  var parsed = compileBody(str, {
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
      if (options.string==true) {
        var res = '';
        for (var name in mixins) {
          res += mixins[name] + '\\n\\n';
        }
        return res;
      } else if (options.yseopPath!=null && options.yseopPath!='') {
        if (options.fs == null) {
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
    var res = options.inlineRuntimeFunctions
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

exports.compileClientWithDependenciesTracked = function(str, options) {
  var options = options || {};

  str = String(str);
  var parsed = compileBody(str, {
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

  var body = parsed.body;

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
exports.compileClient = function(str, options) {
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
exports.compileFile = function(path, options) {
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

exports.render = function(str, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === 'function') {
    var res;
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

exports.renderFile = function(path, options, fn) {
  // support callback API
  if ('function' == typeof options) {
    (fn = options), (options = undefined);
  }
  if (typeof fn === 'function') {
    var res;
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

/**
 * Compile a Pug file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */

exports.compileFileClient = function(path, options) {
  var key = path + ':client';
  options = options || {};

  options.filename = path;

  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  }

  var str = fs.readFileSync(options.filename, 'utf8');
  var out = exports.compileClient(str, options);
  if (options.cache) exports.cache[key] = out;
  return out;
};

/**
 * Express support.
 */

exports.__express = function(path, options, fn) {
  if (options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
    options.compileDebug = false;
  }
  exports.renderFile(path, options, fn);
};
