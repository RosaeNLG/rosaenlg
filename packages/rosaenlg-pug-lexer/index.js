/**
 * @license
 * Copyright 2018, Ludan Stoecklé, (c) 2015 Forbes Lindesay
 * SPDX-License-Identifier: MIT
 */


'use strict';

const assert = require('assert');
const isExpression = require('is-expression');
const characterParser = require('character-parser');
const error = require('pug-error');

/**
 * Initialize `Lexer` with the given `str`.
 *
 * @param {String} str
 * @param {String} filename
 * @api private
 */

function Lexer(str, options) {
  options = options || {};
  if (typeof str !== 'string') {
    throw new Error('Expected source code to be a string but got "' + typeof str + '"');
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + typeof options + '"');
  }
  //Strip any UTF-8 BOM off of the start of `str`, if it exists.
  str = str.replace(/^\uFEFF/, '');
  this.input = str.replace(/\r\n|\r/g, '\n');
  this.originalInput = this.input;
  this.filename = options.filename;
  this.interpolated = options.interpolated || false;
  this.lineno = options.startingLine || 1;
  this.colno = options.startingColumn || 1;
  this.plugins = options.plugins || [];
  this.yseop = options.yseop;
  this.indentStack = [0];
  this.indentRe = null;
  // If #{}, !{} or #[] syntax is allowed when adding text
  this.interpolationAllowed = true;
  this.whitespaceRe = /[ \n\t]/;

  this.tokens = [];
  this.ended = false;
}

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  constructor: Lexer,

  error: function (code, message) {
    const err = error(code, message, {
      line: this.lineno,
      column: this.colno,
      filename: this.filename,
      src: this.originalInput,
    });
    throw err;
  },

  assert: function (value, message) {
    if (!value) this.error('ASSERT_FAILED', message);
  },

  isExpression: function (exp) {
    return isExpression(exp, {
      throw: true,
    });
  },

  assertExpression: function (exp, noThrow) {
    //this verifies that a JavaScript expression is valid
    try {
      this.callLexerFunction('isExpression', exp);
      return true;
    } catch (ex) {
      if (noThrow) return false;

      // not coming from acorn
      if (!ex.loc) throw ex;

      this.incrementLine(ex.loc.line - 1);
      this.incrementColumn(ex.loc.column);
      const msg = 'Syntax Error: ' + ex.message.replace(/ \([0-9]+:[0-9]+\)$/, '');
      this.error('SYNTAX_ERROR', msg);
    }
  },

  assertNestingCorrect: function (exp) {
    //this verifies that code is properly nested, but allows
    //invalid JavaScript such as the contents of `attributes`
    const res = characterParser(exp);
    if (res.isNesting()) {
      this.error('INCORRECT_NESTING', 'Nesting must match on expression `' + exp + '`');
    }
  },

  /**
   * Construct a token with the given `type` and `val`.
   *
   * @param {String} type
   * @param {String} val
   * @return {Object}
   * @api private
   */

  tok: function (type, val) {
    const res = {
      type: type,
      loc: {
        start: {
          line: this.lineno,
          column: this.colno,
        },
        filename: this.filename,
      },
    };

    if (val !== undefined) res.val = val;

    return res;
  },

  /**
   * Set the token's `loc.end` value.
   *
   * @param {Object} tok
   * @returns {Object}
   * @api private
   */

  tokEnd: function (tok) {
    tok.loc.end = {
      line: this.lineno,
      column: this.colno,
    };
    return tok;
  },

  /**
   * Increment `this.lineno` and reset `this.colno`.
   *
   * @param {Number} increment
   * @api private
   */

  incrementLine: function (increment) {
    this.lineno += increment;
    if (increment) this.colno = 1;
  },

  /**
   * Increment `this.colno`.
   *
   * @param {Number} increment
   * @api private
   */

  incrementColumn: function (increment) {
    this.colno += increment;
  },

  /**
   * Consume the given `len` of input.
   *
   * @param {Number} len
   * @api private
   */

  consume: function (len) {
    this.input = this.input.substr(len);
  },

  /**
   * Scan for `type` with the given `regexp`.
   *
   * @param {String} type
   * @param {RegExp} regexp
   * @return {Object}
   * @api private
   */

  scan: function (regexp, type) {
    let captures;
    if ((captures = regexp.exec(this.input))) {
      const len = captures[0].length;
      const val = captures[1];
      const diff = len - (val ? val.length : 0);
      const tok = this.tok(type, val);
      this.consume(len);
      this.incrementColumn(diff);
      return tok;
    }
  },
  scanEndOfLine: function (regexp, type) {
    let captures;
    if ((captures = regexp.exec(this.input))) {
      let whitespaceLength = 0;
      let whitespace;
      let tok;
      if ((whitespace = /^([ ]+)([^ ]*)/.exec(captures[0]))) {
        whitespaceLength = whitespace[1].length;
        this.incrementColumn(whitespaceLength);
      }
      const newInput = this.input.substr(captures[0].length);
      if (newInput[0] === ':') {
        this.input = newInput;
        tok = this.tok(type, captures[1]);
        this.incrementColumn(captures[0].length - whitespaceLength);
        return tok;
      }
      if (/^[ \t]*(\n|$)/.test(newInput)) {
        this.input = newInput.substr(/^[ \t]*/.exec(newInput)[0].length);
        tok = this.tok(type, captures[1]);
        this.incrementColumn(captures[0].length - whitespaceLength);
        return tok;
      }
    }
  },

  /**
   * Return the indexOf `(` or `{` or `[` / `)` or `}` or `]` delimiters.
   *
   * Make sure that when calling this function, colno is at the character
   * immediately before the beginning.
   *
   * @return {Number}
   * @api private
   */

  bracketExpression: function (skip) {
    skip = skip || 0;
    const start = this.input[skip];
    assert(start === '(' || start === '{' || start === '[', 'The start character should be "(", "{" or "["');
    const end = characterParser.BRACKETS[start];
    let range;
    try {
      range = characterParser.parseUntil(this.input, end, { start: skip + 1 });
    } catch (ex) {
      if (ex.index !== undefined) {
        let idx = ex.index;
        // starting from this.input[skip]
        let tmp = this.input.substr(skip).indexOf('\n');
        // starting from this.input[0]
        let nextNewline = tmp + skip;
        let ptr = 0;
        while (idx > nextNewline && tmp !== -1) {
          this.incrementLine(1);
          idx -= nextNewline + 1;
          ptr += nextNewline + 1;
          tmp = nextNewline = this.input.substr(ptr).indexOf('\n');
        }

        this.incrementColumn(idx);
      }
      if (ex.code === 'CHARACTER_PARSER:END_OF_STRING_REACHED') {
        this.error('NO_END_BRACKET', 'The end of the string reached with no closing bracket ' + end + ' found.');
      } else if (ex.code === 'CHARACTER_PARSER:MISMATCHED_BRACKET') {
        this.error('BRACKET_MISMATCH', ex.message);
      }
      throw ex;
    }
    return range;
  },

  scanIndentation: function () {
    let captures, re;

    // established regexp
    if (this.indentRe) {
      captures = this.indentRe.exec(this.input);
      // determine regexp
    } else {
      // tabs
      re = /^\n(\t*) */;
      captures = re.exec(this.input);

      // spaces
      if (captures && !captures[1].length) {
        re = /^\n( *)/;
        captures = re.exec(this.input);
      }

      // established
      if (captures && captures[1].length) this.indentRe = re;
    }

    return captures;
  },

  /**
   * end-of-source.
   */

  eos: function () {
    if (this.input.length) return;
    if (this.interpolated) {
      this.error('NO_END_BRACKET', 'End of line was reached with no closing bracket for interpolation.');
    }
    for (let i = 0; this.indentStack[i]; i++) {
      this.tokens.push(this.tokEnd(this.tok('outdent')));
    }
    this.tokens.push(this.tokEnd(this.tok('eos')));
    this.ended = true;
    return true;
  },

  /**
   * Blank line.
   */

  blank: function () {
    let captures;
    if ((captures = /^\n[ \t]*\n/.exec(this.input))) {
      this.consume(captures[0].length - 1);
      this.incrementLine(1);
      return true;
    }
  },

  /**
   * Comment.
   */

  comment: function () {
    let captures;
    if ((captures = /^\/\/(-)?([^\n]*)/.exec(this.input))) {
      this.consume(captures[0].length);
      const tok = this.tok('comment', captures[2]);
      tok.buffer = '-' != captures[1];

      // we force to keep the comments
      if (this.yseop) {
        tok.buffer = true;
      }
      this.interpolationAllowed = tok.buffer;
      this.tokens.push(tok);
      this.incrementColumn(captures[0].length);
      this.tokEnd(tok);
      this.callLexerFunction('pipelessText');
      return true;
    }
  },

  /**
   * Interpolated tag.
   */

  interpolation: function () {
    if (/^#\{/.test(this.input)) {
      const match = this.bracketExpression(1);
      this.consume(match.end + 1);
      const tok = this.tok('interpolation', match.src);
      this.tokens.push(tok);
      this.incrementColumn(2); // '#{'
      this.assertExpression(match.src);

      const splitted = match.src.split('\n');
      const lines = splitted.length - 1;
      this.incrementLine(lines);
      this.incrementColumn(splitted[lines].length + 1); // + 1 → '}'
      this.tokEnd(tok);
      return true;
    }
  },

  /**
   * Tag.
   */

  tag: function () {
    let captures;

    if ((captures = /^(\w(?:[-:\w]*\w)?)/.exec(this.input))) {
      const name = captures[1];
      const len = captures[0].length;
      this.consume(len);
      const tok = this.tok('tag', name);
      this.tokens.push(tok);
      this.incrementColumn(len);
      this.tokEnd(tok);
      //console.log('tag: ' + JSON.stringify(tok));
      return true;
    }
  },

  /**
   * Filter.
   */

  filter: function (opts) {
    const tok = this.scan(/^:([\w\-]+)/, 'filter');
    const inInclude = opts && opts.inInclude;
    if (tok) {
      this.tokens.push(tok);
      this.incrementColumn(tok.val.length);
      this.tokEnd(tok);
      this.callLexerFunction('attrs');
      if (!inInclude) {
        this.interpolationAllowed = false;
        this.callLexerFunction('pipelessText');
      }
      return true;
    }
  },

  /**
   * Doctype.
   */

  doctype: function () {
    const node = this.scanEndOfLine(/^doctype *([^\n]*)/, 'doctype');
    if (node) {
      this.tokens.push(this.tokEnd(node));
      return true;
    }
  },

  /**
   * Id.
   */

  id: function () {
    const tok = this.scan(/^#([\w-]+)/, 'id');
    if (tok) {
      this.tokens.push(tok);
      this.incrementColumn(tok.val.length);
      this.tokEnd(tok);
      return true;
    }
    if (/^#/.test(this.input)) {
      this.error('INVALID_ID', '"' + /.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0] + '" is not a valid ID.');
    }
  },

  /**
   * Class.
   */

  className: function () {
    const tok = this.scan(/^\.([_a-z0-9\-]*[_a-z][_a-z0-9\-]*)/i, 'class');
    if (tok) {
      this.tokens.push(tok);
      this.incrementColumn(tok.val.length);
      this.tokEnd(tok);
      return true;
    }
    if (/^\.[_a-z0-9\-]+/i.test(this.input)) {
      this.error('INVALID_CLASS_NAME', 'Class names must contain at least one letter or underscore.');
    }
    if (/^\./.test(this.input)) {
      this.error(
        'INVALID_CLASS_NAME',
        '"' +
          /.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0] +
          '" is not a valid class name.  Class names can only contain "_", "-", a-z and 0-9, and must contain at least one of "_", or a-z',
      );
    }
  },

  /**
   * Text.
   */
  endInterpolation: function () {
    if (this.interpolated && this.input[0] === ']') {
      this.input = this.input.substr(1);
      this.ended = true;
      return true;
    }
  },
  addText: function (type, value, prefix, escaped) {
    let tok;
    if (value + prefix === '') return;
    prefix = prefix || '';
    escaped = escaped || 0;
    let indexOfEnd = this.interpolated ? value.indexOf(']') : -1;
    let indexOfStart = this.interpolationAllowed ? value.indexOf('#[') : -1;
    let indexOfEscaped = this.interpolationAllowed ? value.indexOf('\\#[') : -1;
    const matchOfStringInterp = /(\\)?([#!]){((?:.|\n)*)$/.exec(value);
    const indexOfStringInterp = this.interpolationAllowed && matchOfStringInterp ? matchOfStringInterp.index : Infinity;

    if (indexOfEnd === -1) indexOfEnd = Infinity;
    if (indexOfStart === -1) indexOfStart = Infinity;
    if (indexOfEscaped === -1) indexOfEscaped = Infinity;

    if (
      indexOfEscaped !== Infinity &&
      indexOfEscaped < indexOfEnd &&
      indexOfEscaped < indexOfStart &&
      indexOfEscaped < indexOfStringInterp
    ) {
      prefix = prefix + value.substring(0, indexOfEscaped) + '#[';
      return this.addText(type, value.substring(indexOfEscaped + 3), prefix, escaped + 1);
    }
    if (
      indexOfStart !== Infinity &&
      indexOfStart < indexOfEnd &&
      indexOfStart < indexOfEscaped &&
      indexOfStart < indexOfStringInterp
    ) {
      tok = this.tok(type, prefix + value.substring(0, indexOfStart));
      this.incrementColumn(prefix.length + indexOfStart + escaped);
      this.tokens.push(this.tokEnd(tok));
      tok = this.tok('start-pug-interpolation');
      this.incrementColumn(2);
      this.tokens.push(this.tokEnd(tok));
      const child = new this.constructor(value.substr(indexOfStart + 2), {
        filename: this.filename,
        interpolated: true,
        startingLine: this.lineno,
        startingColumn: this.colno,
      });
      let interpolated;
      try {
        interpolated = child.getTokens();
      } catch (ex) {
        if (ex.code && /^PUG:/.test(ex.code)) {
          this.colno = ex.column;
          this.error(ex.code.substr(4), ex.msg);
        }
        throw ex;
      }
      this.colno = child.colno;
      this.tokens = this.tokens.concat(interpolated);
      tok = this.tok('end-pug-interpolation');
      this.incrementColumn(1);
      this.tokens.push(this.tokEnd(tok));
      this.addText(type, child.input);
      return;
    }
    if (
      indexOfEnd !== Infinity &&
      indexOfEnd < indexOfStart &&
      indexOfEnd < indexOfEscaped &&
      indexOfEnd < indexOfStringInterp
    ) {
      if (prefix + value.substring(0, indexOfEnd)) {
        this.addText(type, value.substring(0, indexOfEnd), prefix);
      }
      this.ended = true;
      this.input = value.substr(value.indexOf(']') + 1) + this.input;
      return;
    }
    if (indexOfStringInterp !== Infinity) {
      if (matchOfStringInterp[1]) {
        prefix = prefix + value.substring(0, indexOfStringInterp) + '#{';
        return this.addText(type, value.substring(indexOfStringInterp + 3), prefix, escaped + 1);
      }
      let before = value.substr(0, indexOfStringInterp);
      if (prefix || before) {
        before = prefix + before;
        tok = this.tok(type, before);
        this.incrementColumn(before.length + escaped);
        this.tokens.push(this.tokEnd(tok));
      }

      let rest = matchOfStringInterp[3];
      let range;
      tok = this.tok('interpolated-code');
      this.incrementColumn(2);
      try {
        range = characterParser.parseUntil(rest, '}');
      } catch (ex) {
        if (ex.index !== undefined) {
          this.incrementColumn(ex.index);
        }
        if (ex.code === 'CHARACTER_PARSER:END_OF_STRING_REACHED') {
          this.error('NO_END_BRACKET', 'End of line was reached with no closing bracket for interpolation.');
        } else if (ex.code === 'CHARACTER_PARSER:MISMATCHED_BRACKET') {
          this.error('BRACKET_MISMATCH', ex.message);
        } else {
          throw ex;
        }
      }
      tok.mustEscape = matchOfStringInterp[2] === '#';
      tok.buffer = true;
      tok.val = range.src;
      this.assertExpression(range.src);

      if (range.end + 1 < rest.length) {
        rest = rest.substr(range.end + 1);
        this.incrementColumn(range.end + 1);
        this.tokens.push(this.tokEnd(tok));
        this.addText(type, rest);
      } else {
        this.incrementColumn(rest.length);
        this.tokens.push(this.tokEnd(tok));
      }
      return;
    }

    value = prefix + value;
    tok = this.tok(type, value);
    this.incrementColumn(value.length + escaped);
    this.tokens.push(this.tokEnd(tok));
  },

  text: function () {
    const tok = this.scan(/^(?:\| ?| )([^\n]+)/, 'text') || this.scan(/^( )/, 'text') || this.scan(/^\|( ?)/, 'text');
    if (tok) {
      this.addText('text', tok.val);
      return true;
    }
  },

  textHtml: function () {
    const tok = this.scan(/^(<[^\n]*)/, 'text-html');
    if (tok) {
      this.addText('text-html', tok.val);
      return true;
    }
  },

  /**
   * Dot.
   */

  dot: function () {
    let tok;
    if ((tok = this.scanEndOfLine(/^\./, 'dot'))) {
      this.tokens.push(this.tokEnd(tok));
      this.callLexerFunction('pipelessText');
      return true;
    }
  },

  /**
   * Extends.
   */

  extends: function () {
    const tok = this.scan(/^extends?(?= |$|\n)/, 'extends');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      if (!this.callLexerFunction('path')) {
        this.error('NO_EXTENDS_PATH', 'missing path for extends');
      }
      return true;
    }
    if (this.scan(/^extends?\b/)) {
      this.error('MALFORMED_EXTENDS', 'malformed extends');
    }
  },

  /**
   * Block prepend.
   */

  prepend: function () {
    let captures;
    if ((captures = /^(?:block +)?prepend +([^\n]+)/.exec(this.input))) {
      let name = captures[1].trim();
      let comment = '';
      if (name.indexOf('//') !== -1) {
        comment = '//' + name.split('//').slice(1).join('//');
        name = name.split('//')[0].trim();
      }
      if (!name) return;
      const tok = this.tok('block', name);
      let len = captures[0].length - comment.length;
      while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
      this.incrementColumn(len);
      tok.mode = 'prepend';
      this.tokens.push(this.tokEnd(tok));
      this.consume(captures[0].length - comment.length);
      this.incrementColumn(captures[0].length - comment.length - len);
      return true;
    }
  },

  /**
   * Block append.
   */

  append: function () {
    let captures;
    if ((captures = /^(?:block +)?append +([^\n]+)/.exec(this.input))) {
      let name = captures[1].trim();
      let comment = '';
      if (name.indexOf('//') !== -1) {
        comment = '//' + name.split('//').slice(1).join('//');
        name = name.split('//')[0].trim();
      }
      if (!name) return;
      const tok = this.tok('block', name);
      let len = captures[0].length - comment.length;
      while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
      this.incrementColumn(len);
      tok.mode = 'append';
      this.tokens.push(this.tokEnd(tok));
      this.consume(captures[0].length - comment.length);
      this.incrementColumn(captures[0].length - comment.length - len);
      return true;
    }
  },

  /**
   * Block.
   */

  block: function () {
    let captures;
    if ((captures = /^block +([^\n]+)/.exec(this.input))) {
      let name = captures[1].trim();
      let comment = '';
      if (name.indexOf('//') !== -1) {
        comment = '//' + name.split('//').slice(1).join('//');
        name = name.split('//')[0].trim();
      }
      if (!name) return;
      const tok = this.tok('block', name);
      let len = captures[0].length - comment.length;
      while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
      this.incrementColumn(len);
      tok.mode = 'replace';
      this.tokens.push(this.tokEnd(tok));
      this.consume(captures[0].length - comment.length);
      this.incrementColumn(captures[0].length - comment.length - len);
      return true;
    }
  },

  /**
   * Mixin Block.
   */

  mixinBlock: function () {
    let tok;
    if ((tok = this.scanEndOfLine(/^block/, 'mixin-block'))) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * Yield.
   */

  yield: function () {
    const tok = this.scanEndOfLine(/^yield/, 'yield');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * Include.
   */

  include: function () {
    const tok = this.scan(/^include(?=:| |$|\n)/, 'include');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      while (this.callLexerFunction('filter', { inInclude: true }));
      if (!this.callLexerFunction('path')) {
        if (/^[^ \n]+/.test(this.input)) {
          // if there is more text
          this.fail();
        } else {
          // if not
          this.error('NO_INCLUDE_PATH', 'missing path for include');
        }
      }
      return true;
    }
    if (this.scan(/^include\b/)) {
      this.error('MALFORMED_INCLUDE', 'malformed include');
    }
  },

  /**
   * Path
   */

  path: function () {
    const tok = this.scanEndOfLine(/^ ([^\n]+)/, 'path');
    if (tok && (tok.val = tok.val.trim())) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  itemz: function () {
    {
      const tok = this.scanEndOfLine(/^itemz +([^\n]+)/, 'itemz');
      if (tok) {
        //console.log('start of itemz!');
        //console.log(JSON.stringify(tok));
        this.incrementColumn(-tok.val.length);
        this.assertExpression(tok.val);
        this.incrementColumn(tok.val.length);
        this.tokens.push(this.tokEnd(tok));
        return true;
      }
    }
    {
      // no parameters
      const tok = this.scanEndOfLine(/^itemz/, 'itemz');
      if (tok) {
        // console.log('start of itemz with no parameter!');
        // console.log(JSON.stringify(tok));
        tok.val = '{}';
        this.tokens.push(this.tokEnd(tok));
        return true;
      }
    }
  },

  item: function () {
    const tok = this.scanEndOfLine(/^item\b/, 'item');
    if (tok) {
      //console.log('start of item!');
      //console.log(JSON.stringify(tok));

      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  protect: function () {
    const tok = this.scan(/^protect\b/, 'protect');
    if (tok) {
      //console.log('start of protect!');
      //console.log(JSON.stringify(tok));

      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  choosebest: function () {
    {
      const tok = this.scanEndOfLine(/^choosebest +([^\n]+)/, 'choosebest');
      if (tok) {
        // console.log('start of choosebest with params!');
        //console.log(JSON.stringify(tok));
        this.incrementColumn(-tok.val.length);
        this.assertExpression(tok.val);
        this.incrementColumn(tok.val.length);
        this.tokens.push(this.tokEnd(tok));
        return true;
      }
    }

    {
      const tok = this.scan(/^choosebest\b/, 'choosebest');
      if (tok) {
        //console.log('start of choosebest without params!');
        //console.log(JSON.stringify(tok));

        this.tokens.push(this.tokEnd(tok));
        return true;
      }
    }
  },

  titlecase: function () {
    const tok = this.scanEndOfLine(/^titlecase\b/, 'titlecase');
    if (tok) {
      //console.log('start of titlecase!');
      //console.log(JSON.stringify(tok));
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  synz: function () {
    let tok = this.scanEndOfLine(/^synz\b/, 'synz');
    if (tok) {
      //console.log('start of synz!');
      //console.log(JSON.stringify(tok));
      this.tokens.push(this.tokEnd(tok));
      return true;
    }

    tok = this.scanEndOfLine(/^synz +([^\n]+)/, 'synz');
    if (tok) {
      //console.log('start of itemz!');
      //console.log(JSON.stringify(tok));
      this.incrementColumn(-tok.val.length);
      this.assertExpression(tok.val);
      this.incrementColumn(tok.val.length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  syn: function () {
    let tok = this.scanEndOfLine(/^syn\b/, 'syn');
    if (tok) {
      //console.log('start of syn!');
      //console.log(JSON.stringify(tok));

      this.tokens.push(this.tokEnd(tok));
      return true;
    }

    tok = this.scanEndOfLine(/^syn +([^\n]+)/, 'syn');
    if (tok) {
      //console.log('start of syn with param!');
      this.incrementColumn(-tok.val.length);
      this.assertExpression(tok.val);
      this.incrementColumn(tok.val.length);
      this.tokens.push(this.tokEnd(tok));
      //console.log(JSON.stringify(tok));
      return true;
    }
  },

  /**
   * Case.
   */

  case: function () {
    const tok = this.scanEndOfLine(/^case +([^\n]+)/, 'case');
    if (tok) {
      this.incrementColumn(-tok.val.length);
      this.assertExpression(tok.val);
      this.incrementColumn(tok.val.length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
    if (this.scan(/^case\b/)) {
      this.error('NO_CASE_EXPRESSION', 'missing expression for case');
    }
  },

  /**
   * When.
   */

  when: function () {
    const tok = this.scanEndOfLine(/^when +([^:\n]+)/, 'when');
    if (tok) {
      let parser = characterParser(tok.val);
      while (parser.isNesting() || parser.isString()) {
        const rest = /:([^:\n]+)/.exec(this.input);
        if (!rest) break;

        tok.val += rest[0];
        this.consume(rest[0].length);
        this.incrementColumn(rest[0].length);
        parser = characterParser(tok.val);
      }

      this.incrementColumn(-tok.val.length);
      this.assertExpression(tok.val);
      this.incrementColumn(tok.val.length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
    if (this.scan(/^when\b/)) {
      this.error('NO_WHEN_EXPRESSION', 'missing expression for when');
    }
  },

  /**
   * Default.
   */

  default: function () {
    const tok = this.scanEndOfLine(/^default/, 'default');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
    if (this.scan(/^default\b/)) {
      this.error('DEFAULT_WITH_EXPRESSION', 'default should not have an expression');
    }
  },

  /**
   * Call mixin.
   */

  call: function () {
    let tok, captures, increment;
    if ((captures = /^\+(\s*)(([-\w]+)|(#\{))/.exec(this.input))) {
      // try to consume simple or interpolated call
      if (captures[3]) {
        // simple call
        increment = captures[0].length;
        this.consume(increment);
        tok = this.tok('call', captures[3]);
      } else {
        // interpolated call
        const match = this.bracketExpression(2 + captures[1].length);
        increment = match.end + 1;
        this.consume(increment);
        this.assertExpression(match.src);
        tok = this.tok('call', '#{' + match.src + '}');
      }

      this.incrementColumn(increment);

      tok.args = null;
      // Check for args (not attributes)
      if ((captures = /^ *\(/.exec(this.input))) {
        const range = this.bracketExpression(captures[0].length - 1);
        if (!/^\s*[-\w]+ *=/.test(range.src)) {
          // not attributes
          this.incrementColumn(1);
          this.consume(range.end + 1);
          tok.args = range.src;
          this.assertExpression('[' + tok.args + ']');
          for (let i = 0; i <= tok.args.length; i++) {
            if (tok.args[i] === '\n') {
              this.incrementLine(1);
            } else {
              this.incrementColumn(1);
            }
          }
        }
      }
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * Mixin.
   */

  mixin: function () {
    let captures;
    if ((captures = /^mixin +([-\w]+)(?: *\((.*)\))? */.exec(this.input))) {
      this.consume(captures[0].length);
      const tok = this.tok('mixin', captures[1]);
      tok.args = captures[2] || null;
      this.incrementColumn(captures[0].length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  simpleJsCall: function () {
    let captures;
    if ((captures = /^(deleteSaid|deleteValue|recordSaid|recordValue)([^\n]*)/.exec(this.input))) {
      this.consume(captures[0].length);
      const type = captures[1].replace(/ /g, '-');
      const js = captures[2] && captures[2].trim();

      const tok = this.tok(type, js);
      this.incrementColumn(captures[0].length - js.length);

      this.assertExpression(js);
      tok.type = type;
      tok.val = js;

      // console.log(`lexer ${JSON.stringify(tok)}`);

      this.incrementColumn(js.length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * Conditional.
   */

  conditional: function () {
    let captures;
    if ((captures = /^(if|unless|else if|else)\b([^\n]*)/.exec(this.input))) {
      this.consume(captures[0].length);
      const type = captures[1].replace(/ /g, '-');
      const js = captures[2] && captures[2].trim();
      // type can be "if", "else-if" and "else"
      const tok = this.tok(type, js);
      this.incrementColumn(captures[0].length - js.length);

      switch (type) {
        case 'if':
        case 'else-if':
          this.assertExpression(js);
          break;
        case 'unless':
          this.assertExpression(js);
          tok.val = '!(' + js + ')';
          tok.type = 'if';
          break;
        case 'else':
          if (js) {
            this.error('ELSE_CONDITION', '`else` cannot have a condition, perhaps you meant `else if`');
          }
          break;
      }
      this.incrementColumn(js.length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * While.
   */

  while: function () {
    let captures, tok;
    if ((captures = /^while +([^\n]+)/.exec(this.input))) {
      this.consume(captures[0].length);
      this.assertExpression(captures[1]);
      tok = this.tok('while', captures[1]);
      this.incrementColumn(captures[0].length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
    if (this.scan(/^while\b/)) {
      this.error('NO_WHILE_EXPRESSION', 'missing expression for while');
    }
  },

  /**
   * Each.
   */

  each: function () {
    let captures;
    if ((captures = /^(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? * in *([^\n]+)/.exec(this.input))) {
      this.consume(captures[0].length);
      const tok = this.tok('each', captures[1]);
      tok.key = captures[2] || null;
      this.incrementColumn(captures[0].length - captures[3].length);
      this.assertExpression(captures[3]);
      tok.code = captures[3];
      this.incrementColumn(captures[3].length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
    if (this.scan(/^(?:each|for)\b/)) {
      this.error('MALFORMED_EACH', 'malformed each');
    }
    if (
      (captures = /^- *(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? +in +([^\n]+)/.exec(this.input))
    ) {
      this.error(
        'MALFORMED_EACH',
        'Pug each and for should no longer be prefixed with a dash ("-"). They are pug keywords and not part of JavaScript.',
      );
    }
  },

  eachz: function () {
    //console.log('LEXER eachz');
    let captures = /^eachz +([a-zA-Z_$][\w$]*) in ([^\n]+) with ([^\n]+)/.exec(this.input);
    if (!captures) {
      // same without "with"
      captures = /^eachz +([a-zA-Z_$][\w$]*) in ([^\n]+)/.exec(this.input);
    }

    if (captures) {
      this.consume(captures[0].length);

      const tok = this.tok('eachz');

      this.assertExpression(captures[1]);
      tok.elt = captures[1];

      this.assertExpression(captures[2]);
      tok.list = captures[2];

      if (captures[3]) {
        this.assertExpression(captures[3]);
        tok.asm = captures[3];
      } else {
        tok.asm = '{}';
      }
      this.incrementColumn(captures[0].length);
      this.tokens.push(this.tokEnd(tok));
      return true;
    } else if (this.scan(/^eachz\b/)) {
      this.error('MALFORMED_EACHZ', 'malformed eachz');
    }
  },

  /**
   * Code.
   */

  code: function () {
    let captures;
    if ((captures = /^(!?=|-)[ \t]*([^\n]+)/.exec(this.input))) {
      const flags = captures[1];
      let code = captures[2];
      let shortened = 0;
      if (this.interpolated) {
        let parsed;
        try {
          parsed = characterParser.parseUntil(code, ']');
        } catch (err) {
          if (err.index !== undefined) {
            this.incrementColumn(captures[0].length - code.length + err.index);
          }
          if (err.code === 'CHARACTER_PARSER:END_OF_STRING_REACHED') {
            this.error('NO_END_BRACKET', 'End of line was reached with no closing bracket for interpolation.');
          } else if (err.code === 'CHARACTER_PARSER:MISMATCHED_BRACKET') {
            this.error('BRACKET_MISMATCH', err.message);
          } else {
            throw err;
          }
        }
        shortened = code.length - parsed.end;
        code = parsed.src;
      }
      const consumed = captures[0].length - shortened;
      this.consume(consumed);
      const tok = this.tok('code', code);
      tok.mustEscape = flags.charAt(0) === '=';
      tok.buffer = flags.charAt(0) === '=' || flags.charAt(1) === '=';

      // p #[!=    abc] hey
      //     ^              original colno
      //     -------------- captures[0]
      //           -------- captures[2]
      //     ------         captures[0] - captures[2]
      //           ^        after colno

      // =   abc
      // ^                  original colno
      // -------            captures[0]
      //     ---            captures[2]
      // ----               captures[0] - captures[2]
      //     ^              after colno
      this.incrementColumn(captures[0].length - captures[2].length);
      if (tok.buffer) this.assertExpression(code);
      this.tokens.push(tok);

      // p #[!=    abc] hey
      //           ^        original colno
      //              ----- shortened
      //           ---      code
      //              ^     after colno

      // =   abc
      //     ^              original colno
      //                    shortened
      //     ---            code
      //        ^           after colno
      this.incrementColumn(code.length);
      this.tokEnd(tok);
      return true;
    }
  },

  /**
   * Block code.
   */
  blockCode: function () {
    let tok;
    if ((tok = this.scanEndOfLine(/^-/, 'blockcode'))) {
      this.tokens.push(this.tokEnd(tok));
      this.interpolationAllowed = false;
      this.callLexerFunction('pipelessText');
      return true;
    }
  },

  /**
   * Attribute Name.
   */
  attribute: function (str) {
    let quote = '';
    const quoteRe = /['"]/;
    let key = '';
    let i;

    // consume all whitespace before the key
    for (i = 0; i < str.length; i++) {
      if (!this.whitespaceRe.test(str[i])) break;
      if (str[i] === '\n') {
        this.incrementLine(1);
      } else {
        this.incrementColumn(1);
      }
    }

    if (i === str.length) {
      return '';
    }

    const tok = this.tok('attribute');

    // quote?
    if (quoteRe.test(str[i])) {
      quote = str[i];
      this.incrementColumn(1);
      i++;
    }

    // start looping through the key
    for (; i < str.length; i++) {
      if (quote) {
        if (str[i] === quote) {
          this.incrementColumn(1);
          i++;
          break;
        }
      } else {
        if (this.whitespaceRe.test(str[i]) || str[i] === '!' || str[i] === '=' || str[i] === ',') {
          break;
        }
      }

      key += str[i];

      if (str[i] === '\n') {
        this.incrementLine(1);
      } else {
        this.incrementColumn(1);
      }
    }

    tok.name = key;

    const valueResponse = this.attributeValue(str.substr(i));

    if (valueResponse.val) {
      tok.val = valueResponse.val;
      tok.mustEscape = valueResponse.mustEscape;
    } else {
      // was a boolean attribute (ex: `input(disabled)`)
      tok.val = true;
      tok.mustEscape = true;
    }

    str = valueResponse.remainingSource;

    this.tokens.push(this.tokEnd(tok));

    for (i = 0; i < str.length; i++) {
      if (!this.whitespaceRe.test(str[i])) {
        break;
      }
      if (str[i] === '\n') {
        this.incrementLine(1);
      } else {
        this.incrementColumn(1);
      }
    }

    if (str[i] === ',') {
      this.incrementColumn(1);
      i++;
    }

    return str.substr(i);
  },

  /**
   * Attribute Value.
   */
  attributeValue: function (str) {
    const quoteRe = /['"]/;
    let val = '';
    let done, i, x;
    let escapeAttr = true;
    let state = characterParser.defaultState();
    let col = this.colno;
    let line = this.lineno;

    // consume all whitespace before the equals sign
    for (i = 0; i < str.length; i++) {
      if (!this.whitespaceRe.test(str[i])) break;
      if (str[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }

    if (i === str.length) {
      return { remainingSource: str };
    }

    if (str[i] === '!') {
      escapeAttr = false;
      col++;
      i++;
      if (str[i] !== '=') this.error('INVALID_KEY_CHARACTER', 'Unexpected character ' + str[i] + ' expected `=`');
    }

    if (str[i] !== '=') {
      // check for anti-pattern `div("foo"bar)`
      if (i === 0 && str && !this.whitespaceRe.test(str[0]) && str[0] !== ',') {
        this.error('INVALID_KEY_CHARACTER', 'Unexpected character ' + str[0] + ' expected `=`');
      } else {
        return { remainingSource: str };
      }
    }

    this.lineno = line;
    this.colno = col + 1;
    i++;

    // consume all whitespace before the value
    for (; i < str.length; i++) {
      if (!this.whitespaceRe.test(str[i])) break;
      if (str[i] === '\n') {
        this.incrementLine(1);
      } else {
        this.incrementColumn(1);
      }
    }

    line = this.lineno;
    col = this.colno;

    // start looping through the value
    for (; i < str.length; i++) {
      // if the character is in a string or in parentheses/brackets/braces
      if (!(state.isNesting() || state.isString())) {
        if (this.whitespaceRe.test(str[i])) {
          done = false;

          // find the first non-whitespace character
          for (x = i; x < str.length; x++) {
            if (!this.whitespaceRe.test(str[x])) {
              // if it is a JavaScript punctuator, then assume that it is
              // a part of the value
              if (
                (!characterParser.isPunctuator(str[x]) || quoteRe.test(str[x]) || str[x] === ':') &&
                this.assertExpression(val, true)
              ) {
                done = true;
              }
              break;
            }
          }

          // if everything else is whitespace, return now so last attribute
          // does not include trailing whitespace
          if (done || x === str.length) {
            break;
          }
        }

        // if there's no whitespace and the character is not ',', the
        // attribute did not end.
        if (str[i] === ',' && this.assertExpression(val, true)) {
          break;
        }
      }

      state = characterParser.parseChar(str[i], state);
      val += str[i];

      if (str[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }

    this.assertExpression(val);

    this.lineno = line;
    this.colno = col;

    return { val: val, mustEscape: escapeAttr, remainingSource: str.substr(i) };
  },

  /**
   * Attributes.
   */

  attrs: function () {
    let tok;

    if ('(' == this.input.charAt(0)) {
      tok = this.tok('start-attributes');
      const index = this.bracketExpression().end;
      let str = this.input.substr(1, index - 1);

      this.incrementColumn(1);
      this.tokens.push(this.tokEnd(tok));
      this.assertNestingCorrect(str);
      this.consume(index + 1);

      while (str) {
        str = this.attribute(str);
      }

      tok = this.tok('end-attributes');
      this.incrementColumn(1);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * &attributes block
   */
  attributesBlock: function () {
    if (/^&attributes\b/.test(this.input)) {
      let consumed = 11;
      this.consume(consumed);
      const tok = this.tok('&attributes');
      this.incrementColumn(consumed);
      const args = this.bracketExpression();
      consumed = args.end + 1;
      this.consume(consumed);
      tok.val = args.src;
      this.incrementColumn(consumed);
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * Indent | Outdent | Newline.
   */

  indent: function () {
    const captures = this.scanIndentation();
    let tok;

    if (captures) {
      const indents = captures[1].length;

      this.incrementLine(1);
      this.consume(indents + 1);

      if (' ' == this.input[0] || '\t' == this.input[0]) {
        this.error('INVALID_INDENTATION', 'Invalid indentation, you can use tabs or spaces but not both');
      }

      // blank line
      if ('\n' == this.input[0]) {
        this.interpolationAllowed = true;
        return this.tokEnd(this.tok('newline'));
      }

      // outdent
      if (indents < this.indentStack[0]) {
        let outdentCount = 0;
        while (this.indentStack[0] > indents) {
          if (this.indentStack[1] < indents) {
            this.error(
              'INCONSISTENT_INDENTATION',
              'Inconsistent indentation. Expecting either ' +
                this.indentStack[1] +
                ' or ' +
                this.indentStack[0] +
                ' spaces/tabs.',
            );
          }
          outdentCount++;
          this.indentStack.shift();
        }
        while (outdentCount--) {
          this.colno = 1;
          tok = this.tok('outdent');
          this.colno = this.indentStack[0] + 1;
          this.tokens.push(this.tokEnd(tok));
        }
        // indent
      } else if (indents && indents != this.indentStack[0]) {
        tok = this.tok('indent', indents);
        this.colno = 1 + indents;
        this.tokens.push(this.tokEnd(tok));
        this.indentStack.unshift(indents);
        // newline
      } else {
        tok = this.tok('newline');
        this.colno = 1 + Math.min(this.indentStack[0] || 0, indents);
        this.tokens.push(this.tokEnd(tok));
      }

      this.interpolationAllowed = true;
      return true;
    }
  },

  pipelessText: function pipelessText(indents) {
    while (this.callLexerFunction('blank'));

    const captures = this.scanIndentation();

    indents = indents || (captures && captures[1].length);
    if (indents > this.indentStack[0]) {
      this.tokens.push(this.tokEnd(this.tok('start-pipeless-text')));
      const tokens = [];
      const tokenIndent = [];
      let isMatch;
      // Index in this.input. Can't use this.consume because we might need to
      // retry lexing the block.
      let stringPtr = 0;
      do {
        // text has `\n` as a prefix
        let i = this.input.substr(stringPtr + 1).indexOf('\n');
        if (-1 == i) i = this.input.length - stringPtr - 1;
        const str = this.input.substr(stringPtr + 1, i);
        const lineCaptures = this.indentRe.exec('\n' + str);
        const lineIndents = lineCaptures && lineCaptures[1].length;
        isMatch = lineIndents >= indents;
        tokenIndent.push(isMatch);
        isMatch = isMatch || !str.trim();
        if (isMatch) {
          // consume test along with `\n` prefix if match
          stringPtr += str.length + 1;
          tokens.push(str.substr(indents));
        } else if (lineIndents > this.indentStack[0]) {
          // line is indented less than the first line but is still indented
          // need to retry lexing the text block
          this.tokens.pop();
          return pipelessText.call(this, lineCaptures[1].length);
        }
      } while (this.input.length - stringPtr && isMatch);
      this.consume(stringPtr);
      while (this.input.length === 0 && tokens[tokens.length - 1] === '') tokens.pop();
      tokens.forEach(
        function (token, i) {
          let tok;
          this.incrementLine(1);
          if (i !== 0) tok = this.tok('newline');
          if (tokenIndent[i]) this.incrementColumn(indents);
          if (tok) this.tokens.push(this.tokEnd(tok));
          this.addText('text', token);
        }.bind(this),
      );
      this.tokens.push(this.tokEnd(this.tok('end-pipeless-text')));
      return true;
    }
  },

  /**
   * Slash.
   */

  slash: function () {
    const tok = this.scan(/^\//, 'slash');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  /**
   * ':'
   */

  colon: function () {
    const tok = this.scan(/^: +/, ':');
    if (tok) {
      this.tokens.push(this.tokEnd(tok));
      return true;
    }
  },

  fail: function () {
    this.error('UNEXPECTED_TEXT', 'unexpected text "' + this.input.substr(0, 5) + '"');
  },

  callLexerFunction: function (func, ...args) {
    const rest = [...args];
    const pluginArgs = [this].concat(rest);
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (plugin[func] && plugin[func](...pluginArgs)) {
        return true;
      }
    }
    return this[func](...rest);
  },

  /**
   * Move to the next token
   *
   * @api private
   */

  advance: function () {
    return (
      this.callLexerFunction('blank') ||
      this.callLexerFunction('eos') ||
      this.callLexerFunction('endInterpolation') ||
      this.callLexerFunction('yield') ||
      this.callLexerFunction('doctype') ||
      this.callLexerFunction('interpolation') ||
      this.callLexerFunction('case') ||
      this.callLexerFunction('when') ||
      this.callLexerFunction('default') ||
      this.callLexerFunction('itemz') ||
      this.callLexerFunction('item') ||
      this.callLexerFunction('synz') ||
      this.callLexerFunction('syn') ||
      this.callLexerFunction('protect') ||
      this.callLexerFunction('choosebest') ||
      this.callLexerFunction('titlecase') ||
      this.callLexerFunction('eachz') ||
      this.callLexerFunction('extends') ||
      this.callLexerFunction('append') ||
      this.callLexerFunction('prepend') ||
      this.callLexerFunction('block') ||
      this.callLexerFunction('mixinBlock') ||
      this.callLexerFunction('include') ||
      this.callLexerFunction('mixin') ||
      this.callLexerFunction('call') ||
      this.callLexerFunction('conditional') ||
      this.callLexerFunction('simpleJsCall') ||
      this.callLexerFunction('each') ||
      this.callLexerFunction('while') ||
      this.callLexerFunction('tag') ||
      this.callLexerFunction('filter') ||
      this.callLexerFunction('blockCode') ||
      this.callLexerFunction('code') ||
      this.callLexerFunction('id') ||
      this.callLexerFunction('dot') ||
      this.callLexerFunction('className') ||
      this.callLexerFunction('attrs') ||
      this.callLexerFunction('attributesBlock') ||
      this.callLexerFunction('indent') ||
      this.callLexerFunction('text') ||
      this.callLexerFunction('textHtml') ||
      this.callLexerFunction('comment') ||
      this.callLexerFunction('slash') ||
      this.callLexerFunction('colon') ||
      this.fail()
    );
  },

  /**
   * Return an array of tokens for the current file
   *
   * @returns {Array.<Token>}
   * @api public
   */
  getTokens: function () {
    while (!this.ended) {
      this.callLexerFunction('advance');
    }
    return this.tokens;
  },
};

function lex(str, options) {
  const lexer = new Lexer(str, options);
  return JSON.parse(JSON.stringify(lexer.getTokens()));
}

module.exports = lex;
module.exports.Lexer = Lexer;
