#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const rosaenlg = require('rosaenlg');
const gulpRosaenlg = require('gulp-rosaenlg');

const basename = path.basename;
const dirname = path.dirname;
const resolve = path.resolve;
const normalize = path.normalize;
const relative = path.relative;

// Pug options

// hum those are all global variables
let options = {};
let consoleLog;
let render; // function for rendering
const watchList = {};

/*
  renderFile -> watchFile
  tryRender -> renderFile
  watchFile -> tryRender
*/

/**
 * Convert error to string
 */
function errorToString(e) {
  return e.stack || /* istanbul ignore next */ e.message || e;
}

/**
 * Generate a JSON package
 */
function generateJsonPackage() {
  console.log('generating a json package...');

  if (!options.packageopts) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `-po --packageopts is mandatory when using -jsonp --jsonpackage`;
    throw err;
  }
  const packageopts = JSON.parse(fs.readFileSync(path.resolve(options.packageopts)), 'utf8');
  // console.log(packageopts);
  const packagedTemplate = gulpRosaenlg.packageTemplateJson(packageopts);
  // console.log(packagedTemplate);
  const output = JSON.stringify(packagedTemplate);

  // console.log(program.out);
  if (program.out) {
    fs.writeFileSync(program.out, output, 'utf8');
  } else {
    process.stdout.write(output);
  }
}

/**
 * Compile from stdin.
 */

function stdin() {
  //console.log('IN STDIN');
  //console.log(options);

  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {
    buf += chunk;
  });
  process.stdin
    .on('end', function() {
      let output;
      if (options.client) {
        output = rosaenlg.compileClient(buf, options);
      } else {
        output = rosaenlg.render(buf, options);
      }
      process.stdout.write(output);
    })
    .resume();
}

/**
 * Get a sensible name for a template function from a file path
 *
 * @param {String} filename
 * @returns {String}
 */
function getNameFromFileName(filename) {
  const file = basename(filename).replace(/\.(?:pug|jade)$/, '');
  return (
    file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function(_, character) {
      return character.toUpperCase();
    }) + 'Template'
  );
}

/**
 * Process the given path, compiling the pug files found.
 * Always walk the subdirectories.
 *
 * @param path      path of the file, might be relative
 * @param rootPath  path relative to the directory specified in the command
 */

function renderFile(path, rootPath) {
  //console.log('IN RENDER FILE');
  //console.log(options);

  if (options.yseop) {
    if (!options.string) {
      // either string, or provide a path
      options.yseopPath = program.out;
    }
  }

  const isPug = /\.(?:pug|jade)$/;
  const isIgnored = /([\/\\]_)|(^_)/;

  const stat = fs.lstatSync(path);
  // Found pug file
  if (stat.isFile() && isPug.test(path) && !isIgnored.test(path)) {
    // Try to watch the file if needed. watchFile takes care of duplicates.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (program.watch) watchFile(path, null, rootPath);
    if (program.nameAfterFile) {
      // Ludan: seems to be defined nowhere
      options.name = getNameFromFileName(path);
    }
    const fn = options.client ? rosaenlg.compileFileClient(path, options) : rosaenlg.compileFile(path, options);
    if (program.watch && fn.dependencies) {
      // watch dependencies, and recompile the base
      fn.dependencies.forEach(function(dep) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        watchFile(dep, path, rootPath);
      });
    }

    // --extension
    let extname;
    if (program.extension) extname = '.' + program.extension;
    else if (options.client) extname = '.js';
    else if (options.yseop) extname = '.txt';
    else if (program.extension === '') extname = '';
    else extname = '.html';

    // path: foo.pug -> foo.<ext>
    path = path.replace(isPug, extname);

    if (program.out) {
      // prepend output directory
      if (rootPath) {
        // replace the rootPath of the resolved path with output directory
        path = relative(rootPath, path);
      } else {
        // if no rootPath handling is needed
        path = basename(path);
      }
      path = resolve(program.out, path);
    }
    const dir = resolve(dirname(path));
    mkdirp.sync(dir);

    const output = options.client ? fn : fn(options);
    // yseop + path => not using this write
    if (!options.yseop || options.string) {
      if (program.out) {
        // explicitly indicated a file
        fs.writeFileSync(path, output);
        consoleLog('  ' + chalk.gray('rendered') + ' ' + chalk.cyan('%s'), normalize(path));
      } else {
        // stdout
        process.stdout.write(output);
      }
    }
    // Found directory
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(path);
    files
      .map(function(filename) {
        return path + '/' + filename;
      })
      .forEach(function(file) {
        render(file, rootPath || path);
      });
  }
}

