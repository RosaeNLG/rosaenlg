import { readFileSync } from 'fs';
import {Adjectives, Nouns, PastParticiples} from './create/createDb';

//import * as Debug from 'debug';
//const debug = Debug("morph-it-helper");

export class MorphItHelper {
  private adjectives: Adjectives;
  private nouns: Nouns;
  private pastParticiples: PastParticiples;

  public constructor() {
  }

  public isAdj(flexform: string): boolean {
    return this.getAdj(flexform) != null;
  }
  public isNoun(flexform: string): boolean {
    return this.getNoun(flexform) != null;
  }

  public getNoun(param: string): string {
    if (this.nouns==null) {
      this.nouns = JSON.parse(readFileSync(__dirname + '/../resources_pub/nouns.json', 'utf8'));
    }

    return this.nouns[param];
  }

  public getAdj(param: string): string {
    if (this.adjectives==null) {
      this.adjectives = JSON.parse(readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
    }
    let adjectiveInfo = this.adjectives[param];
    if (!adjectiveInfo) {
      return null;
    }

    let lemma: string = adjectiveInfo[0];
    let isPp: boolean = adjectiveInfo[1];
    if (isPp) {
      /*
        educato	educare	VER:part+past+s+m
        educati	educare	VER:part+past+p+m
        educata	educare	VER:part+past+s+f
      */
      if (this.pastParticiples==null) {
        this.pastParticiples = JSON.parse(readFileSync(__dirname + '/../resources_pub/pastParticiples.json', 'utf8'));
      }
      return this.pastParticiples[lemma];

    } else {
      // all good
      return lemma;
    }

  }
}
