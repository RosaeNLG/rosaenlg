import fs = require('fs');

// verb > tense > person
let verbsList: any;

export function getVerbsList(): string[][][] {
  // lazy loading
  if (verbsList!=null) {
    // console.log('DID NOT RELOAD');
  } else {
    // console.log('LOAD');
    verbsList = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/fr_FR/conjugations.json', 'utf8'));
  }

  return verbsList;

}
