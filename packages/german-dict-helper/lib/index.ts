import { readFileSync } from 'fs';
import { Adjectives, Nouns } from './create/createDb';

export class GermanDictHelper {
  private adjectives: Adjectives;
  private nouns: Nouns;

  public isAdj(ff: string): boolean {
    return this.getAdj(ff) != null;
  }
  public isNoun(ff: string): boolean {
    return this.getNoun(ff) != null;
  }

  public getNoun(ff: string): string {
    if (!this.nouns) {
      this.nouns = JSON.parse(readFileSync(__dirname + '/../resources_pub/nouns.json', 'utf8'));
    }
    return this.nouns[ff];
  }

  public getAdj(ff: string): string {
    if (!this.adjectives) {
      this.adjectives = JSON.parse(readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
    }
    return this.adjectives[ff];
  }
}
