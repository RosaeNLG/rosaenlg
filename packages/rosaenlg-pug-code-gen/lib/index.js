/**
 * @license
 * Copyright 2018, Ludan Stoecklé, (c) 2015 Forbes Lindesay
 * SPDX-License-Identifier: MIT
 */

'use strict';

const doctypes = require('doctypes');
const makeError = require('pug-error');
const buildRuntime = require('pug-runtime/build');
const runtime = require('pug-runtime');
const compileAttrs = require('pug-attrs');
const selfClosing = require('void-elements');
const constantinople = require('constantinople');
const stringify = require('js-stringify');
const addWith = require('with');

const helper = require('./helper');

// const debug = require('debug')('rosaenlg-pug-code-gen');

const compiledMainClient = require('./compiledMain_client.json');
const compiledMainServer = require('./compiledMain_server.json');

// This is used to prevent pretty printing inside certain tags
const WHITE_SPACE_SENSITIVE_TAGS = {
  pre: true,
  textarea: true,
};

const INTERNAL_VARIABLES = [
  'pug',
  'pug_mixins',
  'pug_interp',
  'pug_debug_filename',
  'pug_debug_line',
  'pug_debug_sources',
  'pug_html',
];

module.exports = generateCode;
module.exports.CodeGenerator = Compiler;
function generateCode(ast, options) {
  return new Compiler(ast, options).compile();
}

function isConstant(src) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return constantinople(src, { pug: runtime, pug_interp: undefined });
}
function toConstant(src) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return constantinople.toConstant(src, { pug: runtime, pug_interp: undefined });
}

/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */

function Compiler(node, options) {
  //console.log(options);
  this.helper = new helper.CodeGenHelper(options.language, options.embedResources);
  //console.log(this.helper);

  this.options = options = options || {};
  this.node = node;
  this.bufferedConcatenationCount = 0;
  this.hasCompiledDoctype = false;
  this.hasCompiledTag = false;
  this.pp = options.pretty || false;
  if (this.pp && typeof this.pp !== 'string') {
    this.pp = '  ';
  }
  this.debug = false !== options.compileDebug;
  this.indents = 0;
  this.parentIndents = 0;
  this.terse = false;
  this.mixins = {};
  this.dynamicMixins = true; // ref and refexpr mixins are called programmatically by ValueManager but not spotted as dynamic by pug
  this.eachCount = 0;
  if (options.doctype) this.setDoctype(options.doctype);
  this.runtimeFunctionsUsed = [];
  this.inlineRuntimeFunctions = options.inlineRuntimeFunctions || false;
  if (this.debug && this.inlineRuntimeFunctions) {
    this.runtimeFunctionsUsed.push('rethrow');
  }
}

/**
 * Compiler prototype.
 */

