/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RandomManager } from './RandomManager';
import { ValueManager } from './ValueManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { Helper } from './Helper';
import { SpyI } from './Spy';

type ListType = 'ul' | 'ol';
type HtmlSuffix = 'block' | 'inline';

type MixinFctOrString = MixinFct | string;

export interface Asm {
  mode: 'single_sentence' | 'sentences' | 'paragraphs' | 'list';
  mix?: boolean;
  assembly: (len: number, nonEmptyElts: number[]) => Asm; // when is dynamic
  separator?: MixinFctOrString;
  last_separator?: MixinFctOrString;
  if_empty?: MixinFctOrString;
  begin_with_1?: MixinFctOrString;
  begin_with_general?: MixinFctOrString;
  begin_last_1?: MixinFctOrString;
  begin_last?: MixinFctOrString;
  end?: MixinFctOrString;
  // when 'list'
  list_capitalize?: boolean;
  list_end_item?: MixinFctOrString;
  list_type?: ListType;
  list_intro?: MixinFctOrString;
}

enum positions {
  BEGIN,
  END,
  SEP,
  OTHER,
}

type MixinFct = (elt: any, extraParams?: any) => void;

export class AsmManager {
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private valueManager: ValueManager;
  private helper: Helper;
  private spy: SpyI;

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  public constructor(
    saveRollbackManager: SaveRollbackManager,
    randomManager: RandomManager,
    valueManager: ValueManager,
    helper: Helper,
  ) {
    this.saveRollbackManager = saveRollbackManager;
    this.randomManager = randomManager;
    this.valueManager = valueManager;
    this.helper = helper;
  }

  //-------------- HELPERS, COMMON

  /*
    array of elements to list
    mixin to call for each elt
    asm
    params just pass through
  */

  private runMixinOrValue(mixinFct: MixinFct, elt: any, params: any): void {
    if (mixinFct) {
      mixinFct(elt, params);
    } else {
      this.valueManager.value(elt, params);
    }
  }

  private foreach(elts: any[], mixinFct: MixinFct, asm: Asm, params: any): void {
    if (
      !asm ||
      asm.assembly != null ||
      !asm.mode ||
      ['single_sentence', 'sentences', 'paragraphs', 'list'].indexOf(asm.mode) > -1
    ) {
      // ok
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `asm mode is not valid: ${asm.mode}`;
      throw err;
    }

    const nonEmptyElts: any[] = [];

    // 0..length sequence
    const eltsToTest = Array.from(Array(elts.length).keys());

    // we have to mix BEFORE testing
    if (asm && asm.mix) {
      this.mix(eltsToTest);
    }

    // start
    this.saveRollbackManager.saveSituation('isEmpty');

    for (const eltToTest of eltsToTest) {
      const elt = elts[eltToTest];
      if (!this.mixinIsEmpty(mixinFct, elt, params)) {
        nonEmptyElts.push(elt);
      }
    }

    this.saveRollbackManager.rollback();

    // get the real asm if dynamic
    let finalAsm: Asm = asm;
    if (asm && asm.assembly != null) {
      finalAsm = asm.assembly(nonEmptyElts.length, nonEmptyElts);
    }

    this.listStuff(mixinFct, nonEmptyElts, finalAsm, params);
  }

  /*
    size: to generate a sequence
  */
  public assemble(which: MixinFct, asm: Asm, size: number, params: any): void {
    // 0..length sequence
    const eltsToList = Array.from(Array(size).keys());

    this.foreach(eltsToList, which, asm, params);
  }

  private mixinIsEmpty(mixinFct: MixinFct, param1: any, params: any): boolean {
    const htmlBefore: string = this.spy.getPugHtml();
    this.runMixinOrValue(mixinFct, param1, params);
    return this.helper.htmlHasNotChanged(htmlBefore);
  }

  private listStuff(which: MixinFct, nonEmpty: any[], asm: Asm, params: any): void {
    // call one or the other
    if (asm && (asm.mode === 'sentences' || asm.mode === 'paragraphs' || asm.mode === 'list')) {
      this.listStuffSentences(which, nonEmpty, asm, params);
    } else {
      this.listStuffSingleSentence(which, nonEmpty, asm, params);
    }
  }

  private isMixin(name: MixinFctOrString): boolean {
    if (typeof name === 'string' || name instanceof String) {
      return false;
    } else {
      // is 'function'
      return true;
    }
  }

  private outputStringOrMixinHelper(name: MixinFctOrString, params: any): void {
    if (this.isMixin(name)) {
      (name as MixinFct)(params);
    } else {
      this.helper.insertValEscaped(name as string);
    }
  }

