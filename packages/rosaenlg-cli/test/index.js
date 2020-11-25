/**
 * @license
 * Copyright 2019 Ludan Stoecklé, 2015 Tiancheng "Timothy" Gu, 2013-2015 Forbes Lindesay, 2010-2014 TJ Holowaychuk
 * SPDX-License-Identifier: MIT
 */


'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const cp = require('child_process');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const NlgLib = require('rosaenlg').NlgLib;

// Sets directory to output coverage data to
// Incremented every time getRunner() is called.
let covCount = 1;
const isIstanbul = process.env.running_under_istanbul;

/*
 * I/O utilities for temporary directory.
 */
function j(paths) {
  return path.join(...paths);
}

function t(paths) {
  paths = Array.isArray(paths) ? paths : [paths];
  const args = [__dirname, 'temp'].concat(paths);
  return j(args);
}

function r(paths) {
  return fs.readFileSync(t(paths), 'utf8');
}

function rs(paths) {
  return fs.createReadStream(t(paths));
}

function w(paths, content) {
  return fs.writeFileSync(t(paths), content);
}

function a(paths, content) {
  return fs.appendFileSync(t(paths), content);
}

function u(paths) {
  return fs.unlinkSync(t(paths));
}

/**
 * Gets an array containing the routine to run the pug CLI. If this file is
 * being processed with istanbul then this function will return a routine
 * asking istanbul to store coverage data to a unique directory
 * (cov-pt<covCount>/).
 */
function getRunner() {
  const pugExe = j([__dirname, '..', 'index.js']);

  if (!isIstanbul) return [process.argv[0], [pugExe]];
  else {
    return [
      'istanbul',
      [
        'cover',
        '--print',
        'none',
        '--report',
        'none',
        '--root',
        process.cwd(),
        '--dir',
        process.cwd() + '/cov-pt' + covCount++,
        pugExe,
        '--',
      ],
    ];
  }
}

/*
 * Run Pug CLI.
 *
 * @param  args     Array of arguments
 * @param [stdin]   Stream of standard input
 * @param  callback Function to call when the process finishes
 */
function run(args, stdin, callback) {
  if (arguments.length === 2) {
    callback = stdin;
    stdin = null;
  }
  const runner = getRunner();
  const proc = cp.execFile(
    runner[0],
    runner[1].concat(args),
    {
      cwd: t([]),
    },
    callback,
  );
  if (stdin) stdin.pipe(proc.stdin);
}

/**
 * Set timing limits for a test case
 */
function timing(testCase) {
  if (isIstanbul) {
    testCase.timeout(25000);
    testCase.slow(3000);
  } else {
    testCase.timeout(15000);
    testCase.slow(2000);
  }
}

/*
 * Make temporary directories
 */
rimraf.sync(t([]));
mkdirp.sync(t(['_omittedDir']));
mkdirp.sync(t(['depwatch']));
mkdirp.sync(t(['inputs', 'level-1-1']));
mkdirp.sync(t(['inputs', 'level-1-2']));
mkdirp.sync(t(['inputs', 'with_inc']));
mkdirp.sync(t(['inputs/with_inc', 'folder']));
mkdirp.sync(t(['outputs', 'level-1-1']));
mkdirp.sync(t(['outputs', 'level-1-2']));

/*
 * CLI utilities
 */
describe('miscellanea', function () {
  timing(this);
  it('--version', function (done) {
    run(['-V'], function (err, stdout) {
      if (err) done(err);
      assert.strictEqual(
        stdout.trim(),
        'rosaenlg version: ' +
          require('rosaenlg/package.json').version +
          '\nrosaenlg-cli version: ' +
          require('../package.json').version,
      );
      run(['--version'], function (err, stdout) {
        if (err) done(err);
        assert.strictEqual(
          stdout.trim(),
          'rosaenlg version: ' +
            require('rosaenlg/package.json').version +
            '\nrosaenlg-cli version: ' +
            require('../package.json').version,
        );
        done();
      });
    });
  });
  it('--help', function (done) {
    // only check that it doesn't crash
    run(['-h'], function (err, stdout) {
      if (err) done(err);
      run(['--help'], function (err, stdout) {
        if (err) done(err);
        done();
      });
    });
  });
  it('Omits files starting with an underscore', function (done) {
    w('_omitted.pug', '.foo bar');
    w('_omitted.html', '<p>output not written</p>');

    run(['--lang=en_US', '_omitted.pug'], function (err) {
      if (err) return done(err);
      const html = r('_omitted.html');
      assert(html === '<p>output not written</p>');
      done();
    });
  });
  it('Omits directories starting with an underscore', function (done) {
    w('_omittedDir/file.pug', '.foo bar');
    w('_omittedDir/file.html', '<p>output not written</p>');

    run(['--lang=en_US', '--no-debug', '_omittedDir/file.pug'], function (err, stdout) {
      if (err) return done(err);
      const html = r('_omittedDir/file.html');
      assert.strictEqual(html, '<p>output not written</p>');
      done();
    });
  });
});

