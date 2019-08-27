//import * as Debug from 'debug';
//const debug = Debug("lefff-helper");

import { readFileSync } from 'fs';
import {Adjectives, Nouns, PastParticiples} from './create/createDb';

export class LefffHelper {

  private adjectives: Adjectives;
  private nouns: Nouns;
  private pastParticiples: PastParticiples;

  public constructor() {
  }

  public isAdj(ff: string): boolean {
    return this.getAdj(ff) != null;
  }
  public isNoun(ff: string): boolean {
    return this.getNoun(ff) != null;
  }

  public getNoun(ff: string): string {
    // debug(`looking for noun ${ff}`);

    if (!this.nouns) {
      this.nouns = JSON.parse(readFileSync(__dirname + '/../resources_pub/nouns.json', 'utf8'));
    }

    return this.nouns[ff];
  }

  public getAdj(ff: string): string {
    if (!this.adjectives) {
      this.adjectives = JSON.parse(readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
    }

    let adjectiveInfo = this.adjectives[ff];
    if (!adjectiveInfo) {
      return null;
    }

    let racine: string = adjectiveInfo[0];
    let isPp: boolean = adjectiveInfo[1];

    if (isPp) {
      /*
        c'est un participe passé
        on ne veut pas le verbe mais la forme ms de ce même participe passé
      */
      if (!this.pastParticiples) {
        this.pastParticiples = JSON.parse(readFileSync(__dirname + '/../resources_pub/pastParticiples.json', 'utf8'));
      }
      return this.pastParticiples[racine];

    } else {
      return racine;
    }

  }
}
