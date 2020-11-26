/**
 * @license
 * Copyright 2019 Ludan Stoecklé, 2015 Forbes Lindesay
 * SPDX-License-Identifier: MIT
 */

'use strict';

const doctypes = require('doctypes');
const makeError = require('pug-error');
//var buildRuntime = require('pug-runtime/build');
const runtime = require('pug-runtime');
const compileAttrs = require('pug-attrs');
//var selfClosing = require('void-elements');
const constantinople = require('constantinople');
const stringify = require('js-stringify');
//var addWith = require('with');

//var debug = require('debug')('rosaenlg-yseop');

// This is used to prevent pretty printing inside certain tags
/*
var WHITE_SPACE_SENSITIVE_TAGS = {
  pre: true,
  textarea: true
};
*/

/*
var INTERNAL_VARIABLES = [
  'pug',
  'pug_mixins',
  'pug_interp',
  'pug_debug_filename',
  'pug_debug_line',
  'pug_debug_sources',
  'pug_html'
];
*/

module.exports = generateCode;
module.exports.CodeGenerator = Compiler;

function generateCode(ast, options) {
  // debug('GENERATING YSEOP CODE');
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

function trimAndReplaceQuotes(input) {
  return input.trim().replace(/'/g, '"');
}

function Compiler(node, options) {
  this.language = options.language;

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
  this.currentMixin = null;
  this.dynamicMixins = false;
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

  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */

  compile: function () {
    // this.buf = [];

    this.lastBufferedIdx = -1;
    this.visit(this.node);
    /*
    if (!this.dynamicMixins) {
      // if there are no dynamic mixins we can remove any un-used mixins
      var mixinNames = Object.keys(this.mixins);
      for (var i = 0; i < mixinNames.length; i++) {
        var mixin = this.mixins[mixinNames[i]];
        if (!mixin.used) {
          for (var x = 0; x < mixin.instances.length; x++) {
            for (var y = mixin.instances[x].start; y < mixin.instances[x].end; y++) {
              this.buf[y] = '';
            }
          }
        }
      }
    }
    */

    // var js = this.buf.join('\n');

    //var globals = this.options.globals ? this.options.globals.concat(INTERNAL_VARIABLES) : INTERNAL_VARIABLES;
    /*
    if (this.options.self) {
      js = 'var self = locals || {};' + js;
    } else {
      // js = addWith('locals || {}', js, globals.concat(this.runtimeFunctionsUsed.map(function (name) { return 'pug_' + name; })));
    }
    */
    /*
    if (this.debug) {
      if (this.options.includeSources) {
        js = 'var pug_debug_sources = ' + stringify(this.options.includeSources) + ';\n' + js;
      }
      js = 'var pug_debug_filename, pug_debug_line;' +
        'try {' +
        js +
        '} catch (err) {' +
        (this.inlineRuntimeFunctions ? 'pug_rethrow' : 'pug.rethrow') +
        '(err, pug_debug_filename, pug_debug_line' +
        (
          this.options.includeSources
          ? ', pug_debug_sources[pug_debug_filename]'
          : ''
        ) +
        ');' +
        '}';
    }
    */

    // return js;

    for (const name in this.mixins) {
      this.mixins[name] = this.mixins[name].join('\n');
    }

    return this.mixins;
    // return buildRuntime(this.runtimeFunctionsUsed) + 'function ' + (this.options.templateName || 'template') + '(locals) {var pug_html = "", pug_mixins = {}, pug_interp;' + js + ';return pug_html;}';
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

  buffer: function (str) {
    const self = this;

    str = stringify(str);
    str = str.substr(1, str.length - 2);

    if (this.lastBufferedIdx == this.buf.length && this.bufferedConcatenationCount < 100) {
      if (this.lastBufferedType === 'code') {
        this.lastBuffered += ' + "';
        this.bufferedConcatenationCount++;
      }
      this.lastBufferedType = 'text';
      this.lastBuffered += str;
      this.buf[this.lastBufferedIdx - 1] = this.bufferStartChar + this.lastBuffered;
    } else {
      this.bufferedConcatenationCount = 0;
      this.pushWithIndent(str);
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

  bufferExpression: function (src) {
    if (isConstant(src)) {
      return this.buffer(toConstant(src) + '');
    }
    if (this.lastBufferedIdx == this.buf.length && this.bufferedConcatenationCount < 100) {
      this.bufferedConcatenationCount++;
      if (this.lastBufferedType === 'text') this.lastBuffered += '"';
      this.lastBufferedType = 'code';
      this.lastBuffered += ' + (' + src + ')';
      this.buf[this.lastBufferedIdx - 1] = 'pug_html = pug_html + (' + this.bufferStartChar + this.lastBuffered + ');';
    } else {
      this.bufferedConcatenationCount = 0;
      this.buf.push('pug_html = pug_html + (' + src + ');');
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
    const debug = this.debug;

    if (!node) {
      var msg;
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
        let js = ';pug_debug_line = ' + node.line;
        if (node.filename) js += ';pug_debug_filename = ' + stringify(node.filename);
        this.buf.push(js + ';');
      }
    }

    if (!this['visit' + node.type]) {
      var msg;
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
    this.pushWithIndent(`\\switch(${node.expr}) /* TODO MIGRATION case */`);
    this.parentIndents++;
    this.visit(node.block, node);
    this.parentIndents--;
    this.pushWithIndent('\\endSwitch');
  },

  getUniqueName: function (prefix) {
    if (!this.simpleCounter) {
      this.simpleCounter = 0;
    }
    this.simpleCounter++;
    return prefix + this.simpleCounter;
  },

  decomposeAssembly: function (jsAssembly) {
    const mapped = this.mapEval(jsAssembly);

    let separators = '';
    if (mapped.matched.length > 1) {
      separators = `--> separator [${mapped.matched.join(', ')}]`;
    } else if (mapped.matched.length === 1) {
      separators = `--> separator ${mapped.matched[0]}`;
    }

    return {
      yseopAssembly: `-> TextListSentenceAssembly ${separators};`,
      left: mapped.left,
      hasLeft: mapped.hasLeft,
    };
  },

  visitItemz: function (node) {
    const decomposedAssembly = this.decomposeAssembly(node.assembly);

    let beginList = `\\beginList(${decomposedAssembly.yseopAssembly})`;
    // left keys
    if (decomposedAssembly.hasLeft) {
      beginList += ` /* TODO MIGRATE ${decomposedAssembly.left} */`;
    }

    this.pushWithIndent(beginList);
    this.parentIndents++;
    this.visit(node.block, node);
    this.parentIndents--;
    this.pushWithIndent('\\endList');
  },

  visitSynz: function (node) {
    // console.log(node.params);
    if (node.params && node.params != '') {
      const mapped = this.mapEval(node.params);
      if (mapped.hasLeft) {
        this.pushWithIndent(`\\beginSynonym /* TODO MIGRATE ${mapped.left} */`);
      } else {
        this.pushWithIndent('\\beginSynonym');
      }
    } else {
      this.pushWithIndent('\\beginSynonym');
    }

    this.parentIndents++;
    this.visit(node.block, node);
    this.parentIndents--;
    this.pushWithIndent('\\endSynonym');
  },

  visitItem: function (node) {
    // debug('visit Item');

    this.pushWithIndent('\\nextItem');
    if (node.block) {
      this.parentIndents++;
      this.visit(node.block, node);
      this.parentIndents--;
    }
  },

  visitSyn: function (node) {
    this.pushWithIndent('\\choice');
    if (node.block) {
      this.parentIndents++;
      this.visit(node.block, node);
      this.parentIndents--;
    }
  },

  /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitWhen: function (node) {
    if ('default' === node.expr) {
      this.pushWithIndent(`\\default`);
      this.parentIndents++;
    } else {
      const newExpr = node.expr.replace(/^\'/, '"').replace(/\'$/, '"');
      this.pushWithIndent(`\\case(${newExpr})`);
      this.parentIndents++;
    }
    if (node.block) {
      this.visit(node.block, node);
      this.parentIndents--;
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
    // debug(block);
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

  visitSimpleSin: function (rawArgs) {
    this.pushWithIndent(`\\synonym(${trimAndReplaceQuotes(rawArgs)})`);
  },

  visitValue: function (rawArgs) {
    // there should be 1 or 2 args
    const firstComma = rawArgs.indexOf(',');
    if (firstComma != -1) {
      // 2 params (well most of the time)
      const firstArg = trimAndReplaceQuotes(rawArgs.slice(0, firstComma));
      const secondArg = rawArgs.slice(firstComma + 1);

      let newArgs = [];
      newArgs.push(firstArg);
      let comment;

      const mapped = this.mapEval(secondArg);
      if (mapped.matchedString) {
        if (mapped.matchedString.indexOf('YYYY') > -1 || mapped.matchedString.indexOf('MM')) {
          //console.log('is probably a date format');
          const dateMappings = [
            ['YYYY', '_DATE_YYYY'],
            ['MMMM', '_DATE_MMMM'],
            ['MM', '_DATE_MM'],
          ];
          let leftParams = mapped.matchedString;
          for (let i = 0; i < dateMappings.length; i++) {
            const key = dateMappings[i][0];
            const val = dateMappings[i][1];
            if (leftParams.indexOf(key) > -1) {
              newArgs.push(val);
              leftParams = leftParams.replace(key, '');
            }
          }
        }
        comment = `/* TODO MIGRATE ${JSON.stringify(mapped.matchedString)} */`;
      } else {
        newArgs = newArgs.concat(mapped.matched);

        if (mapped.hasLeft) {
          comment = `/* TODO MIGRATE ${mapped.left} */`;
        } else {
          comment = ``;
        }
      }
      this.pushWithIndent(`\\value(${newArgs.join(', ')}) ${comment}`);
    } else {
      // only one param
      this.pushWithIndent(`\\value(${rawArgs}) /* TODO MIGRATE */`);
    }
  },

  evalSmarter: function (toParse, transformedList, left) {
    if (left === 0) {
      return null;
    }

    try {
      const parsed = eval(`(${toParse})`);
      // here at last it did not fail
      return parsed;
    } catch (error) {
      // console.log(error.message); // XXXXX is not defined
      if (error.message.indexOf(' is not defined') > -1) {
        // transform, record
        const variable = error.message.replace(' is not defined', '');
        transformedList.push(variable);
        const newToParse = toParse.replace(variable, `'${variable}'`);
        // and try again
        return this.evalSmarter(newToParse, transformedList, left - 1);
      } else {
        // other kind of error: fail
        return null;
      }
    }
  },

  mapEval: function (toParse) {
    const res = {};
    const matched = [];
    //console.log(`to parse: ${toParse}`);

    const transformedList = [];
    const parsed = this.evalSmarter(toParse, transformedList, 10);
    if (!parsed) {
      res.hasLeft = true;
      res.left = toParse.trim();
    } else {
      //console.log(`parsed: ${JSON.stringify(parsed)}, transformedList: ${transformedList}`);

      if (typeof parsed === 'string') {
        return { matchedString: parsed };
      } else if (typeof parsed === 'object') {
        //console.log(`parsed: ${JSON.stringify(parsed)}`);

        // case (German)
        if (parsed.case) {
          matched.push(parsed.case);
          delete parsed.case;
        }

        // verb
        if (parsed.verb) {
          matched.push(this.getYseopVerb(parsed.verb));
          delete parsed.verb;
        }
        if (parsed.tense) {
          matched.push(this.getYseopTense(parsed.tense));
          delete parsed.tense;
        }
        if (parsed.aux) {
          delete parsed.aux;
        }
        if (parsed.pronominal) {
          matched.push('_FORM: PRONOMINAL_FORM');
          delete parsed.pronominal;
        }
        if (parsed.agree) {
          matched.push(`_DIRECT_OBJECT_AGREEMENT: ${parsed.agree}`);
          delete parsed.agree;
        }

        // assembly
        if (parsed.separator) {
          matched.push(`"${parsed.separator}"`);
          delete parsed.separator;
        }
        if (parsed.last_separator) {
          matched.push(`_LAST`);
          matched.push(`"${parsed.last_separator}"`);
          delete parsed.last_separator;
        }

        // syn
        if (parsed.mode) {
          if (parsed.mode === 'random') {
            delete parsed.mode; // as it is default for Yseop
          }
        }

        // value
        if (parsed.TEXTUAL) {
          matched.push('-> Style --> numeralStyle _CARDINAL_NUMERAL;');
          delete parsed.TEXTUAL;
        }
        if (parsed.ORDINAL_TEXTUAL) {
          matched.push('-> Style --> numeralStyle _ORDINAL_NUMERAL;');
          delete parsed.ORDINAL_TEXTUAL;
        }
        if (parsed.ORDINAL_NUMBER) {
          matched.push('-> Style --> numeralStyle _ORDINAL_NUMERAL_SHORT;');
          delete parsed.ORDINAL_NUMBER;
        }
        if (parsed.owner) {
          matched.push(`_OWNER: ${parsed.owner}`);
          delete parsed.owner;
        }
        if (parsed.gender) {
          const genderMapping = { M: 'MASCULINE', F: 'FEMININE', N: 'NEUTRAL' };
          matched.push(`_GENDER: ${genderMapping[parsed.gender]}`);
          delete parsed.gender;
        }
        if (parsed.number) {
          const numberMapping = { S: 'SINGULAR', P: 'PLURAL' };
          matched.push(`_NUMBER: ${numberMapping[parsed.number]}`);
          delete parsed.number;
        }
        if (parsed.det) {
          const detMapping = {
            DEFINITE: 'DEFINITE_ARTICLE',
            INDEFINITE: 'INDEFINITE_ARTICLE',
            DEMONSTRATIVE: 'DEMONSTRATIVE_DETERMINER',
            POSSESSIVE: 'POSSESSIVE_DETERMINER',
          };
          matched.push(`_DETERMINER: ${detMapping[parsed.det]}`);
          delete parsed.det;
        }
        if (parsed.adjPos) {
          const adjPosMapping = { BEFORE: '_BEFORE_NOUN', AFTER: '_AFTER_NOUN' };
          matched.push(`_ADJECTIVE_POSITION: ${adjPosMapping[parsed.adjPos]}`);
          delete parsed.adjPos;
        }
        if (parsed.adj) {
          matched.push(`_ADJECTIVE: "${parsed.adj}"`);
          delete parsed.adj;
        }
      }

      if (Object.keys(parsed).length != 0) {
        res.hasLeft = true;
        res.left = JSON.stringify(parsed);
        // re transform
        for (let i = 0; i < transformedList.length; i++) {
          const transformed = transformedList[i];
          res.left = res.left.replace(`"${transformed}"`, transformed);
        }
      }
    }
    res.matched = matched;
    return res;
  },

  visitAdj: function (rawArgs) {
    const args = rawArgs.split(','); // 2 or 3
    const firstArg = trimAndReplaceQuotes(args[0]);
    const secondArg = args.length > 1 ? trimAndReplaceQuotes(args[1]) : null;
    switch (args.length) {
      case 1:
        this.pushWithIndent(`\\adjective(${firstArg}) /* TODO MIGRATE */`);
        break;
      case 2:
        this.pushWithIndent(`\\adjective(${firstArg}, _THIRD: ${secondArg}) /* TODO MIGRATE */`);
        break;
      case 3:
        let newArgs = [];
        newArgs.push(firstArg);
        newArgs.push(`_THIRD: ${secondArg}`);

        const mapped = this.mapEval(args[2].trim());
        newArgs = newArgs.concat(mapped.matched);
        if (mapped.hasLeft) {
          this.pushWithIndent(`\\adjective(${newArgs.join(', ')}) /* TODO MIGRATE ${mapped.left} */`);
        } else {
          this.pushWithIndent(`\\adjective(${newArgs.join(', ')})`);
        }
        break;
    }
  },

  visitPossessive: function (rawArgs) {
    const args = rawArgs.split(','); // 2 or 3
    const firstArg = trimAndReplaceQuotes(args[0]);
    const secondArg = trimAndReplaceQuotes(args[1]);
    switch (args.length) {
      case 1:
        this.pushWithIndent(`\\value(${firstArg}) /* TODO MIGRATE */`);
        break;
      case 2:
        this.pushWithIndent(`\\value(${secondArg}, _OWNER: ${firstArg}) /* TODO MIGRATE */`);
        break;
      case 3:
        let newArgs = [];
        newArgs.push(secondArg);
        newArgs.push(`_OWNER: ${args[0].trim()}`);
        const mapped = this.mapEval(args[2].trim());
        newArgs = newArgs.concat(mapped.matched);
        if (mapped.hasLeft) {
          this.pushWithIndent(`\\value(${newArgs.join(', ')}) /* TODO MIGRATE ${mapped.left} */`);
        } else {
          this.pushWithIndent(`\\value(${newArgs.join(', ')})`);
        }
        break;
    }
  },

  getYseopVerb: function (verb) {
    const mapping = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      en_US: 'EN',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      de_DE: 'DE',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fr_FR: 'FR',
    };
    const yseopLanguage = mapping[this.language] || this.language;
    return `VERB_${yseopLanguage}_${verb.trim().toUpperCase()}`;
  },

  getYseopTense: function (tense) {
    const mapping = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fr_FR: {
        PRESENT: 'PRESENT_INDICATIVE_FR',
        FUTUR: 'FUTURE_INDICATIVE_FR',
        IMPARFAIT: 'IMPERFECT_INDICATIVE_FR',
        PASSE_SIMPLE: 'PAST_HISTORIC_INDICATIVE_FR',
        PASSE_COMPOSE: 'PRESENT_PERFECT_INDICATIVE_FR',
        SUBJONCTIF_IMPARFAIT: 'PAST_SUBJUNCTIVE_FR',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      en_US: {
        PRESENT: 'PRESENT_EN',
        PAST: 'PRETERIT_EN',
        FUTURE: 'FUTURE_EN',
      },
    };
    if (mapping[this.language] && mapping[this.language][tense]) {
      return mapping[this.language][tense];
    } else {
      return tense;
    }
  },

  visitVerb: function (rawArgs) {
    // there should be 2 args
    const firstComma = rawArgs.indexOf(',');
    const subject = rawArgs.slice(0, firstComma).trim();
    let secondArg = rawArgs.slice(firstComma + 1);

    secondArg = secondArg.trim();

    const mapped = this.mapEval(secondArg);
    //console.log(mapped);
    if (mapped.matchedString) {
      this.pushWithIndent(`\\thirdAction(${subject}, ${this.getYseopVerb(mapped.matchedString)})`);
    } else {
      let newArgs = [];
      newArgs.push(subject);
      newArgs = newArgs.concat(mapped.matched);
      if (mapped.hasLeft) {
        this.pushWithIndent(`\\thirdAction(${newArgs.join(', ')}) /* TODO MIGRATE ${mapped.left} */`);
      } else {
        this.pushWithIndent(`\\thirdAction(${newArgs.join(', ')})`);
      }
    }
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function (mixin) {
    // debug(mixin);

    if (mixin.call) {
      // calling a mixin

      switch (mixin.name) {
        case 'value':
          this.visitValue(mixin.args);
          break;
        case 'syn':
          this.visitSimpleSin(mixin.args);
          break;
        case 'verb':
          this.visitVerb(mixin.args);
          break;
        case 'agreeAdj':
          this.visitAdj(mixin.args);
          break;
        case 'thirdPossession':
          this.visitPossessive(mixin.args);
          break;
        default:
          var args = '';
          if (mixin.args) {
            args = `(${mixin.args})`;
          }
          this.pushWithIndent(`\\${mixin.name}${args}`);
      }
    } else {
      // declaration of a mixin

      let signature;
      // args: 'arg1, arg2',
      if (mixin.args) {
        var args = mixin.args.split(',');
        const yseopArgs = [];
        for (let i = 0; i < args.length; i++) {
          yseopArgs.push('Object ' + args[i].trim());
        }
        signature = `${mixin.name}(${yseopArgs.join(', ')})`;
      } else {
        signature = `${mixin.name}()`;
      }

      this.currentMixin = mixin.name;

      this.pushWithIndent(`TextFunction ${signature}\n` + `--> text \\(`);
      this.parentIndents++;
      this.visit(mixin.block, mixin);
      this.parentIndents--;
      this.pushWithIndent(`\\);\n`);

      this.currentMixin = null;
    }

    /*
    var name = 'pug_mixins[';
    var args = mixin.args || '';
    var block = mixin.block;
    var attrs = mixin.attrs;
    var attrsBlocks = this.attributeBlocks(mixin.attributeBlocks);
    var pp = this.pp;
    var dynamic = mixin.name[0]==='#';
    var key = mixin.name;
    if (dynamic) this.dynamicMixins = true;
    name += (dynamic ? mixin.name.substr(2,mixin.name.length-3):'"'+mixin.name+'"')+']';

    this.mixins[key] = this.mixins[key] || {used: false, instances: []};
    if (mixin.call) {
      this.mixins[key].used = true;
      if (pp) this.buf.push("pug_indent.push('" + Array(this.indents + 1).join(pp) + "');")
      if (block || attrs.length || attrsBlocks.length) {

        this.buf.push(name + '.call({');

        if (block) {
          this.buf.push('block: function(){');

          // Render block with no indents, dynamically added when rendered
          this.parentIndents++;
          var _indents = this.indents;
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
            var val = this.attrs(attrs);
            attrsBlocks.unshift(val);
          }
          if (attrsBlocks.length > 1) {
            this.buf.push('attributes: ' + this.runtime('merge') + '([' + attrsBlocks.join(',') + '])');
          } else {
            this.buf.push('attributes: ' + attrsBlocks[0]);
          }
        } else if (attrs.length) {
          var val = this.attrs(attrs);
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
      if (pp) this.buf.push("pug_indent.pop();")
    } else {
      var mixin_start = this.buf.length;
      args = args ? args.split(',') : [];
      var rest;
      if (args.length && /^\.\.\./.test(args[args.length - 1].trim())) {
        rest = args.pop().trim().replace(/^\.\.\./, '');
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
      var mixin_end = this.buf.length;
      this.mixins[key].instances.push({start: mixin_start, end: mixin_end});
    }
    */
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
    if (tag.name == 'p') {
      this.pushWithIndent(`\\beginParagraph`);
      this.parentIndents++;
      this.visit(tag.block, tag);
      this.parentIndents--;
      this.pushWithIndent(`\\endParagraph`);
      return;
    } else {
      this.pushWithIndent(
        `\\beginStyle(-> XmlTree --> elementName "${tag.name}" --> xmlNamespace YSEOP_TEXT_NAMESPACE;)`,
      );
      this.parentIndents++;
      this.visit(tag.block, tag);
      this.parentIndents--;
      this.pushWithIndent(`\\endStyle`);
      return;
    }
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
    // debug(text);
    if (text.val != '\n' && text.val.trim() != '') {
      // \n or only spaces
      this.pushWithIndent(text.val.trim());
    }
  },

  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */

  visitComment: function (comment) {
    this.pushWithIndent(`// ${comment.val.trim()}`);
  },

  /**
   * Visit a `YieldBlock`.
   *
   * This is necessary since we allow compiling a file with `yield`.
   *
   * @param {YieldBlock} block
   * @api public
   */

  visitYieldBlock: function (block) {},

  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */

  visitBlockComment: function (comment) {
    this.pushWithIndent('/*');
    this.visit(comment.block, comment);
    this.pushWithIndent('*/');
  },

  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */

  visitInsertValue: function (val) {
    var val = val.trim();
    if (val != `''` && val != `""`) {
      // ignore empty inserts sometimes used in Pug / RosaeNLG
      this.pushWithIndent(`\\value(${val}) /* TODO MIGRATE VALUE */`);
    }
  },

  visitCode: function (code) {
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control

    // Buffer code

    // debug(code);

    if (code.buffer) {
      this.visitInsertValue(code.val);
    } else {
      this.pushWithIndent('/* TODO MIGRATE CODE');
      this.parentIndents++;

      const lines = code.val.split('\n');
      for (let i = 0; i < lines.length; i++) {
        this.pushWithIndent(lines[i]);
      }

      this.parentIndents--;
      this.pushWithIndent('*/');
    }

    // Block support
    if (code.block) {
      if (!code.buffer) this.buf.push('{');
      this.visit(code.block, code);
      if (!code.buffer) this.buf.push('}');
    }
  },

  pushWithIndent: function (toPush) {
    const where = this.currentMixin ? this.currentMixin : '_MAIN';
    if (!this.mixins.hasOwnProperty(where)) {
      this.mixins[where] = [];
    }
    this.mixins[where].push('  '.repeat(this.parentIndents) + toPush);
  },

  /**
   * Visit `Conditional`.
   *
   * @param {Conditional} cond
   * @api public
   */

  visitConditional: function (cond) {
    let test = cond.test;

    // manage the hasSaid => keyval check
    test = test.replace(/hasSaid\(\'([a-zA-Z]+)\'\)/, 'TEXT_CONTENT_EXECUTION_CONTEXT.getKeyVal("$1")==true');

    this.pushWithIndent('\\if (' + test + ') /* TODO migrate condition */');

    this.parentIndents++;
    this.visit(cond.consequent, cond);
    this.parentIndents--;

    if (cond.alternate) {
      if (cond.alternate.type === 'Conditional') {
        this.pushWithIndent('\\else');
        this.parentIndents++;
        this.visitConditional(cond.alternate);
        this.parentIndents--;
      } else {
        this.pushWithIndent('\\else');
        this.parentIndents++;
        this.visit(cond.alternate, cond);
        this.parentIndents--;
        this.pushWithIndent('\\endIf');
      }
    } else {
      this.pushWithIndent('\\endIf');
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
    // debug(node);

    const decomposedAssembly = this.decomposeAssembly(node.asm);

    let foreach = `\\foreach(${node.elt}, ${node.list}, ${decomposedAssembly.yseopAssembly})`;
    if (decomposedAssembly.hasLeft) {
      foreach += ` /* TODO MIGRATE foreach ${decomposedAssembly.left} */`;
    } else {
      foreach += ` /* TODO MIGRATE foreach */`;
    }
    this.pushWithIndent(foreach);

    this.parentIndents++;
    this.visit(node.block, node);
    this.parentIndents--;
    this.pushWithIndent(`\\endForeach`);
  },

  visitChoosebest: function (node) {
    // console.log(`visitChoosebest: ${node.params}`);
    this.pushWithIndent(`/* INFO a RosaeNLG choosebest mixin present here with params ${node.params} */`);
    this.visit(node.block, node);
  },

  visitProtect: function (node) {
    const msg = 'should be protected from automatic punctuation etc.';
    this.pushWithIndent(`/* START ${msg} */`);
    this.visit(node.block, node);
    this.pushWithIndent(`/* END ${msg} */`);
  },

  visitRecordSaid: function (node) {
    // in Yseop Symbols should be used vs strings in RosaeNLG
    const val = node.val.replace(/\'/g, '').replace('(', '').replace(')', '');
    this.pushWithIndent(`\\setKeyVal("${val}", true)`);
    this.visit(node.block, node);
  },

  visitDeleteSaid: function (node) {
    const val = node.val.replace(/\'/g, '').replace('(', '').replace(')', '');
    this.pushWithIndent(`\\setKeyVal("${val}", null)`);
    this.visit(node.block, node);
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
    const foreach = `\\foreach(${each.val}, ${each.obj}) /* TODO MIGRATE foreach */`;
    this.pushWithIndent(foreach);

    this.parentIndents++;
    this.visit(each.block, each);
    this.parentIndents--;
    this.pushWithIndent(`\\endForeach`);
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
        );
      } else {
        this.bufferExpression(this.runtime('attrs') + '(' + attributeBlocks[0] + ', ' + stringify(this.terse) + ')');
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
