/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RenderOptionsOutput } from './RenderOptionsOutput';

export interface RenderedBundle {
  text: string;
  renderOptions: RenderOptionsOutput;
  outputData: any;
}
