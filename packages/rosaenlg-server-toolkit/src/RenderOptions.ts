/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Languages } from 'rosaenlg-packager';

export class RenderOptions {
  public language: Languages;
  public forceRandomSeed: number | undefined;
  public defaultSynoMode: string | undefined;
  public defaultAmong: string | undefined;

  constructor(copyFrom: any) {
    this.language = copyFrom.language;

    this.forceRandomSeed = copyFrom.forceRandomSeed;
    this.defaultSynoMode = copyFrom.defaultSynoMode;
    this.defaultAmong = copyFrom.defaultAmong;
  }
}
