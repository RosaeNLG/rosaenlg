import fs = require('fs');

// verb > tense > person
let verbsList: any;

export class FrenchVerbs {
  verbsList: any;

  constructor() {
    if (verbsList!=null) {
      // console.log('DID NOT RELOAD FR VERBS');
      this.verbsList = verbsList;
    } else {
      // console.log('LOAD FR VERBS');
      this.verbsList = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/fr_FR/conjugations.json', 'utf8'));
      verbsList = this.verbsList;
    }
  }

  getVerb(verb: string): Array<Array<string>> {
    return this.verbsList[verb];
  }

}