/**
 * Try to render `path`; if an exception is thrown it is printed to stderr and
 * otherwise ignored.
 *
 * This is used in watch mode.
 */
function tryRender(path, rootPath) {
  try {
    renderFile(path, rootPath);
  } catch (e) {
    // keep watching when error occured.
    console.error(errorToString(e) + '\x07');
  }
}

/**
 * Watch for changes on path
 *
 * Renders `base` if specified, otherwise renders `path`.
 */
function watchFile(path, base, rootPath) {
  path = normalize(path);

  let log = '  ' + chalk.gray('watching') + ' ' + chalk.cyan(path);
  if (!base) {
    base = path;
  } else {
    base = normalize(base);
    log += '\n    ' + chalk.gray('as a dependency of') + ' ';
    log += chalk.cyan(base);
  }

  if (watchList[path]) {
    if (watchList[path].indexOf(base) !== -1) return;
    consoleLog(log);
    watchList[path].push(base);
    return;
  }

  consoleLog(log);
  watchList[path] = [base];
  fs.watchFile(path, { persistent: true, interval: 200 }, function(curr, prev) {
    // File doesn't exist anymore. Keep watching.
    if (curr.mtime.getTime() === 0) return;
    // istanbul ignore if
    if (curr.mtime.getTime() === prev.mtime.getTime()) return;
    watchList[path].forEach(function(file) {
      tryRender(file, rootPath);
    });
  });
}

/**
 * Watch for changes on path
 *
 * Renders `base` if specified, otherwise renders `path`.
 */
function watchFile(path, base, rootPath) {
  path = normalize(path);

  let log = '  ' + chalk.gray('watching') + ' ' + chalk.cyan(path);
  if (!base) {
    base = path;
  } else {
    base = normalize(base);
    log += '\n    ' + chalk.gray('as a dependency of') + ' ';
    log += chalk.cyan(base);
  }

  if (watchList[path]) {
    if (watchList[path].indexOf(base) !== -1) return;
    consoleLog(log);
    watchList[path].push(base);
    return;
  }

  consoleLog(log);
  watchList[path] = [base];
  fs.watchFile(path, { persistent: true, interval: 200 }, function(curr, prev) {
    // File doesn't exist anymore. Keep watching.
    if (curr.mtime.getTime() === 0) return;
    // istanbul ignore if
    if (curr.mtime.getTime() === prev.mtime.getTime()) return;
    watchList[path].forEach(function(file) {
      tryRender(file, rootPath);
    });
  });
}

/**
 * Parse object either in `input` or in the file called `input`. The latter is
 * searched first.
 */
function parseObj(input) {
  try {
    return require(path.resolve(input));
  } catch (e) {
    let str;
    try {
      str = fs.readFileSync(program.obj, 'utf8');
    } catch (e) {
      str = program.obj;
    }
    try {
      return JSON.parse(str);
    } catch (e) {
      return eval('(' + str + ')');
    }
  }
}

