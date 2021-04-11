/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');

const langResources = [
  // en_US
  ['english-verbs-gerunds', '../english-verbs-gerunds/dist/gerunds.json', 'en_US'],
  ['english-verbs-irregular', '../english-verbs-irregular/dist/verbs.json', 'en_US'],
  ['english-plurals-list', '../english-plurals-list/dist/plurals.json', 'en_US'],
  // fr_FR
  ['french-words-gender-lefff', '../french-words-gender-lefff/dist/words.json', 'fr_FR'],
  ['french-verbs-lefff', '../french-verbs-lefff/dist/conjugations.json', 'fr_FR'],
  ['french-verbs-transitive', '../french-verbs-transitive/dist/transitive.json', 'fr_FR'],
  // de_DE
  ['german-words-dict', '../german-words-dict/dist/words.json', 'de_DE'],
  ['german-adjectives-dict', '../german-adjectives-dict/dist/adjectives.json', 'de_DE'],
  ['german-verbs-dict', '../german-verbs-dict/dist/verbs.json', 'de_DE'],
  // it_IT
  ['italian-words-dict', '../italian-words-dict/dist/words.json', 'it_IT'],
  ['italian-adjectives-dict', '../italian-adjectives-dict/dist/adjectives.json', 'it_IT'],
  ['italian-verbs-dict', '../italian-verbs-dict/dist/verbs.json', 'it_IT'],
  // es_ES
  // no Spanish linguistic resources
];

function getPlaceHolder(rollup, libName) {
  if (rollup) {
    return `{"${libName}_PLACEHOLDER":"true"}`;
  } else {
    return '{}';
  }
}

function fakeFiles(rollup) {
  for (let i = 0; i < langResources.length; i++) {
    const name = langResources[i][1];

    if (fs.existsSync(`${name}.BU`)) {
      console.log(`backup file already exists: ${name}.BU => skipping`);
    } else {
      if (!fs.existsSync(name)) {
        console.log(`original file does not exist: ${name} => skipping`);
      } else {
        // rename
        console.log(`renaming ${name}`);
        fs.renameSync(name, `${name}.BU`);

        // fake ones with placeholder
        const newContent = getPlaceHolder(rollup, langResources[i][0]);
        console.log(`creating fake content for ${langResources[i][1]}`);
        fs.writeFileSync(langResources[i][1], newContent, 'utf8');
      }
    }
  }
}

function cleanFakes() {
  for (let i = 0; i < langResources.length; i++) {
    const name = langResources[i][1];

    if (!fs.existsSync(`${name}.BU`)) {
      console.log(`no backup file for ${name}!`);
      continue;
    }

    if (fs.existsSync(name)) {
      // delete fake ones
      console.log(`deleting ${name}`);
      fs.unlinkSync(name);
    } else {
      console.log(`fake file does not exist: ${name}`);
    }

    // take from backup
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

    const placeholder = getPlaceHolder(true, libName);
    if (originalLib.indexOf(placeholder) == -1) {
      throw `cannot find ${placeholder} in ${compFile}`;
    } else {
      const replaced = originalLib.replace(placeholder, targetValue);
      fs.writeFileSync(compFile, replaced, 'utf8');
    }
  }
}

if (process.argv.indexOf('before_tsc') > -1) {
  console.log('before_tsc');
  fakeFiles(false);
} else if (process.argv.indexOf('before_rollup') > -1) {
  console.log('before_rollup');
  fakeFiles(true);
} else if (process.argv.indexOf('after_tsc') > -1) {
  console.log('after_tsc');
  cleanFakes();
} else if (process.argv.indexOf('after_rollup') > -1) {
  console.log('after_rollup');
  cleanFakes();
  replacePlaceholders();
} else {
  throw 'error, wrong arg';
}
