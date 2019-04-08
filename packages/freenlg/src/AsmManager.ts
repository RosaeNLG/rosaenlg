import { RandomManager } from "./RandomManager";
import { SaveRollbackManager } from "./SaveRollbackManager";

import * as Debug from "debug";
const debug = Debug("freenlg");

enum positions {
  BEGIN,
  END,
  SEP,
  OTHER
};


export class AsmManager {
  saveRollbackManager: SaveRollbackManager;
  randomManager: RandomManager;
  spy: Spy;

  constructor(params: any) {
    this.saveRollbackManager = params.saveRollbackManager;
    this.randomManager = params.randomManager;
  
  }

  //-------------- HELPERS, COMMON

  /*
    array of elements to list
    mixin to call for each elt
    asm
    params just pass through
  */
  foreach(elts: Array<any>, mixinFct: string, asm: any, params: any) {
    if ( asm==null || asm.mode==null || ['single_sentence', 'sentences', 'paragraphs'].indexOf(asm.mode)>-1 ) {
      // ok
    } else {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `asm mode is not valid: ${asm.mode}`;
      throw err;
    }

    let targetMixin: string = mixinFct!=null ? mixinFct : "value";
    // debug('aaaa' + targetMixin);

    let nonEmptyElts: Array<any> = [];

    // 0..length sequence
    let eltsToTest = Array.from(Array( elts.length ).keys());

    // we have to mix BEFORE testing
    if (asm!=null && asm.mix==true) {
      this.mix(eltsToTest);
    }

    // start
    this.saveRollbackManager.saveSituation('isEmpty');

    for (let i=0; i<eltsToTest.length; i++) {
      let elt = elts[ eltsToTest[i] ];
      if (!this.mixinIsEmpty(targetMixin, elt, params)) {
        nonEmptyElts.push(elt);
      }
    }

    this.saveRollbackManager.rollback();

    this.listStuff(targetMixin, nonEmptyElts, asm, params);
  }

  /*
    size: to generate a sequence
  */
  assemble(which: string, asm: any, size: number, params: any) {
    //console.log('START ASSEMBLE');

    // 0..length sequence
    let eltsToList = Array.from(Array( size ).keys());

    this.foreach(eltsToList, which, asm, params);
  }


  mixinIsEmpty(mixinFct: string, param1: any, params: any) {
    
    let html_before: string = this.spy.getPugHtml();

    this.spy.getPugMixins()[mixinFct](param1, params);

    // test
    // debug('before: ' + html_before);
    // debug('after: ' + this.spy.getPugHtml());
    let isEmpty: boolean = html_before==this.spy.getPugHtml() ? true : false;

    return isEmpty;
  }


  listStuff(which: string, nonEmpty: Array<any>, asm: any, params: any): void {
    // call one or the other
    let toCall: string = asm!=null && ( asm.mode=='sentences' || asm.mode=='paragraphs' ) ? 'listStuffSentences' : 'listStuffSingleSentence';
    this[toCall](which, nonEmpty, asm, params);
  }

  isMixin(name: string): boolean {
    return this.spy.getPugMixins()[name]!=null ? true : false;
  }

  outputStringOrMixin_helper(name: string, params: any): void {
    if ( this.isMixin(name) ) {
      this.spy.getPugMixins()[name](params);
    } else {
      this.spy.getPugMixins()['insertVal'](name);
    }
  }


  outputStringOrMixin(name: string, position: positions, params: any): void {
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
    switch(position) {
      case positions.BEGIN:
        this.outputStringOrMixin_helper(name, params);
        this.spy.appendDoubleSpace();
        break;
      case positions.END:
        this.spy.appendDoubleSpace();
        this.outputStringOrMixin_helper(name, params);
        break;
      case positions.SEP:
        this.spy.appendDoubleSpace();
        this.outputStringOrMixin_helper(name, params);
        this.spy.appendDoubleSpace();
        break;
      case positions.OTHER:
        this.outputStringOrMixin_helper(name, params);
        break;
    }
  }


  //-------------- MULTIPLE SENTENCES


  isDot(str: string): boolean {
    return /^\s*\.\s*$/.test(str);
  }

