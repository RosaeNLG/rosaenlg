/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RenderOptionsInput } from './RenderOptionsInput';

export class RenderOptionsOutput extends RenderOptionsInput {
  public randomSeed: number | undefined;

  constructor(copyFrom: any) {
    super(copyFrom);
    this.randomSeed = copyFrom.randomSeed;
  }
}
