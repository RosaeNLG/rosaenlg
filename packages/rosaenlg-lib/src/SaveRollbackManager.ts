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
import { SpyI } from './Spy';

export type SaveSituationContext = 'isEmpty' | 'nextRep' | 'choosebest';

class SavePoint {
  public htmlBefore: string;
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
      this.synoTriggered.set(key, [...(synoTriggered.get(key) as number[])]);
    }
    this.verbParts = verbParts.slice(0);

    this.isEvaluatingEmpty = isEvaluatingEmpty;
    this.isEvaluatingNextRep = isEvaluatingNextRep;
    this.isEvaluatingChoosebest = isEvaluatingChoosebest;
  }
}

export class SaveRollbackManager {
  private savePoints: SavePoint[];

  private spy: SpyI | undefined = undefined;

  private saidManager: SaidManager | undefined = undefined;
  private refsManager: RefsManager | undefined = undefined;
  private genderNumberManager: GenderNumberManager | undefined = undefined;
  private randomManager: RandomManager | undefined = undefined;
  private synManager: SynManager | undefined = undefined;
  private verbsManager: VerbsManager | undefined = undefined;

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

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  protected getSpy(): SpyI {
    return this.spy as SpyI;
  }

  public saveSituation(context: SaveSituationContext): void {
    // no need to copy the objects here, just give their reference
    const savePoint: SavePoint = new SavePoint(
      this.getSpy().getPugHtml(),
      (this.saidManager as SaidManager).getHasSaidMap(),
      (this.refsManager as RefsManager).getTriggeredRefs(),
      (this.genderNumberManager as GenderNumberManager).getRefGenderMap(),
      (this.genderNumberManager as GenderNumberManager).getRefNumberMap(),
      (this.randomManager as RandomManager).getRndNextPos(),
      (this.refsManager as RefsManager).getNextRefs(),
      (this.synManager as SynManager).getSynoSeq(),
      (this.synManager as SynManager).getSynoTriggered(),
      (this.verbsManager as VerbsManager).getVerbPartsList(),
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
    const savePoint: SavePoint = this.savePoints.pop() as SavePoint;

    // istanbul ignore next
    if (!savePoint) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `was asked to rollback, but savePoints list is empty!`;
      throw err;
    }

    // console.log('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
    // there's no point in creating new maps here: we just reuse the ones we created before
    (this.saidManager as SaidManager).setHasSaidMap(savePoint.hasSaid);
    (this.refsManager as RefsManager).setTriggeredRefs(savePoint.triggeredRefs);
    (this.genderNumberManager as GenderNumberManager).setRefGenderMap(savePoint.refGenderMap);
    (this.genderNumberManager as GenderNumberManager).setRefNumberMap(savePoint.refNumberMap);
    (this.randomManager as RandomManager).setRndNextPos(savePoint.rndNextPos);
    (this.refsManager as RefsManager).setNextRefs(savePoint.nextRefs);
    (this.synManager as SynManager).setSynoSeq(savePoint.synoSeq);
    (this.synManager as SynManager).setSynoTriggered(savePoint.synoTriggered);
    (this.verbsManager as VerbsManager).setVerbPartsList(savePoint.verbParts);

    this.isEvaluatingEmpty = savePoint.isEvaluatingEmpty;
    this.isEvaluatingNextRep = savePoint.isEvaluatingNextRep;
    this.isEvaluatingChoosebest = savePoint.isEvaluatingChoosebest;

    this.getSpy().setPugHtml(savePoint.htmlBefore);
  }
}
