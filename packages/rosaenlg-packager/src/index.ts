/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './interfaces';
export { compileTemplateToJsString } from './jsPackager';
export { completePackagedTemplateJson } from './jsonPackager';
export { expandPackagedTemplateJson } from './jsonUnpackager';

import { compileTemplateToJsString } from './jsPackager';
import { completePackagedTemplateJson } from './jsonPackager';
import { expandPackagedTemplateJson } from './jsonUnpackager';

export default {
  compileTemplateToJsString: compileTemplateToJsString,
  completePackagedTemplateJson: completePackagedTemplateJson,
  expandPackagedTemplateJson: expandPackagedTemplateJson,
};