  getBeginWith(param: string | Array<string>, index: number): string {
    if (param==null) {
      return null;
    } else if (typeof param === 'string' || param instanceof String) {
      //- if it is a string: we take it, but only once
      //- if it is a mixin: we take it each time
      if (index==0 || this.isMixin(<string>param)) {
        return <string>param;
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

    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `invalid begin_with_general: ${JSON.stringify(param)}`;
    throw err;
  }

  listStuffSentences_helper(beginWith: string, params: any, elt, which: string, asm: any, index: number, size: number): void {
    if (beginWith!=null) {
      this.outputStringOrMixin(beginWith, positions.BEGIN, params);
    }
    this.spy.getPugMixins()[which](elt, params);
    this.insertSeparatorSentences(asm, index, size, params);
    //- could set pTriggered to true but no read afterwards
  }


  insertSeparatorSentences(asm: any, index: number, size: number, params: any): void {
    //- at the end, after the last output
    if (index+1==size) {
      if (asm.separator) {
        //- we try to avoid </p>. in the output
        if (!this.isDot(asm.separator)) {
          this.outputStringOrMixin(asm.separator, positions.END, params);
        } else {
          // pug_mixins.flushBuffer(); <= was this really useful?
          if (!this.spy.getPugHtml().endsWith('</p>')) {
            //-| #{'|'+getBufferLastChars(4)+'|'}
            this.outputStringOrMixin(asm.separator, positions.OTHER, params);
          }
        }
      }
    } else if (index+1==size-1) {
      if (asm.last_separator) {
        this.outputStringOrMixin(asm.last_separator, positions.SEP, params);
      } else if (asm.separator) {
        this.outputStringOrMixin(asm.separator, positions.SEP, params);
      }
    //- normal one
    } else if (index+1<size-1 && asm.separator) {
      this.outputStringOrMixin(asm.separator, positions.SEP, params);
    }
  }


  listStuffSentences(which: string, nonEmpty: Array<any>, asm: any, params: any): void {
    // debug(nonEmpty);
    let size = nonEmpty.length;

    if (!params) {
      params = {};
    }
    
    // make it available in params
    params.nonEmpty = nonEmpty;

    if (nonEmpty.length==0 && asm!=null && asm.if_empty!=null) {
      this.outputStringOrMixin(asm.if_empty, positions.OTHER, params);
    }
    
    for (let index=0; index<nonEmpty.length; index++) {

      //- begin
      let beginWith = null;
      if (asm!=null) {
        if (index==0) {
          if (asm.begin_with_1!=null && nonEmpty.length==1) {
            beginWith = asm.begin_with_1;
          } else if (asm.begin_with_general!=null) {
            beginWith = this.getBeginWith(asm.begin_with_general, 0);
          }
        } else if (index==size-2) {
          if (asm.begin_last_1!=null) {
            beginWith = asm.begin_last_1;
          } else {
            beginWith = this.getBeginWith(asm.begin_with_general, index);
          }        
        } else if (index==size-1) {
          if (asm.begin_last!=null) {
            beginWith = asm.begin_last;
          } else {
            beginWith = this.getBeginWith(asm.begin_with_general, index);
          }
        } else {
          beginWith = this.getBeginWith(asm.begin_with_general, index);
        }
      }
      
      //- the actual content
      // debug(asm);

      if (asm!=null && asm.mode=='paragraphs') {
        this.spy.getPugMixins().insertValUnescaped('<p>');
        this.listStuffSentences_helper(beginWith, params, nonEmpty[index], which, asm, index, size);
        this.spy.getPugMixins().insertValUnescaped('</p>');
      } else {
        this.spy.appendDoubleSpace();
        this.listStuffSentences_helper(beginWith, params, nonEmpty[index], which, asm, index, size);
        this.spy.appendDoubleSpace();
      }

      //-end
      if (index==size-1) {
        if (asm.end!=null && this.isDot(asm.end)) {
          var err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `when assembles is paragraph, the end is ignored when it is a dot.`;
          throw err;
        }
      }
    }

  }


  //-------------- SINGLE SENTENCE

  insertSeparatorSingleSentence(asm: any, index: number, size: number, params: any): void {
    if (asm) {
      //- last separator
      if (index+1==size-1) {
        if (asm.last_separator) {
          this.outputStringOrMixin(asm.last_separator, positions.SEP, params);
        } else if (asm.separator) {
          this.outputStringOrMixin(asm.separator, positions.SEP, params);
        }
      //- normal one
      } else if (index+1<size-1 && asm.separator) {
        this.outputStringOrMixin(asm.separator, positions.SEP, params);
      }
    }
  }

  listStuffSingleSentence(which: string, nonEmpty: Array<any>, asm: any, params: any) {

    let size: number = nonEmpty.length;

    if (!params) params = {};
    // make it available in params
    params.nonEmpty = nonEmpty;

    if (nonEmpty.length==0 && asm!=null && asm.if_empty!=null) {
      this.outputStringOrMixin(asm.if_empty, positions.OTHER, params);
    }

    for (let index=0; index<nonEmpty.length; index++) {

      //- begin
      let beginWith: string = null; // strange to have to put null here
      if (index==0 && asm!=null) {
        if (asm.begin_with_1!=null && nonEmpty.length==1) {
          beginWith = asm.begin_with_1;
        } else if (asm.begin_with_general!=null) {
          beginWith = asm.begin_with_general;
        }
      }
      
      //- the actual content
      if (beginWith!=null) {
        this.outputStringOrMixin(beginWith, positions.BEGIN, params);
      }

      this.spy.appendDoubleSpace();
      this.spy.appendDoubleSpace();
      this.spy.getPugMixins()[which](nonEmpty[index], params);
      this.spy.appendDoubleSpace();
      this.insertSeparatorSingleSentence(asm, index, size, params);

      //-end
      if (index==size-1) {
        if (asm!=null && asm.end!=null) {
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
  mix(a: Array<any>): void {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(this.randomManager.getNextRnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
  }

}




