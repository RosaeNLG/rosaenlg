/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const yaml = require('js-yaml');
const fs = require('fs');

function processFile(inputFile, outputFile) {
  const commonYaml = fs.readFileSync('workflows/common.yml', 'utf8');
  const rawYaml = fs.readFileSync(inputFile, 'utf8');

  const loadedYaml = yaml.safeLoad(commonYaml + rawYaml);

  delete loadedYaml.snippets;
  delete loadedYaml.commonsnippets;

  const newYamlString = yaml.safeDump(loadedYaml, { noRefs: true, lineWidth: 100000 });

  // console.log(newYamlString);

  fs.writeFileSync(outputFile, newYamlString, 'utf8');
}

// PS: diff with https://eloquent-hodgkin-f52b42.netlify.app/
function workflows(cb) {
  processFile('workflows/any.yml', '.github/workflows/any.yml');
  processFile('workflows/version.yml', '.github/workflows/version.yml');
  cb();
}

exports.all = workflows;
