import { SaidManager } from "./SaidManager";
import { RefsManager, NextRef } from "./RefsManager";
import { GenderNumberManager } from "./GenderNumberManager";
import { RandomManager } from "./RandomManager";
import { SynManager } from "./SynManager";
import { VerbsManager } from "./VerbsManager";

import * as Debug from "debug";
import { throwStatement } from "babel-types";
const debug = Debug("freenlg");

class SavePoint {
  
  htmlBefore: string;
  context: string;
  has_said: any;
  triggered_refs: Map<any, boolean>;
  next_refs: Map<any, NextRef>;
  ref_gender: Map<any, 'M'|'F'|'N'>;
  ref_number: Map<any, 'S'|'P'>;
  rndNextPos: number;
  synoSeq: Map<string, number>;
  verb_parts: string[];


  constructor(params: any) {
    // here we have to copy
    this.htmlBefore = params.htmlBefore;
    this.context = params.context;
    this.has_said = Object.assign({}, params.has_said);
    this.triggered_refs = new Map(params.triggered_refs);
    this.ref_gender = new Map(params.ref_gender);
    this.ref_number = new Map(params.ref_number);
    this.rndNextPos = params.rndNextPos;
    this.next_refs = new Map(params.next_refs);
    this.synoSeq = new Map(params.synoSeq);
    this.verb_parts = params.verb_parts.slice(0);
  }
}

export class SaveRollbackManager {

  save_points: Array<SavePoint>;

  spy: Spy;

  saidManager: SaidManager;
  refsManager: RefsManager;
  genderNumberManager: GenderNumberManager;
  randomManager: RandomManager;
  synManager: SynManager;
  verbsManager: VerbsManager;

  isEvaluatingEmpty: boolean;
  isEvaluatingNextRep: boolean;
  isEvaluatingChoosebest: boolean;

  constructor() {
    this.save_points = [];
  }

  bindObjects(params: any): void {
    this.saidManager = params.saidManager;
    this.refsManager = params.refsManager;
    this.genderNumberManager = params.genderNumberManager;
    this.randomManager = params.randomManager;
    this.synManager = params.synManager;
    this.verbsManager = params.verbsManager;
  }

  /*
  deleteRollback(): void {
    this.save_points.pop();
  }
  */

  saveSituation(context: 'isEmpty'|'nextRep'|'choosebest'): void {
    // debug('SAVING DATA');
    // debug(this.spy);
    
    // no need to copy the objects here, just give their reference
    let savePoint: SavePoint = new SavePoint({
      htmlBefore: this.spy.getPugHtml(),
      context: context,
      has_said: this.saidManager.has_said,
      triggered_refs: this.refsManager.triggered_refs,
      ref_gender: this.genderNumberManager.ref_gender,
      ref_number: this.genderNumberManager.ref_number,
      rndNextPos: this.randomManager.rndNextPos,
      next_refs: this.refsManager.next_refs,
      synoSeq: this.synManager.synoSeq,
      verb_parts: this.verbsManager.verb_parts
    });
    
    // debug('WHEN SAVING: ' + JSON.stringify(this.save_points));
    
    this.save_points.push(savePoint);

    switch(savePoint.context) {
      case 'isEmpty':
        this.isEvaluatingEmpty = true;
      case 'nextRep':
        this.isEvaluatingNextRep = true; 
      case 'choosebest':
        this.isEvaluatingChoosebest = true; 
    }
    
  }
  
  rollback(): void {
    // debug('ROLLBACK DATA');
    // debug('ROLLBACK DATA: size ' + this.save_points.length);
    let savePoint: SavePoint = this.save_points.pop();
    
    // debug('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
    // there's no point in creating new maps here: we just reuse the ones we created before
    this.saidManager.has_said = savePoint.has_said;
    this.refsManager.triggered_refs = savePoint.triggered_refs;
    this.genderNumberManager.ref_gender = savePoint.ref_gender;
    this.genderNumberManager.ref_number = savePoint.ref_number;  
    this.randomManager.rndNextPos = savePoint.rndNextPos;
    this.refsManager.next_refs = savePoint.next_refs;
    this.synManager.synoSeq = savePoint.synoSeq;
    this.verbsManager.verb_parts = savePoint.verb_parts;
  
    switch(savePoint.context) {
      case 'isEmpty':
        this.isEvaluatingEmpty = false;
      case 'nextRep':
        this.isEvaluatingNextRep = false; 
      case 'choosebest':
        this.isEvaluatingChoosebest = false; 
    }

    this.spy.setPugHtml(savePoint.htmlBefore);
  }

}