Compiler.prototype = {
  runtime: function (name) {
    if (this.inlineRuntimeFunctions) {
      this.runtimeFunctionsUsed.push(name);
      return 'pug_' + name;
    } else {
      return 'pug.' + name;
    }
  },

  error: function (message, code, node) {
    const err = makeError(code, message, {
      line: node.line,
      column: node.column,
      filename: node.filename,
    });
    throw err;
  },

  nameFunction: function (name) {
    this.buf.push('var ' + name + '=pug_mixins["' + name + '"];');
  },

  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */

  compile: function () {
    this.buf = [];
    if (this.pp) this.buf.push('var pug_indent = [];');
    this.lastBufferedIdx = -1;
    this.visit(this.node);
    if (!this.dynamicMixins) {
      // if there are no dynamic mixins we can remove any un-used mixins
      const mixinNames = Object.keys(this.mixins);
      for (let i = 0; i < mixinNames.length; i++) {
        const mixin = this.mixins[mixinNames[i]];
        if (!mixin.used) {
          for (let x = 0; x < mixin.instances.length; x++) {
            for (let y = mixin.instances[x].start; y < mixin.instances[x].end; y++) {
              this.buf[y] = '';
            }
          }
        }
      }
    }
    let js = this.buf.join('\n');

    // not when generating Yseop template
    // and not when building mainpug (because we build what will be included later)
    if (!this.options.yseop && !this.options.mainpug) {
      // main.pug uses them and maybe their are not called elsewhere
      this.runtime('escape');
      this.runtime('match_html');

      if (this.options.forSide == null) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `internal error options.forSide must be set!`;
        throw err;
      }

      let mainpugCode;
      switch (this.options.forSide) {
        case 'client': {
          mainpugCode = compiledMainClient.code;
          break;
        }
        case 'server': {
          mainpugCode = compiledMainServer.code;
          break;
        }
      }
      js = mainpugCode + '\n' + js;
    }
    // console.log(js);

    const globals = this.options.globals ? this.options.globals.concat(INTERNAL_VARIABLES) : INTERNAL_VARIABLES;
    if (this.options.self) {
      js = 'var self = locals || {};' + js;
    } else {
      try {
        js = addWith(
          'locals || {}',
          js,
          globals.concat(
            this.runtimeFunctionsUsed.map(function (name) {
              return 'pug_' + name;
            }),
          ),
        );
      } catch (e) {
        const err = new Error();
        err.name = 'CompileError';
        const linePos = e.babylonError.loc.line - 1; // as we want an index
        const colPos = e.babylonError.loc.column;
        const jsArr = js.split(/\r?\n/);

        // get the context of the error
        const windowSize = 4;
        const detail = [];
        let detailIndex = 0;
        for (let i = linePos - windowSize; i <= linePos + windowSize; i++) {
          if (i >= 0 && i < jsArr.length) {
            detail.push(`  ${i == linePos ? '>' : ' '} ${detailIndex + 1} | ${jsArr[i]}`);
            if (i == linePos) {
              detail.push('-'.repeat(colPos + 8) + '^');
            }
            detailIndex++;
          }
        }

        err.message = `error when parsing js at column ${colPos}, line:\n${detail.join('\n')}`;
        throw err;
      }
    }
    if (this.debug) {
      if (this.options.includeSources) {
        js = 'var pug_debug_sources = ' + stringify(this.options.includeSources) + ';\n' + js;
      }
      js =
        'var pug_debug_filename, pug_debug_line;' +
        'try {' +
        js +
        '} catch (err) {' +
        (this.inlineRuntimeFunctions ? 'pug_rethrow' : 'pug.rethrow') +
        '(err, pug_debug_filename, pug_debug_line' +
        (this.options.includeSources ? ', pug_debug_sources[pug_debug_filename]' : '') +
        ');' +
        '}';
    }

    let returnContent;
    if (!this.options.yseop) {
      returnContent = 'locals.util.getFiltered()';
    } else {
      returnContent = 'pug_html';
    }

    //console.log(`to integrate in the compiled stuff: ${JSON.stringify(allLinguisticResources)}`);
    let embeddedLinguisticResourcesString = '';
    if (this.options.embedResources) {
      const allLinguisticResources = this.helper.getAllLinguisticResources(this.options.linguisticResourcesToSolve);
      embeddedLinguisticResourcesString = `const embeddedLinguisticResources = ${JSON.stringify(
        allLinguisticResources,
      )};`;
    }

    return (
      buildRuntime(this.runtimeFunctionsUsed) +
      'function ' +
      (this.options.templateName || 'template') +
      '(locals) {' +
      embeddedLinguisticResourcesString +
      'var pug_html = "", protect_stack = [], pug_mixins = {}, pug_interp;' +
      js +
      ';return ' +
      returnContent +
      ';}'
    );
  },

  /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */

  setDoctype: function (name) {
    this.doctype = doctypes[name.toLowerCase()] || '<!DOCTYPE ' + name + '>';
    this.terse = this.doctype.toLowerCase() == '<!doctype html>';
    this.xml = 0 == this.doctype.indexOf('<?xml');
  },

  /**
   * Buffer the given `str` exactly as is or with interpolation
   *
   * @param {String} str
   * @param {Boolean} interpolate
   * @api public
   */

  buffer: function (str, addSpaces) {
    // const self = this;

    str = stringify(str);
    str = str.substr(1, str.length - 2);

    if (addSpaces) {
      str = '¤' + str + '¤';
    }

    if (this.lastBufferedIdx == this.buf.length && this.bufferedConcatenationCount < 100) {
      if (this.lastBufferedType === 'code') {
        this.lastBuffered += ' + "';
        this.bufferedConcatenationCount++;
      }
      this.lastBufferedType = 'text';
      this.lastBuffered += str;
      this.buf[this.lastBufferedIdx - 1] = 'pug_html = pug_html + ' + this.bufferStartChar + this.lastBuffered + '";';
    } else {
      this.bufferedConcatenationCount = 0;

      this.buf.push('pug_html = pug_html + "' + str + '";');

      this.lastBufferedType = 'text';
      this.bufferStartChar = '"';
      this.lastBuffered = str;
      this.lastBufferedIdx = this.buf.length;
    }
  },

  /**
   * Buffer the given `src` so it is evaluated at run time
   *
   * @param {String} src
   * @api public
   */

  bufferExpression: function (src, addSpaces=true) {
    if (isConstant(src)) {
      return this.buffer(toConstant(src) + '');
    }
    if (this.lastBufferedIdx == this.buf.length && this.bufferedConcatenationCount < 100) {
      this.bufferedConcatenationCount++;
      if (this.lastBufferedType === 'text') this.lastBuffered += '"';
      this.lastBufferedType = 'code';
      if(addSpaces) this.lastBuffered += ' + "¤"'; 
      this.lastBuffered += ' + (' + src + ')';
      if(addSpaces) this.lastBuffered += ' + "¤"';
      this.buf[this.lastBufferedIdx - 1] = 'pug_html = pug_html + (' + this.bufferStartChar + this.lastBuffered + ');';
    } else {
      this.bufferedConcatenationCount = 0;
      this.buf.push('pug_html = pug_html + "¤" + (' + src + ') + "¤";');
      this.lastBufferedType = 'code';
      this.bufferStartChar = '';
      this.lastBuffered = '(' + src + ')';
      this.lastBufferedIdx = this.buf.length;
    }
  },

  /**
   * Buffer an indent based on the current `indent`
   * property and an additional `offset`.
   *
   * @param {Number} offset
   * @param {Boolean} newline
   * @api public
   */

  prettyIndent: function (offset, newline) {
    offset = offset || 0;
    newline = newline ? '\n' : '';
    this.buffer(newline + Array(this.indents + offset).join(this.pp));
    if (this.parentIndents) this.buf.push('pug_html = pug_html + pug_indent.join("");');
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visit: function (node, parent) {
    // console.log(JSON.stringify(node));

    const debug = this.debug;

    if (!node) {
      let msg;
      if (parent) {
        msg = 'A child of ' + parent.type + ' (' + (parent.filename || 'Pug') + ':' + parent.line + ')';
      } else {
        msg = 'A top-level node';
      }
      msg += ' is ' + node + ', expected a Pug AST Node.';
      throw new TypeError(msg);
    }

    if (debug && node.debug !== false && node.type !== 'Block') {
      if (node.line) {
        // debug function is defined in misc.pug
        // it makes both standard pug exceptions + render debug
        let js;
        if (node.filename) {
          js = `;debug(${stringify(node.filename)},${node.line});`;
        } else {
          js = `;debug(null, ${node.line});`;
        }
        this.buf.push(js + ';');
      }
    }

    if (!this['visit' + node.type]) {
      let msg;
      if (parent) {
        msg = 'A child of ' + parent.type;
      } else {
        msg = 'A top-level node';
      }
      msg +=
        ' (' +
        (node.filename || 'Pug') +
        ':' +
        node.line +
        ')' +
        ' is of type ' +
        node.type +
        ',' +
        ' which is not supported by pug-code-gen.';
      switch (node.type) {
        case 'Filter':
          msg += ' Please use pug-filters to preprocess this AST.';
          break;
        case 'Extends':
        case 'Include':
        case 'NamedBlock':
        case 'FileReference': // unlikely but for the sake of completeness
          msg += ' Please use pug-linker to preprocess this AST.';
          break;
      }
      throw new TypeError(msg);
    }

    this.visitNode(node);
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visitNode: function (node) {
    return this['visit' + node.type](node);
  },

  /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitCase: function (node) {
    this.buf.push('switch (' + node.expr + '){');
    this.visit(node.block, node);
    this.buf.push('}');
  },

  getUniqueName: function (prefix) {
    if (!this.simpleCounter) {
      this.simpleCounter = 0;
    }
    this.simpleCounter++;
    return prefix + this.simpleCounter;
  },

  visitItemz: function (node) {
    /*
      - voir si accès aux variables locales

      function xxx(pos) {
        switch(pos){
          ...
        }
      };
      util.setSize('xxx', node.size);
      pug_mixins['assemble']('xxx', node.assembly);
    */
    // debug('visit Itemz');
    const name = this.getUniqueName('assembleHelper');

    this.buf.push(`pug_mixins['${name}'] = pug_interp = function(pos, listInfo) {`);
    this.buf.push('  switch(pos){');

    this.visit(node.block, node);

    this.buf.push('  }');
    this.buf.push('};');

    this.nameFunction(name);

    this.buf.push(`util.asmManager.assemble(${name}, ${node.assembly}, ${node.size}, params);`);
  },

  visitSynz: function (node) {
    /*
      - voir si accès aux variables locales

      function xxx(pos) {
        switch(pos){
          ...
        }
      };
      util.setSize('xxx', node.size);
      pug_mixins['assemble']('xxx', params ! mais locaux donc rien);
    */
    // debug('visit Synz');
    const name = this.getUniqueName('synHelper');

    this.buf.push(`pug_mixins['${name}'] = pug_interp = function(pos){`);
    this.buf.push('  switch(pos){');

    this.visit(node.block, node);

    this.buf.push('  }');
    this.buf.push('};');

    // give a name to the function
    this.nameFunction(name);

    const paramToInterpretLater = `Object.assign({}, ${node.params}, {${node.consolidated ? node.consolidated : ''}})`;
    this.buf.push(`util.synManager.runSynz(${name}, '${name}', ${node.size}, ${paramToInterpretLater});`);
  },

  visitItem: function (node) {
    // debug('visit Item');

    // start at 0, more classic than 1
    this.buf.push(`case ${node.pos - 1}:`);
    if (node.block) {
      // debug('xxxx');
      this.visit(node.block, node);
      this.buf.push('  break;');
    }
  },

  visitSyn: function (node) {
    // debug('visit Syn');
    this.buf.push('case ' + node.pos + ':');
    if (node.block) {
      // debug('xxxx');
      this.visit(node.block, node);
      this.buf.push('  break;');
    }
  },

  /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitWhen: function (node) {
    if ('default' == node.expr) {
      this.buf.push('default:');
    } else {
      this.buf.push('case ' + node.expr + ':');
    }
    if (node.block) {
      this.visit(node.block, node);
      this.buf.push('  break;');
    }
  },

  /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitLiteral: function (node) {
    this.buffer(node.str);
  },

  visitNamedBlock: function (block) {
    return this.visitBlock(block);
  },
  /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function (block) {
    const escapePrettyMode = this.escapePrettyMode;
    const pp = this.pp;

    // Pretty print multi-line text
    if (
      pp &&
      block.nodes.length > 1 &&
      !escapePrettyMode &&
      block.nodes[0].type === 'Text' &&
      block.nodes[1].type === 'Text'
    ) {
      this.prettyIndent(1, true);
    }
    for (let i = 0; i < block.nodes.length; ++i) {
      // Pretty print text
      if (
        pp &&
        i > 0 &&
        !escapePrettyMode &&
        block.nodes[i].type === 'Text' &&
        block.nodes[i - 1].type === 'Text' &&
        /\n$/.test(block.nodes[i - 1].val)
      ) {
        this.prettyIndent(1, false);
      }
      this.visit(block.nodes[i], block);
    }
  },

  /**
   * Visit a mixin's `block` keyword.
   *
   * @param {MixinBlock} block
   * @api public
   */

  visitMixinBlock: function (block) {
    if (this.pp) this.buf.push("pug_indent.push('" + Array(this.indents + 1).join(this.pp) + "');");
    this.buf.push('block && block();');
    if (this.pp) this.buf.push('pug_indent.pop();');
  },

  /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */

  visitDoctype: function (doctype) {
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'html');
    }

    if (this.doctype) this.buffer(this.doctype);
    this.hasCompiledDoctype = true;
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function (mixin) {
    let name = 'pug_mixins[';
    let args = mixin.args || '';
    const block = mixin.block;
    const attrs = mixin.attrs;
    const attrsBlocks = this.attributeBlocks(mixin.attributeBlocks);
    const pp = this.pp;
    const dynamic = mixin.name[0] === '#';
    const key = mixin.name;
    if (dynamic) this.dynamicMixins = true;
    name += (dynamic ? mixin.name.substr(2, mixin.name.length - 3) : '"' + mixin.name + '"') + ']';

    this.mixins[key] = this.mixins[key] || { used: false, instances: [] };

    if (mixin.call) {
      switch (mixin.name) {
        case 'verb': {
          this.helper.extractWordCandidateFromVerbalForm(mixin.args);
          this.helper.extractVerbCandidate(mixin.args);
          break;
        }
        case 'subjectVerb': {
          this.helper.extractWordCandidateFromVerbalForm(mixin.args);
          this.helper.extractVerbCandidate(mixin.args);
          break;
        }
        case 'subjectVerbAdj': {
          this.helper.extractWordCandidateFromVerbalForm(mixin.args);
          this.helper.extractVerbCandidate(mixin.args);
          this.helper.extractAdjCandidateFromSubjectVerbAdj(mixin.args);
          break;
        }
        case 'agreeAdj': {
          this.helper.extractAdjectiveCandidateFromAgreeAdj(mixin.args);
          break;
        }
        case 'value': {
          this.helper.extractWordCandidateFromValue(mixin.args);
          this.helper.extractAdjectiveCandidateFromValue(mixin.args);
          break;
        }
        case 'thirdPossession': {
          this.helper.extractWordCandidateFromThirdPossession(mixin.args);
          break;
        }
      }

      this.mixins[key].used = true;
      if (pp) this.buf.push("pug_indent.push('" + Array(this.indents + 1).join(pp) + "');");
      if (block || attrs.length || attrsBlocks.length) {
        this.buf.push(name + '.call({');

        if (block) {
          this.buf.push('block: function(){');

          // Render block with no indents, dynamically added when rendered
          this.parentIndents++;
          const _indents = this.indents;
          this.indents = 0;
          this.visit(mixin.block, mixin);
          this.indents = _indents;
          this.parentIndents--;

          if (attrs.length || attrsBlocks.length) {
            this.buf.push('},');
          } else {
            this.buf.push('}');
          }
        }

        if (attrsBlocks.length) {
          if (attrs.length) {
            const val = this.attrs(attrs);
            attrsBlocks.unshift(val);
          }
          if (attrsBlocks.length > 1) {
            this.buf.push('attributes: ' + this.runtime('merge') + '([' + attrsBlocks.join(',') + '])');
          } else {
            this.buf.push('attributes: ' + attrsBlocks[0]);
          }
        } else if (attrs.length) {
          const val = this.attrs(attrs);
          this.buf.push('attributes: ' + val);
        }

        if (args) {
          this.buf.push('}, ' + args + ');');
        } else {
          this.buf.push('});');
        }
      } else {
        this.buf.push(name + '(' + args + ');');
      }
      if (pp) this.buf.push('pug_indent.pop();');
    } else {
      const mixinStart = this.buf.length;
      args = args ? args.split(',') : [];
      let rest;
      if (args.length && /^\.\.\./.test(args[args.length - 1].trim())) {
        rest = args
          .pop()
          .trim()
          .replace(/^\.\.\./, '');
      }
      // we need use pug_interp here for v8: https://code.google.com/p/v8/issues/detail?id=4165
      // once fixed, use this: this.buf.push(name + ' = function(' + args.join(',') + '){');
      this.buf.push(name + ' = pug_interp = function(' + args.join(',') + '){');
      this.buf.push('var block = (this && this.block), attributes = (this && this.attributes) || {};');
      if (rest) {
        this.buf.push('var ' + rest + ' = [];');
        this.buf.push('for (pug_interp = ' + args.length + '; pug_interp < arguments.length; pug_interp++) {');
        this.buf.push('  ' + rest + '.push(arguments[pug_interp]);');
        this.buf.push('}');
      }

      this.buf.push('function addToParams(_toAdd) { return Object.assign({}, params, _toAdd); }');

      this.parentIndents++;
      this.visit(block, mixin);
      this.parentIndents--;
      this.buf.push('};');

      // give a name to the function
      this.nameFunction(mixin.name);

      const mixinEnd = this.buf.length;
      this.mixins[key].instances.push({ start: mixinStart, end: mixinEnd });
    }
  },

  /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @param {boolean} interpolated
   * @api public
   */

  visitTag: function (tag, interpolated) {
    this.indents++;
    const name = tag.name,
      pp = this.pp,
      self = this;

    function bufferName() {
      if (interpolated) self.bufferExpression(tag.expr, false);
      else self.buffer(name);
    }

    if (WHITE_SPACE_SENSITIVE_TAGS[tag.name] === true) this.escapePrettyMode = true;

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        this.visitDoctype();
      }
      this.hasCompiledTag = true;
    }

    // pretty print
    if (pp && !tag.isInline) this.prettyIndent(0, true);
    if (tag.selfClosing || (!this.xml && selfClosing[tag.name])) {
      this.buffer('<');
      bufferName();
      this.visitAttributes(tag.attrs, this.attributeBlocks(tag.attributeBlocks));
      if (this.terse && !tag.selfClosing) {
        this.buffer('>');
      } else {
        this.buffer('/>');
      }
      // if it is non-empty throw an error
      if (
        tag.code ||
        (tag.block &&
          !(tag.block.type === 'Block' && tag.block.nodes.length === 0) &&
          tag.block.nodes.some(function (tag) {
            return tag.type !== 'Text' || !/^\s*$/.test(tag.val);
          }))
      ) {
        this.error(
          name + ' is a self closing element: <' + name + '/> but contains nested content.',
          'SELF_CLOSING_CONTENT',
          tag,
        );
      }
    } else {
      // Optimize attributes buffering
      this.buffer('<');
      bufferName();
      this.visitAttributes(tag.attrs, this.attributeBlocks(tag.attributeBlocks));
      this.buffer('>');
      if (tag.code) this.visitCode(tag.code);
      this.visit(tag.block, tag);

      // pretty print
      if (pp && !tag.isInline && WHITE_SPACE_SENSITIVE_TAGS[tag.name] !== true && !tagCanInline(tag))
        this.prettyIndent(0, true);

      this.buffer('</');
      bufferName();
      this.buffer('>');
    }

    if (WHITE_SPACE_SENSITIVE_TAGS[tag.name] === true) this.escapePrettyMode = false;

    this.indents--;
  },

  /**
   * Visit InterpolatedTag.
   *
   * @param {InterpolatedTag} tag
   * @api public
   */

  visitInterpolatedTag: function (tag) {
    return this.visitTag(tag, true);
  },

  /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */

  visitText: function (text) {
    this.buffer(text.val, true);
  },

  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */

  visitComment: function (comment) {
    if (!comment.buffer) return;
    if (this.pp) this.prettyIndent(1, true);
    this.buffer('<!--' + comment.val + '-->');
  },

  /**
   * Visit a `YieldBlock`.
   *
   * This is necessary since we allow compiling a file with `yield`.
   *
   * @param {YieldBlock} block
   * @api public
   */

  visitYieldBlock: function (block) {
    // do nothing
  },

  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */

  visitBlockComment: function (comment) {
    if (!comment.buffer) return;
    if (this.pp) this.prettyIndent(1, true);
    this.buffer('<!--' + (comment.val || ''));
    this.visit(comment.block, comment);
    if (this.pp) this.prettyIndent(1, true);
    this.buffer('-->');
  },

  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */

  visitCode: function (code) {
    // console.log(JSON.stringify(code));

    if (code.val.startsWith('setRefGender(')) {
      const content = code.val.replace(/setRefGender\((.*)\)/, '$1');
      // in order to be homogeneous with other expressions parsing
      this.helper.extractWordCandidateFromSetRefGender(content);
    }

    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control

    // Buffer code
    if (code.buffer) {
      let val = code.val.trim();
      val = 'null == (pug_interp = ' + val + ') ? "" : pug_interp';
      if (code.mustEscape !== false) val = this.runtime('escape') + '(' + val + ')';
      this.bufferExpression(val);
    } else {
      this.buf.push(code.val);
    }

    // Block support
    if (code.block) {
      if (!code.buffer) this.buf.push('{');
      this.visit(code.block, code);
      if (!code.buffer) this.buf.push('}');
    }
  },

  /**
   * Visit `Conditional`.
   *
   * @param {Conditional} cond
   * @api public
   */

  visitConditional: function (cond) {
    const test = cond.test;
    this.buf.push('if (' + test + ') {');
    this.visit(cond.consequent, cond);
    this.buf.push('}');
    if (cond.alternate) {
      if (cond.alternate.type === 'Conditional') {
        this.buf.push('else');
        this.visitConditional(cond.alternate);
      } else {
        this.buf.push('else {');
        this.visit(cond.alternate, cond);
        this.buf.push('}');
      }
    }
  },

  /**
   * Visit `While`.
   *
   * @param {While} loop
   * @api public
   */

  visitWhile: function (loop) {
    const test = loop.test;
    this.buf.push('while (' + test + ') {');
    this.visit(loop.block, loop);
    this.buf.push('}');
  },

  visitEachz: function (node) {
    /*
      #[+foreach(elts, 'showEltNOT_BC', { separator: ', ', last_separator: ' and ' })]
    
    */
    const name = this.getUniqueName('eachzHelper');

    this.buf.push(`pug_mixins['${name}'] = pug_interp = function(${node.elt}) {`);
    this.visit(node.block, node);
    this.buf.push('};');

    // give a name to the function
    this.nameFunction(name);

    this.buf.push(`util.asmManager.foreach(${node.list}, ${name}, ${node.asm});`);
  },

  visitChoosebest: function (node) {
    // console.log(`visitChoosebest: ${node.params}`);
    const name = this.getUniqueName('choosebest');

    this.buf.push(`pug_mixins['${name}'] = pug_interp = function() {`);
    this.visit(node.block, node);
    this.buf.push('};');

    // give a name to the function
    this.buf.push('var ' + name + '=pug_mixins["' + name + '"];');

    this.buf.push(`util.choosebestManager.runChoosebest(${name}, ${node.params});`);
  },

  visitProtect: function (node) {
    this.buf.push('protect_stack.push(1)');
    this.buf.push('pug_html = pug_html + "§";');
    this.visit(node.block, node);
    this.buf.push('pug_html = pug_html + "§";');
    this.buf.push('protect_stack.pop()');
  },

  visitSimpleJsCalls: function (node, jsName) {
    this.buf.push(`${jsName}${node.val}`);
    this.visit(node.block, node);
  },

  visitRecordSaid: function (node) {
    this.visitSimpleJsCalls(node, 'recordSaid');
  },

  visitDeleteSaid: function (node) {
    this.visitSimpleJsCalls(node, 'deleteSaid');
  },

  visitRecordValue: function (node) {
    this.visitSimpleJsCalls(node, 'recordValue');
  },

  visitDeleteValue: function (node) {
    this.visitSimpleJsCalls(node, 'deleteValue');
  },

  visitTitlecase: function (node) {
    const titlecaseFlag = ' _TITLECASE_ ';
    this.buf.push(`pug_html = pug_html + "${titlecaseFlag}";`);
    this.visit(node.block, node);
    this.buf.push(`pug_html = pug_html + "${titlecaseFlag}";`);
  },

  /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */

  visitEach: function (each) {
    const indexVarName = each.key || 'pug_index' + this.eachCount;
    this.eachCount++;

    this.buf.push(
      '' +
        '// iterate ' +
        each.obj +
        '\n' +
        ';(function(){\n' +
        '  var $$obj = ' +
        each.obj +
        ';\n' +
        "  if ('number' == typeof $$obj.length) {",
    );

    if (each.alternate) {
      this.buf.push('    if ($$obj.length) {');
    }

    this.buf.push(
      '' +
        '      for (var ' +
        indexVarName +
        ' = 0, $$l = $$obj.length; ' +
        indexVarName +
        ' < $$l; ' +
        indexVarName +
        '++) {\n' +
        '        var ' +
        each.val +
        ' = $$obj[' +
        indexVarName +
        '];',
    );

    this.visit(each.block, each);

    this.buf.push('      }');

    if (each.alternate) {
      this.buf.push('    } else {');
      this.visit(each.alternate, each);
      this.buf.push('    }');
    }

    this.buf.push(
      '' +
        '  } else {\n' +
        '    var $$l = 0;\n' +
        '    for (var ' +
        indexVarName +
        ' in $$obj) {\n' +
        '      $$l++;\n' +
        '      var ' +
        each.val +
        ' = $$obj[' +
        indexVarName +
        '];',
    );

    this.visit(each.block, each);

    this.buf.push('    }');
    if (each.alternate) {
      this.buf.push('    if ($$l === 0) {');
      this.visit(each.alternate, each);
      this.buf.push('    }');
    }
    this.buf.push('  }\n}).call(this);\n');
  },

  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */

  visitAttributes: function (attrs, attributeBlocks) {
    if (attributeBlocks.length) {
      if (attrs.length) {
        const val = this.attrs(attrs);
        attributeBlocks.unshift(val);
      }
      if (attributeBlocks.length > 1) {
        this.bufferExpression(
          this.runtime('attrs') +
            '(' +
            this.runtime('merge') +
            '([' +
            attributeBlocks.join(',') +
            ']), ' +
            stringify(this.terse) +
            ')',
            false
        );
      } else {
        this.bufferExpression(this.runtime('attrs') + '(' + attributeBlocks[0] + ', ' + stringify(this.terse) + ')', false);
      }
    } else if (attrs.length) {
      this.attrs(attrs, true);
    }
  },

  /**
   * Compile attributes.
   */

  attrs: function (attrs, buffer) {
    const res = compileAttrs(attrs, {
      terse: this.terse,
      format: buffer ? 'html' : 'object',
      runtime: this.runtime.bind(this),
    });
    if (buffer) {
      this.bufferExpression(res);
    }
    return res;
  },

  /**
   * Compile attribute blocks.
   */

  attributeBlocks: function (attributeBlocks) {
    return (
      attributeBlocks &&
      attributeBlocks.slice().map(function (attrBlock) {
        return attrBlock.val;
      })
    );
  },
};

function tagCanInline(tag) {
  function isInline(node) {
    // Recurse if the node is a block
    if (node.type === 'Block') return node.nodes.every(isInline);
    // When there is a YieldBlock here, it is an indication that the file is
    // expected to be included but is not. If this is the case, the block
    // must be empty.
    if (node.type === 'YieldBlock') return true;
    return (node.type === 'Text' && !/\n/.test(node.val)) || node.isInline;
  }

  return tag.block.nodes.every(isInline);
}