function writeInputPugWithDataInTemplate() {
  w(
    'input.pug',
    `
- var data = ['apples', 'bananas', 'apricots', 'pears'];
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
`,
  );
}

describe('HTML output', function () {
  timing(this);

  it('rosaenlg, stdout', function (done) {
    writeInputPugWithDataInTemplate();
    run(['--no-debug', '--lang=en_US', 'input.pug'], function (err, stdout) {
      if (err) done(err);
      assert.strictEqual(stdout.trim(), '<p>I love apples, bananas, apricots and pears!</p>');
      done();
    });
  });

  it('rosaenlg, data in the template', function (done) {
    writeInputPugWithDataInTemplate();
    w('input.html', '<p>output not written</p>');

    run(['--no-debug', '--lang=en_US', 'input.pug', '--out=./'], function (err) {
      if (err) return done(err);
      const html = r('input.html');
      assert(html === '<p>I love apples, bananas, apricots and pears!</p>', `html is: ${html}`);
      done();
    });
  });

  it('rosaenlg, data in the options', function (done) {
    w(
      'fruits.pug',
      `
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
`,
    );
    w('fruits.html', '<p>output not written</p>');

    run(
      [
        '--no-debug',
        '--lang=en_US',
        '--out=./',
        `--obj={"data": ["apples", "bananas", "apricots", "pears"]}`,
        'fruits.pug',
      ],
      function (err) {
        if (err) return done(err);
        const html = r('fruits.html');
        assert(html === '<p>I love apples, bananas, apricots and pears!</p>');
        done();
      },
    );
  });

  it('works', function (done) {
    w('input.pug', '.foo bar');
    w('input.html', '<p>output not written</p>');

    run(['--no-debug', '--out=./', '--lang=en_US', 'input.pug'], function (err) {
      if (err) return done(err);
      const html = r('input.html');
      assert(html === '<div class="foo">Bar</div>');
      done();
    });
  });
  it('--extension', function (done) {
    w('input.pug', '.foo bar');
    w('input.special-html', '<p>output not written</p>');

    run(['--no-debug', '--lang=en_US', '--out=./', '-E', 'special-html', 'input.pug'], function (err) {
      if (err) return done(err);
      const html = r('input.special-html');
      assert(html === '<div class="foo">Bar</div>');
      done();
    });
  });
  it('--basedir', function (done) {
    w('input.pug', 'extends /dependency1.pug');
    w('input.html', '<p>output not written</p>');
    run(['--no-debug', '--out=./', '--lang=en_US', '-b', j([__dirname, 'dependencies']), 'input.pug'], function (
      err,
      stdout,
    ) {
      if (err) return done(err);
      const html = r('input.html');
      assert.strictEqual(html, '<html><body></body></html>');
      done();
    });
  });
  context('--obj', function () {
    it('JavaScript syntax works', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out=./', '--lang=en_US', '--obj', "{'loc':'str'}", 'input.pug'], function (err) {
        if (err) return done(err);
        const html = r('input.html');
        assert(html === '<div class="foo">Str</div>');
        done();
      });
    });
    it('JavaScript syntax does not accept UTF newlines', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out=./', '--obj', "{'loc':'st\u2028r'}", 'input.pug'], function (err) {
        if (!err) return done(new Error('expecting error'));
        done();
      });
    });

    it('JSON syntax accept UTF newlines', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out=./', '--obj', '{"loc":"st\u2028r"}', '--lang', 'en_US', 'input.pug'], function (err) {
        if (err) return done(err);
        const html = r('input.html');
        assert.strictEqual(html, '<div class="foo">St\u2028r</div>');
        done();
      });
    });

    it('JSON file', function (done) {
      w('obj.json', '{"loc":"str"}');
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out=./', '--lang', 'en_US', '--obj', 'obj.json', 'input.pug'], function (err) {
        if (err) return done(err);
        const html = r('input.html');
        assert(html === '<div class="foo">Str</div>');
        done();
      });
    });
    it('JavaScript module', function (done) {
      w('obj.js', 'module.exports = {loc: "str"};');
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out=./', '--lang', 'en_US', '--obj', 'obj.js', 'input.pug'], function (err) {
        if (err) return done(err);
        const html = r('input.html');
        assert(html === '<div class="foo">Str</div>');
        done();
      });
    });
  });
  it('stdio', function (done) {
    w('input.pug', '.foo bar');
    run(['--no-debug', '--out=./', '--lang=en_US'], rs('input.pug'), function (err, stdout, stderr) {
      if (err) return done(err);
      assert(stdout === '<div class="foo">Bar</div>');
      done();
    });
  });
  context('--out', function () {
    it('works', function (done) {
      w('input.pug', '.foo bar');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--lang=en_US', '--out', 'outputs', 'input.pug'], function (err) {
        if (err) return done(err);
        const html = r(['outputs', 'input.html']);
        assert(html === '<div class="foo">Bar</div>');
        done();
      });
    });
    it('works when input is a directory', function (done) {
      w(['inputs', 'input.pug'], '.foo bar 1');
      w(['inputs', 'level-1-1', 'input.pug'], '.foo bar 1-1');
      w(['inputs', 'level-1-2', 'input.pug'], '.foo bar 1-2');
      w(['outputs', 'input.html'], 'BIG FAT HEN 1');
      w(['outputs', 'level-1-1', 'input.html'], 'BIG FAT HEN 1-1');
      w(['outputs', 'level-1-2', 'input.html'], 'BIG FAT HEN 1-2');

      run(['--no-debug', '--lang=en_US', '--out', 'outputs', 'inputs'], function (err) {
        if (err) return done(err);
        let html = r(['outputs', 'input.html']);
        assert(html === '<div class="foo">Bar 1</div>');
        html = r(['outputs', 'level-1-1', 'input.html']);
        assert(html === '<div class="foo">Bar 1-1</div>');
        html = r(['outputs', 'level-1-2', 'input.html']);
        assert(html === '<div class="foo">Bar 1-2</div>');
        done();
      });
    });
  });
  it('--silent', function (done) {
    w('input.pug', '.foo bar');
    w('input.html', '<p>output not written</p>');
    run(['--no-debug', '--out=./', '--lang', 'en_US', '--silent', 'input.pug'], function (err, stdout) {
      if (err) return done(err);
      const html = r('input.html');
      assert.strictEqual(html, '<div class="foo">Bar</div>');
      assert.strictEqual(stdout, '');
      done();
    });
  });
});

