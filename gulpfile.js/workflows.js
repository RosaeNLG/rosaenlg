// const { src, dest, parallel, series } = require('gulp');

const yaml = require('js-yaml');
const fs = require('fs');

function processFile(inputFile, outputFile) {
  const rawYaml = fs.readFileSync(inputFile, 'utf8');
  const loadedYaml = yaml.safeLoad(rawYaml);
  //console.log(doc);

  delete loadedYaml.snippets;

  const newYamlString = yaml.safeDump(loadedYaml, { noRefs: true, lineWidth: 100000 });

  fs.writeFileSync(outputFile, newYamlString, 'utf8');
}

// PS: diff with https://eloquent-hodgkin-f52b42.netlify.app/
function workflows(cb) {
  processFile('workflows/any.yml', '.github/workflows/any.yml');
  processFile('workflows/version.yml', '.github/workflows/version.yml');
  cb();
}

exports.all = workflows;
