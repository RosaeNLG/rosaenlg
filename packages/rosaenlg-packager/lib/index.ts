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
