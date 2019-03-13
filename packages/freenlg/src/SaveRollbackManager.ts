import { SaidManager } from "./SaidManager";
import { RefsManager, NextRef } from "./RefsManager";
import { GenderNumberManager } from "./GenderNumberManager";
import { RandomManager } from "./RandomManager";
import { SynManager } from "./SynManager";
import { NlgLib } from "./NlgLib";

import * as Debug from "debug";
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

  constructor(params: any) {
    this.htmlBefore = params.htmlBefore;
    this.context = params.context;
    this.has_said = Object.assign({}, params.has_said);
    this.triggered_refs = new Map(params.triggered_refs);
    this.ref_gender = new Map(params.ref_gender);
    this.ref_number = new Map(params.ref_number);
    this.rndNextPos = params.rndNextPos;
    this.next_refs = new Map(params.next_refs);
    this.synoSeq = new Map(params.synoSeq);

  }
}

export class SaveRollbackManager {

  save_points: Array<SavePoint>;
  parent: NlgLib;

  spy: Spy;

  saidManager: SaidManager;
  refsManager: RefsManager;
  genderNumberManager: GenderNumberManager;
  randomManager: RandomManager;
  synManager: SynManager;

  constructor(parent: NlgLib) {
    this.save_points = [];
    this.parent = parent;
  }

  bindObjects(params: any): void {
    this.saidManager = params.saidManager;
    this.refsManager = params.refsManager;
    this.genderNumberManager = params.genderNumberManager;
    this.randomManager = params.randomManager;
    this.synManager = params.synManager;
  }

  /*
  deleteRollback(): void {
    this.save_points.pop();
  }
  */

  saveSituation(params: any): void {
    // debug('SAVING DATA');
    // debug(this.spy);
    
    let savePoint: SavePoint = new SavePoint({
      htmlBefore: this.spy.getPugHtml(),
      context: params.context,
      has_said: Object.assign({}, this.saidManager.has_said),
      triggered_refs: new Map(this.refsManager.triggered_refs),
      ref_gender: new Map(this.genderNumberManager.ref_gender),
      ref_number: new Map( this.genderNumberManager.ref_number ),
      rndNextPos: this.randomManager.rndNextPos,
      next_refs: new Map(this.refsManager.next_refs),
      synoSeq: new Map(this.synManager.synoSeq)
    });
    
    // debug('WHEN SAVING: ' + JSON.stringify(this.save_points));
    
    this.save_points.push(savePoint);
  
    if (savePoint.context=='isEmpty') {
      this.parent.isEvaluatingEmpty = true;
    } else if (savePoint.context=='nextRep') {
      this.parent.isEvaluatingNextRep = true; 
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
  
    if (savePoint.context=='isEmpty') {
      this.parent.isEvaluatingEmpty = false;
    } else if (savePoint.context=='nextRep') {
      this.parent.isEvaluatingNextRep = false; 
    }
  
    this.spy.setPugHtml(savePoint.htmlBefore);
  }

}

