/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaidManager, HasSaidMap } from './SaidManager';
import { GenderNumberManager, RefGenderMap, RefNumberMap } from './GenderNumberManager';
import { RandomManager } from './RandomManager';
import { SynManager, SynoSeq, SynoTriggered } from './SynManager';
import { VerbsManager, VerbParts } from './VerbsManager';
import { RefsManager, TriggeredRefs, NextRefs } from './RefsManager';

export type SaveSituationContext = 'isEmpty' | 'nextRep' | 'choosebest';

class SavePoint {
  public htmlBefore: string;
  // public context: SaveSituationContext;
  public hasSaid: HasSaidMap;
  public triggeredRefs: TriggeredRefs;
  public nextRefs: NextRefs;
  public refGenderMap: RefGenderMap;
  public refNumberMap: RefNumberMap;
  public rndNextPos: number;
  public synoSeq: SynoSeq;
  public synoTriggered: SynoTriggered;
  public verbParts: VerbParts;
  public isEvaluatingEmpty: boolean;
  public isEvaluatingNextRep: boolean;
  public isEvaluatingChoosebest: boolean;

  public constructor(
    htmlBefore: string,
    hasSaid: HasSaidMap,
    triggeredRefs: TriggeredRefs,
    refGenderMap: RefGenderMap,
    refNumberMap: RefNumberMap,
    rndNextPos: number,
    nextRefs: NextRefs,
    synoSeq: SynoSeq,
    synoTriggered: SynoTriggered,
    verbParts: VerbParts,
    isEvaluatingEmpty: boolean,
    isEvaluatingNextRep: boolean,
    isEvaluatingChoosebest: boolean,
  ) {
    // here we have to copy
    this.htmlBefore = htmlBefore;
    this.hasSaid = Object.assign({}, hasSaid);
    this.triggeredRefs = new Map(triggeredRefs);
    this.refGenderMap = new Map(refGenderMap);
    this.refNumberMap = new Map(refNumberMap);
    this.rndNextPos = rndNextPos;
    this.nextRefs = new Map(nextRefs);
    this.synoSeq = new Map(synoSeq);

    // deep copy of the values in the array
    this.synoTriggered = new Map();
    for (const key of synoTriggered.keys()) {
      this.synoTriggered.set(key, [...synoTriggered.get(key)]);
    }
    this.verbParts = verbParts.slice(0);

    this.isEvaluatingEmpty = isEvaluatingEmpty;
    this.isEvaluatingNextRep = isEvaluatingNextRep;
    this.isEvaluatingChoosebest = isEvaluatingChoosebest;
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

  public isEvaluatingEmpty = false;
  public isEvaluatingNextRep = false;
  public isEvaluatingChoosebest = false;

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

  public saveSituation(context: SaveSituationContext): void {
    // no need to copy the objects here, just give their reference
    const savePoint: SavePoint = new SavePoint(
      this.spy.getPugHtml(),
      this.saidManager.getHasSaidMap(),
      this.refsManager.getTriggeredRefs(),
      this.genderNumberManager.getRefGenderMap(),
      this.genderNumberManager.getRefNumberMap(),
      this.randomManager.getRndNextPos(),
      this.refsManager.getNextRefs(),
      this.synManager.getSynoSeq(),
      this.synManager.getSynoTriggered(),
      this.verbsManager.getVerbPartsList(),
      this.isEvaluatingEmpty,
      this.isEvaluatingNextRep,
      this.isEvaluatingChoosebest,
    );

    this.savePoints.push(savePoint);

    switch (context) {
      case 'isEmpty': {
        this.isEvaluatingEmpty = true;
        break;
      }
      case 'nextRep': {
        this.isEvaluatingNextRep = true;
        break;
      }
      case 'choosebest': {
        this.isEvaluatingChoosebest = true;
        break;
      }
    }
  }

  public rollback(): void {
    const savePoint: SavePoint = this.savePoints.pop();

    // istanbul ignore next
    if (!savePoint) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `was asked to rollback, but savePoints list is empty!`;
      throw err;
    }

    // console.log('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
    // there's no point in creating new maps here: we just reuse the ones we created before
    this.saidManager.setHasSaidMap(savePoint.hasSaid);
    this.refsManager.setTriggeredRefs(savePoint.triggeredRefs);
    this.genderNumberManager.setRefGenderMap(savePoint.refGenderMap);
    this.genderNumberManager.setRefNumberMap(savePoint.refNumberMap);
    this.randomManager.setRndNextPos(savePoint.rndNextPos);
    this.refsManager.setNextRefs(savePoint.nextRefs);
    this.synManager.setSynoSeq(savePoint.synoSeq);
    this.synManager.setSynoTriggered(savePoint.synoTriggered);
    this.verbsManager.setVerbPartsList(savePoint.verbParts);

    this.isEvaluatingEmpty = savePoint.isEvaluatingEmpty;
    this.isEvaluatingNextRep = savePoint.isEvaluatingNextRep;
    this.isEvaluatingChoosebest = savePoint.isEvaluatingChoosebest;

    this.spy.setPugHtml(savePoint.htmlBefore);
  }
}
