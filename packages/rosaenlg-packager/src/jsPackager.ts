/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Languages } from './interfaces';
import { StaticFs, RosaeNlgFeatures } from './index';

export function compileTemplateToJsString(
  entryTemplate: string,
  language: Languages,
  staticFs: StaticFs,
  rosaeNlgFeatures: RosaeNlgFeatures,
  exportDefault = false,
  compileDebug = false,
): string {
  const options: any = {
    embedResources: true,
    language: language,
    compileDebug: compileDebug,
  };
  if (staticFs != null) {
    options.staticFs = staticFs;
  }
  const compiled = (rosaeNlgFeatures.compileFileClient as (path: string, options: any) => string)(
    entryTemplate,
    options,
  );

  const res = exportDefault ? compiled + `\nexport default template;` : compiled;

  return res;
}
