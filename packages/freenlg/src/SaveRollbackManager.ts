import { SaidManager, HasSaidMap } from './SaidManager';
import { GenderNumberManager, RefGenderMap, RefNumberMap } from './GenderNumberManager';
import { RandomManager } from './RandomManager';
import { SynManager, SynoSeq } from './SynManager';
import { VerbsManager, VerbParts } from './VerbsManager';
import { RefsManager, TriggeredRefs, NextRefs } from './RefsManager';

//import * as Debug from 'debug';
//const debug = Debug('freenlg');

export type SaveSituationContext = 'isEmpty' | 'nextRep' | 'choosebest';

class SavePoint {
  public htmlBefore: string;
  public context: SaveSituationContext;
  public hasSaid: HasSaidMap;
  public triggeredRefs: TriggeredRefs;
  public nextRefs: NextRefs;
  public refGenderMap: RefGenderMap;
  public refNumberMap: RefNumberMap;
  public rndNextPos: number;
  public synoSeq: SynoSeq;
  public verbParts: VerbParts;

  public constructor(
    htmlBefore: string,
    context: SaveSituationContext,
    hasSaid: HasSaidMap,
    triggeredRefs: TriggeredRefs,
    refGenderMap: RefGenderMap,
    refNumberMap: RefNumberMap,
    rndNextPos: number,
    nextRefs: NextRefs,
    synoSeq: SynoSeq,
    verbParts: VerbParts,
  ) {
    // here we have to copy
    this.htmlBefore = htmlBefore;
    this.context = context;
    this.hasSaid = Object.assign({}, hasSaid);
    this.triggeredRefs = new Map(triggeredRefs);
    this.refGenderMap = new Map(refGenderMap);
    this.refNumberMap = new Map(refNumberMap);
    this.rndNextPos = rndNextPos;
    this.nextRefs = new Map(nextRefs);
    this.synoSeq = new Map(synoSeq);
    this.verbParts = verbParts.slice(0);
  }
}

export class SaveRollbackManager {
  private savePoints: SavePoint[];

  private spy: Spy;

  private saidManager: SaidManager;
  private refsManager: RefsManager;
  private genderNumberManager: GenderNumberManager;
  private randomManager: RandomManager;
  private synManager: SynManager;
  private verbsManager: VerbsManager;

  public isEvaluatingEmpty: boolean;
  public isEvaluatingNextRep: boolean;
  public isEvaluatingChoosebest: boolean;

  public constructor() {
    this.savePoints = [];
  }

  public bindObjects(
    saidManager: SaidManager,
    refsManager: RefsManager,
    genderNumberManager: GenderNumberManager,
    randomManager: RandomManager,
    synManager: SynManager,
    verbsManager: VerbsManager,
  ): void {
    this.saidManager = saidManager;
    this.refsManager = refsManager;
    this.genderNumberManager = genderNumberManager;
    this.randomManager = randomManager;
    this.synManager = synManager;
    this.verbsManager = verbsManager;
  }

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  /*
  deleteRollback(): void {
    this.savePoints.pop();
  }
  */

  public saveSituation(context: SaveSituationContext): void {
    // debug('SAVING DATA');
    // debug(this.spy);

    // no need to copy the objects here, just give their reference
    let savePoint: SavePoint = new SavePoint(
      this.spy.getPugHtml(),
      context,
      this.saidManager.getHasSaidMap(),
      this.refsManager.getTriggeredRefs(),
      this.genderNumberManager.getRefGenderMap(),
      this.genderNumberManager.getRefNumberMap(),
      this.randomManager.getRndNextPos(),
      this.refsManager.getNextRefs(),
      this.synManager.getSynoSeq(),
      this.verbsManager.getVerbPartsList(),
    );

    // debug('WHEN SAVING: ' + JSON.stringify(this.savePoints));

    this.savePoints.push(savePoint);

    switch (savePoint.context) {
      case 'isEmpty':
        this.isEvaluatingEmpty = true;
      case 'nextRep':
        this.isEvaluatingNextRep = true;
      case 'choosebest':
        this.isEvaluatingChoosebest = true;
    }
  }

  public rollback(): void {
    // debug('ROLLBACK DATA');
    // debug('ROLLBACK DATA: size ' + this.savePoints.length);
    let savePoint: SavePoint = this.savePoints.pop();

    // debug('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
    // there's no point in creating new maps here: we just reuse the ones we created before
    this.saidManager.setHasSaidMap(savePoint.hasSaid);
    this.refsManager.setTriggeredRefs(savePoint.triggeredRefs);
    this.genderNumberManager.setRefGenderMap(savePoint.refGenderMap);
    this.genderNumberManager.setRefNumberMap(savePoint.refNumberMap);
    this.randomManager.setRndNextPos(savePoint.rndNextPos);
    this.refsManager.setNextRefs(savePoint.nextRefs);
    this.synManager.setSynoSeq(savePoint.synoSeq);
    this.verbsManager.setVerbPartsList(savePoint.verbParts);

    switch (savePoint.context) {
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