describe('client JavaScript output', function () {
  timing(this);

  it('(works) rosaenlg, js files for browser rendering', function (done) {
    w(
      'input.pug',
      `
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
`,
    );
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--out=./', '--client', '--lang=en_US', 'input.pug'], function (err) {
      if (err) return done(err);
      const compiledFct = new Function('params', `${r('input.js')}; return template(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
        data: ['apples', 'bananas', 'apricots', 'pears'],
      });
      assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
      done();
    });
  });

  it('--name', function (done) {
    w(
      'input.pug',
      `
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
    `,
    );
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--out=./', '--lang', 'en_US', '--client', '--name', 'myTemplate', 'input.pug'], function (err) {
      if (err) return done(err);
      const compiledFct = new Function('params', `${r('input.js')}; return myTemplate(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
        data: ['apples', 'bananas', 'apricots', 'pears'],
      });
      const template = Function('', r('input.js') + ';return myTemplate;')();
      assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
      done();
    });
  });
  it('--name --extension', function (done) {
    w(
      'input.pug',
      `
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
    `,
    );
    w('input.special-js', 'throw new Error("output not written");');
    run(['--no-debug', '--out=./', '--lang', 'en_US', '--client', '-E', 'special-js', 'input.pug'], function (err) {
      if (err) return done(err);
      const compiledFct = new Function('params', `${r('input.special-js')}; return template(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
        data: ['apples', 'bananas', 'apricots', 'pears'],
      });
      assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
      done();
    });
  });
  it('stdio', function (done) {
    w(
      'input.pug',
      `
- var data = ['apples', 'bananas', 'apricots', 'pears'];
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
    `,
    );
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--out=./', '--lang', 'en_US', '--client'], rs('input.pug'), function (err, stdout) {
      if (err) return done(err);
      const compiledFct = new Function('params', `${stdout}; return template(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
      });
      assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
      done();
    });
  });
  it('--name-after-file', function (done) {
    w(
      'input-file.pug',
      `
- var data = ['apples', 'bananas', 'apricots', 'pears'];
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
    `,
    );
    w('input-file.js', 'throw new Error("output not written");');
    run(['--no-debug', '--out=./', '--lang', 'en_US', '--client', '--name-after-file', 'input-file.pug'], function (
      err,
      stdout,
      stderr,
    ) {
      if (err) return done(err);
      const compiledFct = new Function('params', `${r('input-file.js')}; return inputFileTemplate(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
      });
      assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
      return done();
    });
  });
  it('--name-after-file ·InPuTwIthWEiRdNaMME.pug', function (done) {
    w(
      '·InPuTwIthWEiRdNaMME.pug',
      `
- var data = ['apples', 'bananas', 'apricots', 'pears'];
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
    `,
    );
    w('·InPuTwIthWEiRdNaMME.js', 'throw new Error("output not written");');
    run(
      ['--no-debug', '--out=./', '--client', '--lang', 'en_US', '--name-after-file', '·InPuTwIthWEiRdNaMME.pug'],
      function (err, stdout, stderr) {
        if (err) return done(err);
        const compiledFct = new Function(
          'params',
          `${r('·InPuTwIthWEiRdNaMME.js')}; return InputwithweirdnammeTemplate(params);`,
        );
        const rendered = compiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });
        assert(rendered === '<p>I love apples, bananas, apricots and pears!</p>');
        return done();
      },
    );
  });
});

describe('Yseop output', function () {
  timing(this);

  it('rosaenlg, Yseop template output', function (done) {
    w(
      'input.pug',
      `
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
`,
    );
    w('input.txt', '<p>output not written</p>');

    run(['--no-debug', '--out=./', '--lang=en_US', '--yseop', '--yseopstring', 'input.pug'], function (err) {
      if (err) return done(err);
      const txt = r('input.txt');
      assert(txt.indexOf('\\value') > -1);
      done();
    });
  });
});

describe('JSON package output', function () {
  timing(this);

  it('rosaenlg, JSON package output', function (done) {
    // prepare
    w('inputs/with_inc/packageOpts.json', fs.readFileSync('test/with_inc/packageOpts.json'));
    w('inputs/with_inc/test.pug', fs.readFileSync('test/with_inc/test.pug'));
    w('inputs/with_inc/folder/included.pug', fs.readFileSync('test/with_inc/folder/included.pug'));

    // do it
    w('packaged.json', 'JSON package not written!');
    run(['--jsonpackage', '--packageopts', 'inputs/with_inc/packageOpts.json', '-o', 'packaged.json'], function (err) {
      if (err) return done(err);
      const packaged = r('packaged.json');
      //console.log(packaged);
      const expected = ['"templateId":"test"', '"language":"en_US"', 'folder/included.pug"', '#[+includedMixin()'];
      for (let i = 0; i < expected.length; i++) {
        assert(packaged.indexOf(expected[i]) > -1, expected[i]);
      }
      done();
    });
  });
});

describe('--watch', function () {
  let watchProc;
  let stdout = '';

  function cleanup() {
    stdout = '';
    if (!watchProc) return;

    watchProc.stderr.removeAllListeners('data');
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');
    watchProc.removeAllListeners('close');
  }

  after(function () {
    cleanup();
    watchProc.kill('SIGINT');
    watchProc = null;
  });

  beforeEach(cleanup);

  afterEach(function (done) {
    // pug --watch can only detect changes that are at least 1 second apart
    setTimeout(done, 1000);
  });

  it('pass 1: initial compilation', function (done) {
    timing(this);

    w('input-file.pug', 'p toto');
    w('input-file.js', 'throw new Error("output not written (pass 1)");');
    const cmd = getRunner();
    cmd[1].push(
      '--no-debug',
      '--out=./',
      '--lang',
      'en_US',
      '--client',
      '--name-after-file',
      '--watch',
      'input-file.pug',
    );
    watchProc = cp.spawn(cmd[0], cmd[1], {
      cwd: t([]),
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        const compiledFct = new Function('params', `${r('input-file.js')}; return inputFileTemplate(params);`);
        const rendered = compiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });
        assert(rendered === '<p>Toto</p>');

        return done();
      }
    });
  });
  it('pass 2: change the file', function (done) {
    w('input-file.js', 'throw new Error("output not written (pass 2)");');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        const compiledFct = new Function('params', `${r('input-file.js')}; return inputFileTemplate(params);`);
        const rendered = compiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });

        assert(rendered === '<p>Tata</p>');

        return done();
      }
    });

    w('input-file.pug', 'p tata');
  });
  it('pass 3: remove the file then add it back', function (done) {
    w('input-file.js', 'throw new Error("output not written (pass 3)");');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        const compiledFct = new Function('params', `${r('input-file.js')}; return inputFileTemplate(params);`);
        const rendered = compiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });

        assert(rendered === '<p>Tutu</p>');

        return done();
      }
    });

    u('input-file.pug');
    setTimeout(function () {
      w('input-file.pug', 'p tutu');
    }, 250);
  });
  it('pass 4: intentional errors in the pug file', function (done) {
    let stderr = '';
    let errored = false;

    watchProc.on('error', done);
    watchProc.on('close', function () {
      errored = true;
      return done(new Error('Pug should not terminate in watch mode'));
    });
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        stdout = '';
        return done(new Error('Pug compiles an erroneous file w/o error'));
      }
    });
    watchProc.stderr.on('data', function (buf) {
      stderr += buf;
      if (!/Invalid indentation/.test(stderr)) return;
      stderr = '';

      const compiledFct = new Function('params', `${r('input-file.js')}; return inputFileTemplate(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'en_US' }),
      });
      assert(rendered === '<p>Tutu</p>');

      watchProc.stderr.removeAllListeners('data');
      watchProc.stdout.removeAllListeners('data');
      watchProc.removeAllListeners('error');
      watchProc.removeAllListeners('exit');
      // The stderr event will always fire sooner than the close event.
      // Wait for it.
      setTimeout(function () {
        if (!errored) done();
      }, 100);
    });

    w('input-file.pug', ['div', '  div', '\tarticle'].join('\n'));
  });
});

