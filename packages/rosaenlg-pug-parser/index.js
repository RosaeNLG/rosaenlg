/**
 * @license
 * Copyright 2018, Ludan Stoecklé, (c) 2015 Forbes Lindesay
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const TokenStream = require('token-stream');
const error = require('pug-error');
const inlineTags = require('./lib/inline-tags');

// const debug = require('debug')('rosaenlg-pug-code-gen');

/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @param {Object} options
 * @api public
 */

function Parser(tokens, options) {
  options = options || {};
  if (!Array.isArray(tokens)) {
    throw new Error('Expected tokens to be an Array but got "' + typeof tokens + '"');
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + typeof options + '"');
  }
  this.tokens = new TokenStream(tokens);
  this.filename = options.filename;
  this.src = options.src;
  this.inMixin = 0;
  this.plugins = options.plugins || [];
}

/**
 * Parser prototype.
 */

Parser.prototype = {
  /**
   * Save original constructor
   */

  constructor: Parser,

  error: function (code, message, token) {
    const err = error(code, message, {
      line: token.loc.start.line,
      column: token.loc.start.column,
      filename: this.filename,
      src: this.src,
    });
    throw err;
  },

  /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */

  advance: function () {
    return this.tokens.advance();
  },

  /**
   * Single token lookahead.
   *
   * @return {Object}
   * @api private
   */

  peek: function () {
    return this.tokens.peek();
  },

  /**
   * `n` token lookahead.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */

  lookahead: function (n) {
    return this.tokens.lookahead(n);
  },

  /**
   * Parse input returning a string of js for evaluation.
   *
   * @return {String}
   * @api public
   */

  parse: function () {
    const block = this.emptyBlock(0);

    while ('eos' != this.peek().type) {
      if ('newline' == this.peek().type) {
        this.advance();
      } else if ('text-html' == this.peek().type) {
        block.nodes = block.nodes.concat(this.parseTextHtml());
      } else {
        const expr = this.parseExpr();
        if (expr) {
          if (expr.type === 'Block') {
            block.nodes = block.nodes.concat(expr.nodes);
          } else {
            block.nodes.push(expr);
          }
        }
      }
    }

    return block;
  },

  /**
   * Expect the given type, or throw an exception.
   *
   * @param {String} type
   * @api private
   */

  expect: function (type) {
    if (this.peek().type === type) {
      return this.advance();
    } else {
      this.error('INVALID_TOKEN', 'expected "' + type + '", but got "' + this.peek().type + '"', this.peek());
    }
  },

  /**
   * Accept the given `type`.
   *
   * @param {String} type
   * @api private
   */

  accept: function (type) {
    if (this.peek().type === type) {
      return this.advance();
    }
  },

  initBlock: function (line, nodes) {
    /* istanbul ignore if */
    if ((line | 0) !== line) throw new Error('`line` is not an integer');
    /* istanbul ignore if */
    if (!Array.isArray(nodes)) throw new Error('`nodes` is not an array');
    return {
      type: 'Block',
      nodes: nodes,
      line: line,
      filename: this.filename,
    };
  },

  emptyBlock: function (line) {
    return this.initBlock(line, []);
  },

  runPlugin: function (context, tok, ...args) {
    const rest = [this];
    for (let i = 2; i < args.length; i++) {
      rest.push(args[i]);
    }
    let pluginContext;
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (plugin[context] && plugin[context][tok.type]) {
        if (pluginContext)
          throw new Error(
            'Multiple plugin handlers found for context ' +
              JSON.stringify(context) +
              ', token type ' +
              JSON.stringify(tok.type),
          );
        pluginContext = plugin[context];
      }
    }
    if (pluginContext) return pluginContext[tok.type](...rest);
  },

  /**
   *   tag
   * | doctype
   * | mixin
   * | include
   * | filter
   * | comment
   * | text
   * | text-html
   * | dot
   * | each
   * | code
   * | yield
   * | id
   * | class
   * | interpolation
   */

  parseExpr: function () {
    switch (this.peek().type) {
      // only high level tags
      case 'itemz':
        return this.parseItemz();
      case 'synz':
        return this.parseSynz();
      case 'protect':
        return this.parseProtect();
      case 'eachz':
        return this.parseEachz();
      case 'titlecase':
        return this.parseTitlecase();

      case 'tag':
        return this.parseTag();
      case 'mixin':
        return this.parseMixin();
      case 'block':
        return this.parseBlock();
      case 'mixin-block':
        return this.parseMixinBlock();
      case 'case':
        return this.parseCase();
      case 'extends':
        return this.parseExtends();
      case 'include':
        return this.parseInclude();
      case 'doctype':
        return this.parseDoctype();
      case 'filter':
        return this.parseFilter();
      case 'choosebest':
        return this.parseChoosebest();
      case 'comment':
        return this.parseComment();
      case 'text':
      case 'interpolated-code':
      case 'start-pug-interpolation':
        return this.parseText({ block: true });
      case 'text-html':
        return this.initBlock(this.peek().loc.start.line, this.parseTextHtml());
      case 'dot':
        return this.parseDot();
      case 'each':
        return this.parseEach();
      case 'code':
        return this.parseCode();
      case 'blockcode':
        return this.parseBlockCode();
      case 'recordSaid':
        return this.parseRecordSaid();
      case 'deleteSaid':
        return this.parseDeleteSaid();
      case 'recordValue':
        return this.parseRecordValue();
      case 'deleteValue':
        return this.parseDeleteValue();
      case 'if':
        return this.parseConditional();
      case 'while':
        return this.parseWhile();
      case 'call':
        return this.parseCall();
      case 'interpolation':
        return this.parseInterpolation();
      case 'yield':
        return this.parseYield();
      case 'id':
      case 'class':
        if (!this.peek().loc.start) debugger;
        this.tokens.defer({
          type: 'tag',
          val: 'div',
          loc: this.peek().loc,
          filename: this.filename,
        });
        return this.parseExpr();
      default:
        const pluginResult = this.runPlugin('expressionTokens', this.peek());
        if (pluginResult) return pluginResult;
        this.error('INVALID_TOKEN', 'unexpected token "' + this.peek().type + '"', this.peek());
    }
  },

  parseDot: function () {
    this.advance();
    return this.parseTextBlock();
  },

  /**
   * Text
   */

  parseText: function (options) {
    const tags = [];
    const lineno = this.peek().loc.start.line;
    let nextTok = this.peek();
    loop: while (true) {
      switch (nextTok.type) {
        case 'text': {
          const tok = this.advance();
          tags.push({
            type: 'Text',
            val: tok.val,
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        }
        case 'interpolated-code': {
          const tok = this.advance();
          tags.push({
            type: 'Code',
            val: tok.val,
            buffer: tok.buffer,
            mustEscape: tok.mustEscape !== false,
            isInline: true,
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        }
        case 'newline': {
          if (!options || !options.block) break loop;
          const tok = this.advance();
          const nextType = this.peek().type;
          if (nextType === 'text' || nextType === 'interpolated-code') {
            tags.push({
              type: 'Text',
              val: '\n',
              line: tok.loc.start.line,
              column: tok.loc.start.column,
              filename: this.filename,
            });
          }
          break;
        }
        case 'start-pug-interpolation': {
          this.advance();
          tags.push(this.parseExpr());
          this.expect('end-pug-interpolation');
          break;
        }
        default: {
          const pluginResult = this.runPlugin('textTokens', nextTok, tags);
          if (pluginResult) break;
          break loop;
        }
      }
      nextTok = this.peek();
    }
    if (tags.length === 1) return tags[0];
    else return this.initBlock(lineno, tags);
  },

  parseTextHtml: function () {
    const nodes = [];
    let currentNode = null;
    loop: while (true) {
      switch (this.peek().type) {
        case 'text-html': {
          const text = this.advance();
          if (!currentNode) {
            currentNode = {
              type: 'Text',
              val: text.val,
              filename: this.filename,
              line: text.loc.start.line,
              column: text.loc.start.column,
              isHtml: true,
            };
            nodes.push(currentNode);
          } else {
            currentNode.val += '\n' + text.val;
          }
          break;
        }
        case 'indent': {
          const block = this.block();
          block.nodes.forEach(function (node) {
            if (node.isHtml) {
              if (!currentNode) {
                currentNode = node;
                nodes.push(currentNode);
              } else {
                currentNode.val += '\n' + node.val;
              }
            } else {
              currentNode = null;
              nodes.push(node);
            }
          });
          break;
        }
        case 'code':
          currentNode = null;
          nodes.push(this.parseCode(true));
          break;
        case 'newline':
          this.advance();
          break;
        default:
          break loop;
      }
    }
    return nodes;
  },

  /**
   *   ':' expr
   * | block
   */

  parseBlockExpansion: function () {
    const tok = this.accept(':');
    if (tok) {
      const expr = this.parseExpr();
      return expr.type === 'Block' ? expr : this.initBlock(tok.loc.start.line, [expr]);
    } else {
      return this.block();
    }
  },

  parseSynz: function () {
    // debug("parseSynz !!!");
    const tok = this.expect('synz');
    const node = {
      type: 'Synz',
      //expr: tok.val,
      params: tok.val,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    const block = this.emptyBlock(tok.loc.start.line + 1);
    this.expect('indent');
    while ('outdent' != this.peek().type) {
      switch (this.peek().type) {
        case 'comment':
        case 'newline':
          this.advance();
          break;
        case 'syn':
          block.nodes.push(this.parseSyn());
          break;
        case 'default':
          block.nodes.push(this.parseDefault());
          break;
        default:
          const pluginResult = this.runPlugin('caseTokens', this.peek(), block);
          if (pluginResult) break;
          this.error(
            'INVALID_TOKEN',
            'Unexpected token "' + this.peek().type + '", expected "when", "default" or "newline"',
            this.peek(),
          );
      }
    }
    this.expect('outdent');

    node.block = block;

    return node;
  },

  parseItemz: function () {
    // debug("parseItemz !!!");
    const tok = this.expect('itemz');
    const node = {
      type: 'Itemz',
      //expr: tok.val,
      assembly: tok.val,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    const block = this.emptyBlock(tok.loc.start.line + 1);
    this.expect('indent');
    while ('outdent' != this.peek().type) {
      switch (this.peek().type) {
        case 'comment':
        case 'newline':
          this.advance();
          break;
        case 'item':
          block.nodes.push(this.parseItem());
          break;
        case 'default':
          block.nodes.push(this.parseDefault());
          break;
        default:
          const pluginResult = this.runPlugin('caseTokens', this.peek(), block);
          if (pluginResult) break;
          this.error(
            'INVALID_TOKEN',
            'Unexpected token "' + this.peek().type + '", expected "when", "default" or "newline"',
            this.peek(),
          );
      }
    }
    this.expect('outdent');

    node.block = block;

    return node;
  },

  /**
   * case
   */

  parseCase: function () {
    const tok = this.expect('case');
    const node = {
      type: 'Case',
      expr: tok.val,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    const block = this.emptyBlock(tok.loc.start.line + 1);
    this.expect('indent');
    while ('outdent' != this.peek().type) {
      switch (this.peek().type) {
        case 'comment':
        case 'newline':
          this.advance();
          break;
        case 'when':
          block.nodes.push(this.parseWhen());
          break;
        case 'default':
          block.nodes.push(this.parseDefault());
          break;
        default:
          const pluginResult = this.runPlugin('caseTokens', this.peek(), block);
          if (pluginResult) break;
          this.error(
            'INVALID_TOKEN',
            'Unexpected token "' + this.peek().type + '", expected "when", "default" or "newline"',
            this.peek(),
          );
      }
    }
    this.expect('outdent');

    node.block = block;

    return node;
  },

  /**
   * when
   */

  parseWhen: function () {
    const tok = this.expect('when');
    if (this.peek().type !== 'newline') {
      return {
        type: 'When',
        expr: tok.val,
        block: this.parseBlockExpansion(),
        debug: false,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    } else {
      return {
        type: 'When',
        expr: tok.val,
        debug: false,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    }
  },

  parseItem: function () {
    // debug('parseItem!!');
    const tok = this.expect('item');
    if (this.peek().type !== 'newline') {
      return {
        type: 'Item',
        //expr: tok.val,
        block: this.parseBlockExpansion(),
        debug: false,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    } else {
      return {
        type: 'Item',
        //expr: tok.val,
        debug: false,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    }
  },

  parseSyn: function () {
    // debug('parseSyn!!');
    const tok = this.expect('syn');
    if (this.peek().type !== 'newline') {
      return {
        type: 'Syn',
        block: this.parseBlockExpansion(),
        debug: false,
        params: tok.val,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    } else {
      return {
        type: 'Syn',
        debug: false,
        params: tok.val,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    }
  },

  /**
   * default
   */

  parseDefault: function () {
    const tok = this.expect('default');
    return {
      type: 'When',
      expr: 'default',
      block: this.parseBlockExpansion(),
      debug: false,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  /**
   * code
   */

  parseCode: function (noBlock) {
    const tok = this.expect('code');
    assert(typeof tok.mustEscape === 'boolean', 'Please update to the newest version of pug-lexer.');
    const node = {
      type: 'Code',
      val: tok.val,
      buffer: tok.buffer,
      mustEscape: tok.mustEscape !== false,
      isInline: !!noBlock,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
    // todo: why is this here?  It seems like a hacky workaround
    if (node.val.match(/^ *else/)) node.debug = false;

    if (noBlock) return node;

    // handle block
    const block = 'indent' == this.peek().type;
    if (block) {
      if (tok.buffer) {
        this.error('BLOCK_IN_BUFFERED_CODE', 'Buffered code cannot have a block attached to it', this.peek());
      }
      node.block = this.block();
    }

    return node;
  },
  parseConditional: function () {
    let tok = this.expect('if');
    const node = {
      type: 'Conditional',
      test: tok.val,
      consequent: this.emptyBlock(tok.loc.start.line),
      alternate: null,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    // handle block
    if ('indent' == this.peek().type) {
      node.consequent = this.block();
    }

    let currentNode = node;
    while (true) {
      if (this.peek().type === 'newline') {
        this.expect('newline');
      } else if (this.peek().type === 'else-if') {
        tok = this.expect('else-if');
        currentNode = currentNode.alternate = {
          type: 'Conditional',
          test: tok.val,
          consequent: this.emptyBlock(tok.loc.start.line),
          alternate: null,
          line: tok.loc.start.line,
          column: tok.loc.start.column,
          filename: this.filename,
        };
        if ('indent' == this.peek().type) {
          currentNode.consequent = this.block();
        }
      } else if (this.peek().type === 'else') {
        this.expect('else');
        if (this.peek().type === 'indent') {
          currentNode.alternate = this.block();
        }
        break;
      } else {
        break;
      }
    }

    return node;
  },
  parseWhile: function () {
    const tok = this.expect('while');
    const node = {
      type: 'While',
      test: tok.val,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    // handle block
    if ('indent' == this.peek().type) {
      node.block = this.block();
    } else {
      node.block = this.emptyBlock(tok.loc.start.line);
    }

    return node;
  },

  parseTitlecase: function () {
    const tok = this.advance();
    const tag = {
      type: 'Titlecase',
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: inlineTags.indexOf(tok.val) !== -1,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    return this.tag(tag, { selfClosingAllowed: true });
  },

  parseSimpleJsCalls: function (type) {
    const tok = this.advance();
    const tag = {
      type: type,
      val: tok.val,
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: inlineTags.indexOf(tok.val) !== -1,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
    return this.tag(tag, { selfClosingAllowed: true });
  },

  parseRecordSaid: function () {
    return this.parseSimpleJsCalls('RecordSaid');
  },

  parseDeleteSaid: function () {
    return this.parseSimpleJsCalls('DeleteSaid');
  },

  parseRecordValue: function () {
    return this.parseSimpleJsCalls('RecordValue');
  },

  parseDeleteValue: function () {
    return this.parseSimpleJsCalls('DeleteValue');
  },

  parseChoosebest: function () {
    const tok = this.advance();
    const tag = {
      type: 'Choosebest',
      params: tok.val,
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: inlineTags.indexOf(tok.val) !== -1,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    return this.tag(tag, { selfClosingAllowed: true });
  },

  parseProtect: function () {
    const tok = this.advance();
    const tag = {
      type: 'Protect',
      name: tok.val,
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: inlineTags.indexOf(tok.val) !== -1,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    return this.tag(tag, { selfClosingAllowed: true });
  },

  /**
   * block code
   */

  parseBlockCode: function () {
    let tok = this.expect('blockcode');
    const line = tok.loc.start.line;
    const column = tok.loc.start.column;
    const body = this.peek();
    let text = '';
    if (body.type === 'start-pipeless-text') {
      this.advance();
      while (this.peek().type !== 'end-pipeless-text') {
        tok = this.advance();
        switch (tok.type) {
          case 'text':
            text += tok.val;
            break;
          case 'newline':
            text += '\n';
            break;
          default:
            const pluginResult = this.runPlugin('blockCodeTokens', tok, tok);
            if (pluginResult) {
              text += pluginResult;
              break;
            }
            this.error('INVALID_TOKEN', 'Unexpected token type: ' + tok.type, tok);
        }
      }
      this.advance();
    }
    return {
      type: 'Code',
      val: text,
      buffer: false,
      mustEscape: false,
      isInline: false,
      line: line,
      column: column,
      filename: this.filename,
    };
  },
  /**
   * comment
   */

  parseComment: function () {
    const tok = this.expect('comment');
    let block;
    if ((block = this.parseTextBlock())) {
      return {
        type: 'BlockComment',
        val: tok.val,
        block: block,
        buffer: tok.buffer,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    } else {
      return {
        type: 'Comment',
        val: tok.val,
        buffer: tok.buffer,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
    }
  },

  /**
   * doctype
   */

  parseDoctype: function () {
    const tok = this.expect('doctype');
    return {
      type: 'Doctype',
      val: tok.val,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  parseIncludeFilter: function () {
    const tok = this.expect('filter');
    let attrs = [];

    if (this.peek().type === 'start-attributes') {
      attrs = this.attrs();
    }

    return {
      type: 'IncludeFilter',
      name: tok.val,
      attrs: attrs,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  /**
   * filter attrs? text-block
   */

  parseFilter: function () {
    const tok = this.expect('filter');
    let block,
      attrs = [];

    if (this.peek().type === 'start-attributes') {
      attrs = this.attrs();
    }

    if (this.peek().type === 'text') {
      const textToken = this.advance();
      block = this.initBlock(textToken.loc.start.line, [
        {
          type: 'Text',
          val: textToken.val,
          line: textToken.loc.start.line,
          column: textToken.loc.start.column,
          filename: this.filename,
        },
      ]);
    } else if (this.peek().type === 'filter') {
      block = this.initBlock(tok.loc.start.line, [this.parseFilter()]);
    } else {
      block = this.parseTextBlock() || this.emptyBlock(tok.loc.start.line);
    }

    return {
      type: 'Filter',
      name: tok.val,
      block: block,
      attrs: attrs,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  /**
   * each block
   */

  parseEach: function () {
    const tok = this.expect('each');
    const node = {
      type: 'Each',
      obj: tok.code,
      val: tok.val,
      key: tok.key,
      block: this.block(),
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
    if (this.peek().type == 'else') {
      this.advance();
      node.alternate = this.block();
    }
    return node;
  },

  parseEachz: function () {
    const tok = this.expect('eachz');
    const node = {
      type: 'Eachz',
      elt: tok.elt,
      list: tok.list,
      asm: tok.asm,
      block: this.block(),
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
    // console.log('parseEachz: ' + JSON.stringify(node));
    return node;
  },

  /**
   * 'extends' name
   */

  parseExtends: function () {
    const tok = this.expect('extends');
    const path = this.expect('path');
    return {
      type: 'Extends',
      file: {
        type: 'FileReference',
        path: path.val.trim(),
        line: path.loc.start.line,
        column: path.loc.start.column,
        filename: this.filename,
      },
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  /**
   * 'block' name block
   */

  parseBlock: function () {
    const tok = this.expect('block');

    const node = 'indent' == this.peek().type ? this.block() : this.emptyBlock(tok.loc.start.line);
    node.type = 'NamedBlock';
    node.name = tok.val.trim();
    node.mode = tok.mode;
    node.line = tok.loc.start.line;
    node.column = tok.loc.start.column;

    return node;
  },

  parseMixinBlock: function () {
    const tok = this.expect('mixin-block');
    if (!this.inMixin) {
      this.error('BLOCK_OUTISDE_MIXIN', 'Anonymous blocks are not allowed unless they are part of a mixin.', tok);
    }
    return {
      type: 'MixinBlock',
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  parseYield: function () {
    const tok = this.expect('yield');
    return {
      type: 'YieldBlock',
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
  },

  /**
   * include block?
   */

  parseInclude: function () {
    const tok = this.expect('include');
    const node = {
      type: 'Include', // is default value, but eventually changed after
      file: {
        type: 'FileReference',
        filename: this.filename,
      },
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };
    const filters = [];
    while (this.peek().type === 'filter') {
      filters.push(this.parseIncludeFilter());
    }
    const path = this.expect('path');

    node.file.path = path.val.trim();
    node.file.line = path.loc.start.line;
    node.file.column = path.loc.start.column;

    // .pug default was added before
    if ((/\.jade$/.test(node.file.path) || /\.pug$/.test(node.file.path)) && !filters.length) {
      node.block = 'indent' == this.peek().type ? this.block() : this.emptyBlock(tok.loc.start.line);
      if (/\.jade$/.test(node.file.path)) {
        console.warn(
          this.filename +
            ', line ' +
            tok.loc.start.line +
            ':\nThe .jade extension is deprecated, use .pug for "' +
            node.file.path +
            '".',
        );
      }
    } else if (/\.js$/.test(node.file.path)) {
      node.block = 'indent' == this.peek().type ? this.block() : this.emptyBlock(tok.loc.start.line); // meaning? just copy pasted
      node.type = 'JsInclude';
    } else {
      node.type = 'RawInclude';
      node.filters = filters;
      if (this.peek().type === 'indent') {
        this.error('RAW_INCLUDE_BLOCK', 'Raw inclusion cannot contain a block', this.peek());
      }
    }
    return node;
  },

  /**
   * call ident block
   */

  parseCall: function () {
    const tok = this.expect('call');
    const name = tok.val;
    const args = tok.args;
    const mixin = {
      type: 'Mixin',
      name: name,
      args: args,
      block: this.emptyBlock(tok.loc.start.line),
      call: true,
      attrs: [],
      attributeBlocks: [],
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    this.tag(mixin);
    if (mixin.code) {
      mixin.block.nodes.push(mixin.code);
      delete mixin.code;
    }
    if (mixin.block.nodes.length === 0) mixin.block = null;
    return mixin;
  },

  /**
   * mixin block
   */

  parseMixin: function () {
    const tok = this.expect('mixin');
    const name = tok.val;
    const args = tok.args;

    if ('indent' == this.peek().type) {
      this.inMixin++;
      const mixin = {
        type: 'Mixin',
        name: name,
        args: args,
        block: this.block(),
        call: false,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
      };
      this.inMixin--;
      return mixin;
    } else {
      this.error('MIXIN_WITHOUT_BODY', 'Mixin ' + name + ' declared without body', tok);
    }
  },

  /**
   * indent (text | newline)* outdent
   */

  parseTextBlock: function () {
    let tok = this.accept('start-pipeless-text');
    if (!tok) return;
    const block = this.emptyBlock(tok.loc.start.line);
    while (this.peek().type !== 'end-pipeless-text') {
      tok = this.advance();
      switch (tok.type) {
        case 'text':
          block.nodes.push({
            type: 'Text',
            val: tok.val,
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        case 'newline':
          block.nodes.push({
            type: 'Text',
            val: '\n',
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        case 'start-pug-interpolation':
          block.nodes.push(this.parseExpr());
          this.expect('end-pug-interpolation');
          break;
        case 'interpolated-code':
          block.nodes.push({
            type: 'Code',
            val: tok.val,
            buffer: tok.buffer,
            mustEscape: tok.mustEscape !== false,
            isInline: true,
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        default:
          const pluginResult = this.runPlugin('textBlockTokens', tok, block, tok);
          if (pluginResult) break;
          this.error('INVALID_TOKEN', 'Unexpected token type: ' + tok.type, tok);
      }
    }
    this.advance();
    return block;
  },

  /**
   * indent expr* outdent
   */

  block: function () {
    const tok = this.expect('indent');
    const block = this.emptyBlock(tok.loc.start.line);
    while ('outdent' != this.peek().type) {
      if ('newline' == this.peek().type) {
        this.advance();
      } else if ('text-html' == this.peek().type) {
        block.nodes = block.nodes.concat(this.parseTextHtml());
      } else {
        const expr = this.parseExpr();
        if (expr.type === 'Block') {
          block.nodes = block.nodes.concat(expr.nodes);
        } else {
          block.nodes.push(expr);
        }
      }
    }
    this.expect('outdent');
    return block;
  },

  /**
   * interpolation (attrs | class | id)* (text | code | ':')? newline* block?
   */

  parseInterpolation: function () {
    const tok = this.advance();
    const tag = {
      type: 'InterpolatedTag',
      expr: tok.val,
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: false,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    return this.tag(tag, { selfClosingAllowed: true });
  },

  /**
   * tag (attrs | class | id)* (text | code | ':')? newline* block?
   */

  parseTag: function () {
    const tok = this.advance();
    const tag = {
      type: 'Tag',
      name: tok.val,
      selfClosing: false,
      block: this.emptyBlock(tok.loc.start.line),
      attrs: [],
      attributeBlocks: [],
      isInline: inlineTags.indexOf(tok.val) !== -1,
      line: tok.loc.start.line,
      column: tok.loc.start.column,
      filename: this.filename,
    };

    return this.tag(tag, { selfClosingAllowed: true });
  },

  /**
   * Parse tag.
   */

  tag: function (tag, options) {
    let seenAttrs = false;
    const attributeNames = [];
    const selfClosingAllowed = options && options.selfClosingAllowed;
    // (attrs | class | id)*
    out: while (true) {
      switch (this.peek().type) {
        case 'id':
        case 'class':
          var tok = this.advance();
          if (tok.type === 'id') {
            if (attributeNames.indexOf('id') !== -1) {
              this.error('DUPLICATE_ID', 'Duplicate attribute "id" is not allowed.', tok);
            }
            attributeNames.push('id');
          }
          tag.attrs.push({
            name: tok.type,
            val: "'" + tok.val + "'",
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
            mustEscape: false,
          });
          continue;
        case 'start-attributes':
          if (seenAttrs) {
            console.warn(
              this.filename +
                ', line ' +
                this.peek().loc.start.line +
                ':\nYou should not have pug tags with multiple attributes.',
            );
          }
          seenAttrs = true;
          tag.attrs = tag.attrs.concat(this.attrs(attributeNames));
          continue;
        case '&attributes':
          var tok = this.advance();
          tag.attributeBlocks.push({
            type: 'AttributeBlock',
            val: tok.val,
            line: tok.loc.start.line,
            column: tok.loc.start.column,
            filename: this.filename,
          });
          break;
        default:
          const pluginResult = this.runPlugin('tagAttributeTokens', this.peek(), tag, attributeNames);
          if (pluginResult) break;
          break out;
      }
    }

    // check immediate '.'
    if ('dot' == this.peek().type) {
      tag.textOnly = true;
      this.advance();
    }

    // (text | code | ':')?
    switch (this.peek().type) {
      case 'text':
      case 'interpolated-code':
        const text = this.parseText();
        if (text.type === 'Block') {
          tag.block.nodes.push(...text.nodes);
        } else {
          tag.block.nodes.push(text);
        }
        break;
      case 'code':
        tag.block.nodes.push(this.parseCode(true));
        break;
      case ':':
        this.advance();
        const expr = this.parseExpr();
        tag.block = expr.type === 'Block' ? expr : this.initBlock(tag.line, [expr]);
        break;
      case 'newline':
      case 'indent':
      case 'outdent':
      case 'eos':
      case 'start-pipeless-text':
      case 'end-pug-interpolation':
        break;
      case 'slash':
        if (selfClosingAllowed) {
          this.advance();
          tag.selfClosing = true;
          break;
        }
      default:
        const pluginResult = this.runPlugin('tagTokens', this.peek(), tag, options);
        if (pluginResult) break;
        this.error(
          'INVALID_TOKEN',
          'Unexpected token `' +
            this.peek().type +
            '` expected `text`, `interpolated-code`, `code`, `:`' +
            (selfClosingAllowed ? ', `slash`' : '') +
            ', `newline` or `eos`',
          this.peek(),
        );
    }

    // newline*
    while ('newline' == this.peek().type) this.advance();

    // block?
    if (tag.textOnly) {
      tag.block = this.parseTextBlock() || this.emptyBlock(tag.line);
    } else if ('indent' == this.peek().type) {
      const block = this.block();
      for (let i = 0, len = block.nodes.length; i < len; ++i) {
        tag.block.nodes.push(block.nodes[i]);
      }
    }

    return tag;
  },

  attrs: function (attributeNames) {
    this.expect('start-attributes');

    const attrs = [];
    let tok = this.advance();
    while (tok.type === 'attribute') {
      if (tok.name !== 'class' && attributeNames) {
        if (attributeNames.indexOf(tok.name) !== -1) {
          this.error('DUPLICATE_ATTRIBUTE', 'Duplicate attribute "' + tok.name + '" is not allowed.', tok);
        }
        attributeNames.push(tok.name);
      }
      attrs.push({
        name: tok.name,
        val: tok.val,
        line: tok.loc.start.line,
        column: tok.loc.start.column,
        filename: this.filename,
        mustEscape: tok.mustEscape !== false,
      });
      tok = this.advance();
    }
    this.tokens.defer(tok);
    this.expect('end-attributes');
    return attrs;
  },
};

function parse(tokens, options) {
  const parser = new Parser(tokens, options);
  const ast = parser.parse();
  return JSON.parse(JSON.stringify(ast));
}

module.exports = parse;
module.exports.Parser = Parser;