  private outputStringOrMixin(name: MixinFctOrString, position: positions, params: any): void {
    /*
      should add spaces BEFORE AND AFTER if not present:
        last_separator
        separator
      should add a space AFTER if not present:
        begin_with_general
        begin_with_1
      should add space BEFORE if not present:
        end
    */
    switch (position) {
      case positions.BEGIN: {
        this.outputStringOrMixinHelper(name, params);
        this.helper.appendDoubleSpace();
        break;
      }
      case positions.END: {
        this.helper.appendDoubleSpace();
        this.outputStringOrMixinHelper(name, params);
        break;
      }
      case positions.SEP: {
        this.helper.appendDoubleSpace();
        this.outputStringOrMixinHelper(name, params);
        this.helper.appendDoubleSpace();
        break;
      }
      case positions.OTHER: {
        this.outputStringOrMixinHelper(name, params);
        break;
      }
    }
  }

  //-------------- MULTIPLE SENTENCES

  private isDot(str: string): boolean {
    return str.trim() === '.';
  }

  private getBeginWithElement(param: MixinFctOrString | string[], index: number): string {
    if (!param) {
      return null;
    } else if (typeof param === 'string' || param instanceof String || typeof param === 'function') {
      // if it is a string: we take it, but only once
      // if it is a mixin: we take it each time
      if (index === 0 || this.isMixin(param as MixinFctOrString)) {
        return param as string;
      } else {
        return null;
      }
    } else if (param instanceof Array) {
      if (index < param.length) {
        return param[index];
      } else {
        return null;
      }
    }

    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `invalid begin_with_general: ${JSON.stringify(param)}`;
    throw err;
  }

  private listStuffSentencesHelper(
    beginWith: MixinFctOrString,
    params: any,
    elt: any,
    which: MixinFct,
    asm: Asm,
    index: number,
    size: number,
  ): void {
    if (beginWith != null) {
      this.outputStringOrMixin(beginWith, positions.BEGIN, params);
    }
    this.runMixinOrValue(which, elt, params);
    this.insertSeparatorSentences(asm, index, size, params);
    //- could set pTriggered to true but no read afterwards
  }

  private insertSeparatorSentences(asm: Asm, index: number, size: number, params: any): void {
    //- at the end, after the last output
    switch (index + 1) {
      case size: {
        if (asm.separator) {
          //- we try to avoid </p>. in the output
          if (!this.isMixin(asm.separator) && !this.isDot(asm.separator as string)) {
            this.outputStringOrMixin(asm.separator, positions.END, params);
          } else {
            // pug_mixins.flushBuffer(); <= was this really useful?
            // if (!/<\/p>(\\s¤)*$/.test(this.spy.getPugHtml())) {
            // if (!this.spy.getPugHtml().endsWith('</p>')) {
            //-| #{'|'+getBufferLastChars(4)+'|'}
            this.outputStringOrMixin(asm.separator, positions.OTHER, params);
            // }
          }
        }
        break;
      }
      case size - 1: {
        if (asm.last_separator) {
          this.outputStringOrMixin(asm.last_separator, positions.SEP, params);
        } else if (asm.separator) {
          this.outputStringOrMixin(asm.separator, positions.SEP, params);
        }
        break;
      }
      default: {
        if (asm.separator) {
          this.outputStringOrMixin(asm.separator, positions.SEP, params);
        }
        break;
      }
    }
  }

  private getBeginningOfElement(asm: Asm, size: number, index: number): MixinFctOrString {
    // NB asm cannot be null here as explicitely sentence or paragraph mode
    if (index === 0) {
      if (asm.begin_with_1 != null && size === 1) {
        return asm.begin_with_1;
      } else if (asm.begin_with_general != null) {
        return this.getBeginWithElement(asm.begin_with_general, 0);
      }
    } else if (index === size - 2) {
      if (asm.begin_last_1) {
        return asm.begin_last_1;
      } else {
        return this.getBeginWithElement(asm.begin_with_general, index);
      }
    } else if (index === size - 1) {
      if (asm.begin_last != null) {
        return asm.begin_last;
      } else {
        return this.getBeginWithElement(asm.begin_with_general, index);
      }
    } else {
      return this.getBeginWithElement(asm.begin_with_general, index);
    }
  }

  private getListType(asm: Asm): ListType {
    return asm.list_type || 'ul';
  }

  private getListHtmlSuffix(asm: Asm): HtmlSuffix {
    return asm.list_capitalize ? 'block' : 'inline';
  }

