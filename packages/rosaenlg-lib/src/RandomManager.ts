/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Random, MersenneTwister19937 } from 'random-js';

export class RandomManager {
  private incrRandomer: number;
  private rndNextPos: number;
  private rndTable: number[];
  private rndEngine: Random;

  public constructor(randomSeed: number) {
    this.incrRandomer = 10;
    this.rndNextPos = 0;
    this.rndTable = [];

    this.rndEngine = new Random(MersenneTwister19937.seed(randomSeed));
  }
  public getRndNextPos(): number {
    return this.rndNextPos;
  }
  public setRndNextPos(rndNextPos: number): void {
    this.rndNextPos = rndNextPos;
  }

  /*
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }
  */

  public incrRnd(incr: number): void {
    for (let i = 0; i < incr; i++) {
      this.getNextRnd(); // we don't care about the result
    }
  }

  public getNextRnd(): number {
    if (this.rndNextPos >= this.rndTable.length) {
      for (let i = 0; i < this.incrRandomer; i++) {
        // has biaises: https://www.npmjs.com/package/random-js; find better?
        this.rndTable.push(this.rndEngine.real(0, 1, false));
      }
    }

    return this.rndTable[this.rndNextPos++];
  }

  private getItemWeight(params: any, item: number): number {
    return (params[item] && params[item].weight) || 1;
  }

  private getSumOfWeights(max: number, params: any): number {
    let sumOfWeights = 0;
    for (let i = 1; i <= max; i++) {
      sumOfWeights += this.getItemWeight(params, i);
    }
    return sumOfWeights;
  }

  /*
    https://stackoverflow.com/questions/6443176/how-can-i-generate-a-random-number-within-a-range-but-exclude-some
    https://medium.com/@peterkellyonline/weighted-random-selection-3ff222917eb6
  */
  private getTargetIndex(origIndex: number, excludes: number[]): number {
    let targetIndex = 0;
    for (let i = 1; i <= origIndex; i++) {
      targetIndex++;
      while (excludes.indexOf(targetIndex) > -1) {
        targetIndex++;
      }
    }
    return targetIndex;
  }

  private getWeightedRandom(max: number, weights: any[]): number {
    const sumOfWeights: number = this.getSumOfWeights(max, weights);
    let randomWeight: number = Math.floor(this.getNextRnd() * sumOfWeights) + 1;

    for (let i = 1; i <= max; i++) {
      randomWeight = randomWeight - this.getItemWeight(weights, i);
      if (randomWeight <= 0) {
        return i;
      }
    }
  }

  public randomNotIn(max: number, weights: any, excludes: number[]): number {
    if (excludes.length === max) {
      // it won't be possible to find a new one
      return null;
    }

    //il faut translater les index des poids
    const translatedWeights: any = {};
    let newIndex = 0;
    for (let i = 1; i <= max; i++) {
      if (excludes.indexOf(i) === -1) {
        newIndex++;
        translatedWeights[newIndex] = { weight: this.getItemWeight(weights, i) };
      }
    }

    const weightedRandom: number = this.getWeightedRandom(max - excludes.length, translatedWeights);

    // inverse mapping
    return this.getTargetIndex(weightedRandom, excludes);
  }
}