describe('--watch with dependencies', function () {
  let watchProc;
  let stdout = '';

  before(function () {
    function copy(file) {
      w(['depwatch', file], fs.readFileSync(j([__dirname, 'dependencies', file])));
    }
    copy('include2.pug');
    copy('dependency2.pug');
    copy('dependency3.pug');
  });

  function cleanup() {
    stdout = '';

    if (!watchProc) return;

    watchProc.stderr.removeAllListeners('data');
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');
    watchProc.removeAllListeners('close');
  }

  after(function () {
    cleanup();
    watchProc.kill('SIGINT');
    watchProc = null;
  });

  beforeEach(cleanup);

  afterEach(function (done) {
    // pug --watch can only detect changes that are at least 1 second apart
    setTimeout(done, 1000);
  });

  it('pass 1: initial compilation', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'], 'output not written (pass 1)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 1)');
    const cmd = getRunner();
    cmd[1].push('--out=./', '--lang', 'en_US', '--watch', 'include2.pug', 'dependency2.pug');
    watchProc = cp.spawn(cmd[0], cmd[1], {
      cwd: t('depwatch'),
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        let output = r(['depwatch', 'include2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong>');
        output = r(['depwatch', 'dependency2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong>');

        return done();
      }
    });
  });
  it('pass 2: change a dependency', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'], 'output not written (pass 2)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 2)');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        let output = r(['depwatch', 'include2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong><p>Hey</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong><p>Hey</p>');

        return done();
      }
    });

    a(['depwatch', 'dependency2.pug'], '\np Hey\n');
  });
  it('pass 3: change a deeper dependency', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'], 'output not written (pass 3)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 3)');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        let output = r(['depwatch', 'include2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong><p>Foo</p><p>Hey</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong><p>Foo</p><p>Hey</p>');

        return done();
      }
    });

    a(['depwatch', 'dependency3.pug'], '\np Foo\n');
  });
  it('pass 4: change main file', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'], 'output not written (pass 4)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 4)');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function (buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 1) {
        cleanup();

        let output = r(['depwatch', 'include2.html']);
        assert.strictEqual(output.trim(), '<strong>Dependency3</strong><p>Foo</p><p>Hey</p><p>Baz</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.strictEqual(output.trim(), 'output not written (pass 4)');

        return done();
      }
    });

    a(['depwatch', 'include2.pug'], '\np Baz\n');
  });
});
