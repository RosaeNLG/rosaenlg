import { Random, MersenneTwister19937 } from 'random-js';

export class RandomManager {
  private incrRandomer: number;
  private rndNextPos: number;
  private rndTable: number[];
  private rndEngine: Random;
  //spy: Spy;

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
      // console.log("ADDING NEW RANDOM IN THE TABLE");
      //const time = process.hrtime();
      for (let i = 0; i < this.incrRandomer; i++) {
        /*
          comporte des biais : https://www.npmjs.com/package/random-js ; trouver mieux ?
        */
        this.rndTable.push(this.rndEngine.real(0, 1, false));
      }
      //const diff = process.hrtime(time);
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

    // console.log(`sumOfWeights: ${sumOfWeights}, randomWeight: ${randomWeight}`);

    for (let i = 1; i <= max; i++) {
      randomWeight = randomWeight - this.getItemWeight(weights, i);
      if (randomWeight <= 0) {
        // console.log(`=> found: ${i}`);
        return i;
      }
    }
  }

  public randomNotIn(max: number, weights: any, excludes: number[]): number {
    // console.log(`ASKS: [1,${max}], excludes: ${excludes}`);

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

    // console.log(`original weights: ${JSON.stringify(weights)}, excluded: ${excludes}, translated weights: ${JSON.stringify(translatedWeights)}`);

    const weightedRandom: number = this.getWeightedRandom(max - excludes.length, translatedWeights);

    //// console.log(`must return non excluded #${found}`);
    // inverse mapping
    const targetIndex: number = this.getTargetIndex(weightedRandom, excludes);
    // console.log(targetIndex);
    return targetIndex;
  }
}