  private listPutStart(asm: Asm): void {
    if (asm.list_intro != null) {
      this.outputStringOrMixin(asm.list_intro, positions.OTHER, null);
    }
    this.helper.insertValUnescaped(`<${this.getListType(asm)}_${this.getListHtmlSuffix(asm)}>`);
  }

  private listPutEnd(asm: Asm): void {
    this.helper.insertValUnescaped(`</${this.getListType(asm)}>`);
  }

  private listStuffSentences(which: MixinFct, nonEmpty: any[], asm: Asm, params: any): void {
    if (asm.mode === 'paragraphs' && asm.end != null && !this.isMixin(asm.end) && this.isDot(asm.end as string)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `when assemble mode is paragraph, the end is ignored when it is a dot.`;
      throw err;
    }

    const size = nonEmpty.length;

    if (!params) {
      params = {};
    }

    // make it available in params
    params.nonEmpty = nonEmpty;

    if (size === 0 && asm && asm.if_empty != null) {
      this.outputStringOrMixin(asm.if_empty, positions.OTHER, params);
    }

    if (asm.mode === 'list') {
      this.listPutStart(asm);
    }

    for (let index = 0; index < size; index++) {
      // begin
      const beginWith = this.getBeginningOfElement(asm, size, index);

      //- the actual content

      switch (asm.mode) {
        case 'paragraphs': {
          this.helper.insertValUnescaped('<p>');
          this.listStuffSentencesHelper(beginWith, params, nonEmpty[index], which, asm, index, size);
          this.helper.insertValUnescaped('</p>');
          break;
        }
        case 'sentences': {
          this.helper.appendDoubleSpace();
          this.listStuffSentencesHelper(beginWith, params, nonEmpty[index], which, asm, index, size);
          this.helper.appendDoubleSpace();
          break;
        }
        case 'list': {
          this.helper.insertValUnescaped(`<li_${this.getListHtmlSuffix(asm)}>`);
          this.listStuffSentencesHelper(beginWith, params, nonEmpty[index], which, asm, index, size);
          if (asm.list_end_item != null) {
            this.outputStringOrMixin(asm.list_end_item, positions.END, null);
          }
          this.helper.insertValUnescaped(`</li_${this.getListHtmlSuffix(asm)}>`);
          break;
        }
      }
    }

    if (asm.mode === 'list') {
      this.listPutEnd(asm);
    }
  }

  //-------------- SINGLE SENTENCE

  private insertSeparatorSingleSentence(asm: Asm, index: number, size: number, params: any): void {
    if (asm) {
      //- last separator
      if (index + 1 === size - 1) {
        if (asm.last_separator) {
          this.outputStringOrMixin(asm.last_separator, positions.SEP, params);
        } else if (asm.separator) {
          this.outputStringOrMixin(asm.separator, positions.SEP, params);
        }
        //- normal one
      } else if (index + 1 < size - 1 && asm.separator) {
        this.outputStringOrMixin(asm.separator, positions.SEP, params);
      }
    }
  }

  private singleSentenceGetBeginning(asm: Asm, size: number): MixinFctOrString {
    if (asm) {
      if (asm.begin_with_1 != null && size === 1) {
        return asm.begin_with_1;
      } else if (asm.begin_with_general != null) {
        return asm.begin_with_general;
      }
    } else {
      return null;
    }
  }

  private listStuffSingleSentence(which: MixinFct, nonEmpty: any[], asm: Asm, params: any): void {
    const size: number = nonEmpty.length;

    if (!params) {
      params = {};
    }
    // make it available in params
    params.nonEmpty = nonEmpty;

    if (size === 0 && asm && asm.if_empty != null) {
      this.outputStringOrMixin(asm.if_empty, positions.OTHER, params);
    }

    for (let index = 0; index < size; index++) {
      //- begin
      if (index === 0) {
        const beginWith = this.singleSentenceGetBeginning(asm, size);
        if (beginWith != null) {
          this.outputStringOrMixin(beginWith, positions.BEGIN, params);
        }
      }

      //- the actual content
      this.helper.appendDoubleSpace();
      this.helper.appendDoubleSpace();
      this.runMixinOrValue(which, nonEmpty[index], params);
      this.helper.appendDoubleSpace();
      this.insertSeparatorSingleSentence(asm, index, size, params);

      //-end
      if (index === size - 1) {
        if (asm && asm.end != null) {
          this.outputStringOrMixin(asm.end, positions.END, params);
        }
      }
    }
  }

  /**
   * Mixes array in place. ES6 version
   * @param {Array} a items An array containing the items.
   * I do not use the shuffle included in random-js because I need to use my own getNextRnd function
   */
  private mix(a: any[]): void {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomManager.getNextRnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
}
