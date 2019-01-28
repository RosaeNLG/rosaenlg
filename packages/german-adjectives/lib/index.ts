import fs = require('fs');

let adjectives: any;

function load(): void {
  // lazy loading
  if (adjectives!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    adjectives = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
  }
}

export function agreeGermanAdjective(
    adjective: string, 
    germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE', 
    gender: 'M' | 'F' | 'N', 
    number: 'S' | 'P', 
    det: 'DEFINITE' | 'DEMONSTRATIVE'): string {
      
  load();

  var adjInfo = adjectives[adjective];
  if (adjInfo==null) {
    console.log(`WARNING ${adjective} adjective is not in German dict`);
    return adjective;
  }

  const casesMapping = {
    'NOMINATIVE':'NOM',
    'ACCUSATIVE':'AKK',
    'DATIVE':'DAT',
    'GENITIVE':'GEN'
  }
  if (casesMapping[germanCase]==null) {
    console.log(`ERROR ${germanCase} is not a supported German case for adjectives`);
    return adjective;
  }
  var withCase = adjInfo[ casesMapping[germanCase] ];
  
  const detMapping = {
    'DEFINITE': 'DEF',
    'DEMONSTRATIVE': 'DEF'
    // 'NO_DET': 'SOL'
  }
  if (detMapping[det]==null) {
    console.log(`ERROR ${det} is not a supported determinant for adjectives`);
    return adjective;
  }
  var withDet = withCase[ detMapping[det] ];
  
  if (number=='P') {
    return withDet['P'];
  } else {
    return withDet[gender];
  }

  
}