function processCommandLine() {
  program
    .version(
      'rosaenlg version: ' +
        require('rosaenlg/package.json').version +
        '\n' +
        'rosaenlg-cli version: ' +
        require('./package.json').version,
    )
    .usage('[options] [dir|file ...]')
    .option('-l, --lang <str>', 'language: en_US, fr_FR or de_DE - mandatory (unless --jsonpackage)')
    .option('-jsonp, --jsonpackage', 'to package templates in a JSON file (defaults false)')
    .option('-po, --packageopts <str>', 'package templates options (when using --jsonpackage), always in a JSON file')
    .option('-y, --yseop', 'to generate Yseop templates instead of rendering texts (defaults false)')
    .option(
      '-s, --yseopstring',
      'when yseop is true, output a long string instead of generating template files (for debug)',
    )
    .option('-O, --obj <str|path>', 'JSON/JavaScript options object or file')
    .option('-o, --out <dir>', 'output the rendered HTML or compiled JavaScript to <dir>')
    .option('-p, --path <path>', 'filename used to resolve includes')
    .option('-b, --basedir <path>', 'path used as root directory to resolve absolute includes')
    .option('-P, --pretty', 'compile pretty HTML output (NB do not use it)')
    .option('-c, --client', 'compile function for client-side')
    .option('-n, --name <str>', 'the name of the compiled template (requires --client)')
    .option('-D, --no-debug', 'compile without debugging (smaller functions)')
    .option('-w, --watch', 'watch files for changes and automatically re-render')
    .option('-E, --extension <ext>', 'specify the output file extension')
    .option('-s, --silent', 'do not output logs')
    .option(
      '--name-after-file',
      'name the template after the last section of the file path (requires --client and overriden by --name)',
    )
    .option(
      '--doctype <str>',
      'specify the doctype on the command line (useful if it is not specified by the template)',
    );

  program.on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    # Generate html with data included in the template:');
    console.log(`    $ rosaenlg -l en_US fruits.pug`);
    console.log('');
    console.log('    # Generate html with data included in the options:');
    console.log(`    $ rosaenlg -l en_US -O '{"data": ["apples", "bananas", "apricots", "pears"]}' fruits_nodata.pug`);
    console.log('');
    console.log('    # Generate a js function file for browser rendering:');
    console.log(`    $ rosaenlg -l en_US fruits.pug --client --name fruits`);
    console.log('');
    console.log('    # Generate Yseop templates:');
    console.log(`    $ rosaenlg -l en_US -y fruits.pug -o outputDir`);
    console.log('');
    console.log('    # Render all files in the `templates` directory:');
    console.log('    $ rosaenlg templates');
    console.log('');
    console.log('    # Create {foo,bar}.html:');
    console.log('    $ rosaenlg {foo,bar}.pug');
    console.log('');
    console.log('    # Using `pug` over standard input and output streams');
    console.log('    $ rosaenlg < my.pug > my.html');
    console.log("    $ echo 'h1 Pug!' | pug");
    console.log('');
    console.log('    # Render all files in `foo` and `bar` directories to `/tmp`:');
    console.log('    $ rosaenlg foo bar --out /tmp');
    console.log('');
    console.log('    # Specify options through a string:');
    console.log('    $ rosaenlg -O \'{"doctype": "html"}\' foo.pug');
    console.log('    # or, using JavaScript instead of JSON');
    console.log('    $ rosaenlg -O "{doctype: \'html\'}" foo.pug');
    console.log('');
    console.log('    # Specify options through a file:');
    console.log('    $ echo "exports.doctype = \'html\';" > options.js');
    console.log('    $ rosaenlg -O options.js foo.pug');
    console.log('    # or, JSON works too');
    console.log('    $ echo \'{"doctype": "html"}\' > options.json');
    console.log('    $ rosaenlg -O options.json foo.pug');
    console.log('');
  });

  program.parse(process.argv);

  // options given, parse them
  if (program.obj) {
    options = parseObj(program.obj);
  }

  [
    ['path', 'filename'], // --path
    ['debug', 'compileDebug'], // --no-debug
    ['client', 'client'], // --client
    ['pretty', 'pretty'], // --pretty
    ['basedir', 'basedir'], // --basedir
    ['doctype', 'doctype'], // --doctype
    ['lang', 'language'], // --lang
    ['yseop', 'yseop'],
    ['yseopstring', 'string'], // --yseop-string
    ['jsonpackage', 'jsonpackage'],
    ['packageopts', 'packageopts'],
  ].forEach(function(o) {
    options[o[1]] = program[o[0]] !== undefined ? program[o[0]] : options[o[1]];
  });

  // --name

  if (typeof program.name === 'string') {
    options.name = program.name;
  }

  // --silent

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  consoleLog = program.silent ? function() {} : console.log;

  // left-over args are file paths

  const files = program.args;

  // object of reverse dependencies of a watched file, including itself if
  // applicable

  // function for rendering
  render = program.watch ? tryRender : renderFile;

  // language
  if (!options.language && !options.jsonpackage) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `-l --lang is mandatory en_US fr_FR de_DE it_IT or OTHER`;
    throw err;
  }

  // compile files
  if (files.length) {
    // files are given in the command at the end

    consoleLog();
    if (program.watch) {
      process.on('SIGINT', function() {
        process.exit(1);
      });
    }
    files.forEach(function(file) {
      render(file);
    });
    // stdio
  } else if (options.jsonpackage) {
    generateJsonPackage();
  } else {
    // no files are given => reading in stding
    stdin();
  }
}

// triggers all
processCommandLine();
