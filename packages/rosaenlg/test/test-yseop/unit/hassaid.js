/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  simple: [
    `
p
  recordSaid('TEST')
  if hasSaid('TEST')
    | ok
  deleteSaid('TEST')
`,
    `
\\beginParagraph
  \\setKeyVal("TEST", true)
  \\if (TEXT_CONTENT_EXECUTION_CONTEXT.getKeyVal("TEST")==true) /* TODO migrate condition */
    ok
  \\endIf
  \\setKeyVal("TEST", null)
\\endParagraph
`,
  ],
};
