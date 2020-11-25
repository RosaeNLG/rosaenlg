/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RenderOptions } from './RenderOptions';

export interface RenderedBundle {
  text: string;
  renderOptions: RenderOptions;
  outputData: any;
}
