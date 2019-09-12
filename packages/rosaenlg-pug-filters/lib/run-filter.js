'use strict';

const jstransformer = require('jstransformer');
//const uglify = require('uglify-js');
const CleanCSS = require('clean-css');
const resolve = require('resolve');

module.exports = filter;
function filter(name, str, options, currentDirectory, funcName) {
  funcName = funcName || 'render';
  let tr;
  try {
    try {
      tr = require(resolve.sync('jstransformer-' + name, { basedir: currentDirectory || process.cwd() }));
    } catch (ex) {
      tr = require('jstransformer-' + name);
    }
    tr = jstransformer(tr);
  } catch (ex) {}
  if (tr) {
    // TODO: we may want to add a way for people to separately specify "locals"
    let result = tr[funcName](str, options, options).body;
    if (options && options.minify) {
      try {
        switch (tr.outputFormat) {
          /*
          case 'js':
            result = uglify.minify(result, { fromString: true }).code;
            break;
          */
          case 'css':
            result = new CleanCSS().minify(result).styles;
            break;
        }
      } catch (ex) {
        // better to fail to minify than output nothing
      }
    }
    return result;
  } else {
    const err = new Error('unknown filter ":' + name + '"');
    err.code = 'UNKNOWN_FILTER';
    throw err;
  }
}
