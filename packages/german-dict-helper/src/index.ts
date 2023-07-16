/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'fs';
import { Adjectives, Nouns } from './create/createDb';

export class GermanDictHelper {
  private adjectives: Adjectives | null = null;
  private nouns: Nouns | null = null;

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
    return (this.nouns as Nouns)[ff];
  }

  public getAdj(ff: string): string {
    if (!this.adjectives) {
      this.adjectives = JSON.parse(readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
    }
    return (this.adjectives as Adjectives)[ff];
  }
}
