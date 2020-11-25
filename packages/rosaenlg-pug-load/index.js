/**
 * @license
 * Copyright 2018, Ludan Stoecklé, (c) 2015 Forbes Lindesay
 * SPDX-License-Identifier: MIT
 */


'use strict';

const fs = require('fs');
const path = require('path');
const walk = require('rosaenlg-pug-walk');
const assign = require('object-assign');

module.exports = load;
function load(ast, options) {
  options = getOptions(options);
  // clone the ast
  ast = JSON.parse(JSON.stringify(ast));
  return walk(ast, function (node) {
    if (node.str === undefined) {
      if (
        node.type === 'Include' ||
        node.type === 'RawInclude' ||
        node.type === 'JsInclude' ||
        node.type === 'Extends'
      ) {
        const file = node.file;
        if (file.type !== 'FileReference') {
          throw new Error('Expected file.type to be "FileReference"');
        }
        let path, str;
        try {
          path = options.resolve(file.path, file.filename, options);
          file.fullPath = path;
          str = options.read(path, options);
        } catch (ex) {
          ex.message += '\n    at ' + node.filename + ' line ' + node.line;
          throw ex;
        }

        if (node.type === 'JsInclude') {
          // making as if it was a big .pug file starting with '- ...'
          str =
            '-\n' +
            str
              .split(/\r?\n/)
              .map((l) => '  ' + l)
              .join('\n');
          // changing type. hum is that clean?
          node.type = 'Include';
        }

        file.str = str;

        if (node.type === 'Extends' || node.type === 'Include') {
          file.ast = load.string(
            str,
            assign({}, options, {
              filename: path,
            }),
          );
        }
      }
    }
  });
}

load.string = function loadString(src, options) {
  options = assign(getOptions(options), {
    src: src,
  });
  const tokens = options.lex(src, options);
  const ast = options.parse(tokens, options);
  return load(ast, options);
};
load.file = function loadFile(filename, options) {
  options = assign(getOptions(options), {
    filename: filename,
  });
  const str = options.read(filename);
  return load.string(str, options);
};

load.resolve = function resolve(filename, source, options) {
  filename = filename.trim();
  if (filename[0] !== '/' && !source)
    throw new Error('the "filename" option is required to use includes and extends with "relative" paths');

  if (filename[0] === '/' && !options.basedir)
    throw new Error('the "basedir" option is required to use includes and extends with "absolute" paths');

  filename = path.join(filename[0] === '/' ? options.basedir : path.dirname(source.trim()), filename);

  return filename;
};
load.read = function read(filename, options) {
  if (options.staticFs) {
    // we are running in an env without fs: client or Graal thus we try to read from "includes" option
    /*
      there can be both Linux or Windows paths, on both sides
      inc/inc => inc\inc or inc/inc
      inc\inc => inc\inc or inc/inc
    */
    const str =
      options.staticFs[filename] ||
      options.staticFs[filename.replace(/\//g, '\\')] ||
      options.staticFs[filename.replace(/\\/g, '/')];
    if (!str) {
      // console.log(`looking for <${filename}> in ${JSON.stringify(options.staticFs)}`);
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `rosaenlg-pug-load: using file content from staticFs opt but cannot be found for ${filename}`;
      throw err;
    }
    return str;
  } else {
    return fs.readFileSync(filename.replace(/\\/g, '/'), 'utf8');
  }
};

load.validateOptions = function validateOptions(options) {
  /* istanbul ignore if */
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  /* istanbul ignore if */
  if (typeof options.lex !== 'function') {
    throw new TypeError('options.lex must be a function');
  }
  /* istanbul ignore if */
  if (typeof options.parse !== 'function') {
    throw new TypeError('options.parse must be a function');
  }
  /* istanbul ignore if */
  if (options.resolve && typeof options.resolve !== 'function') {
    throw new TypeError('options.resolve must be a function');
  }
  /* istanbul ignore if */
  if (options.read && typeof options.read !== 'function') {
    throw new TypeError('options.read must be a function');
  }
};

function getOptions(options) {
  load.validateOptions(options);
  return assign(
    {
      resolve: load.resolve,
      read: load.read,
    },
    options,
  );
}
