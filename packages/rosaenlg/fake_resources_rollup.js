const fs = require('fs');

const langResources = [
  ['french-words-gender-lefff', '../french-words-gender-lefff/dist/words.json', 'fr_FR'],
  ['french-verbs-lefff', '../french-verbs-lefff/dist/conjugations.json', 'fr_FR'],
  ['german-words-dict', '../german-words-dict/dist/words.json', 'de_DE'],
  ['german-adjectives-dict', '../german-adjectives-dict/dist/adjectives.json', 'de_DE'],
  ['german-verbs-dict', '../german-verbs-dict/dist/verbs.json', 'de_DE'],
  ['italian-words-dict', '../italian-words-dict/dist/words.json', 'it_IT'],
  ['italian-adjectives-dict', '../italian-adjectives-dict/dist/adjectives.json', 'it_IT'],
  ['italian-verbs-dict', '../italian-verbs-dict/dist/verbs.json', 'it_IT'],
];

function getPlaceHolder(libName) {
  return `{"${libName}_PLACEHOLDER":"true"}`;
}

function fakeFiles() {
  // rename
  for (let i = 0; i < langResources.length; i++) {
    const name = langResources[i][1];
    console.log(`renaming ${name}`);
    fs.renameSync(name, `${name}.BU`);
  }

  // fake ones but with placeholder
  for (let i = 0; i < langResources.length; i++) {
    const newContent = getPlaceHolder(langResources[i][0]);
    console.log(`creating fake content for ${langResources[i][1]}`);
    fs.writeFileSync(langResources[i][1], newContent, 'utf8');
  }
}

function cleanFakes() {
  // delete fake ones
  for (let i = 0; i < langResources.length; i++) {
    const name = langResources[i][1];
    console.log(`deleting ${name}`);
    fs.unlinkSync(name);
  }

  // take from backup
  for (let i = 0; i < langResources.length; i++) {
    const name = langResources[i][1];
    console.log(`renaming ${name}`);
    fs.renameSync(`${name}.BU`, name);
  }
}

function getCompName(lang) {
  const files = fs.readdirSync('./dist/rollup');
  for (let i = 0; i < files.length; i++) {
    if (files[i].indexOf('_comp') > -1 && files[i].indexOf(lang) > -1) {
      return `./dist/rollup/${files[i]}`;
    }
  }
  throw `no comp file found in rollup folder for ${lang}`;
}

function replacePlaceholders() {
  console.log('replacing placeholders...');
  for (let i = 0; i < langResources.length; i++) {
    const libName = langResources[i][0];
    const resource = langResources[i][1];
    const lang = langResources[i][2];
    const compFile = getCompName(lang);
    console.log(`for ${lang}, in ${compFile}, for ${resource}`);

    const originalLib = fs.readFileSync(compFile, 'utf8');
    const targetValue = fs.readFileSync(resource, 'utf8');

    const placeholder = getPlaceHolder(libName);
    if (originalLib.indexOf(placeholder) == -1) {
      throw `cannot find ${placeholder} in ${compFile}`;
    } else {
      const replaced = originalLib.replace(placeholder, targetValue);
      fs.writeFileSync(compFile, replaced, 'utf8');
    }
  }
}

if (process.argv.indexOf('before') > -1) {
  console.log('BEFORE');
  fakeFiles();
} else if (process.argv.indexOf('after') > -1) {
  console.log('AFTER');
  cleanFakes();
  replacePlaceholders();
} else {
  throw 'error, put before or after';
}
