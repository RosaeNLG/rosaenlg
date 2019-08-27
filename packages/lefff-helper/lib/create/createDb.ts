import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'fs';

const lefffpath = 'resources_src/lefff-3.4.mlex/lefff-3.4.mlex';

let lineReader = createInterface({
  input: createReadStream(lefffpath),
});

console.log('starting to process LEFFF file: ' + lefffpath);

export interface Nouns {
  [key: string]: string;
}
export interface Adjectives {
  [key: string]: [string, boolean];
}
export interface PastParticiples {
  [key: string]: string;
}

let nouns:Nouns = {};
let adjectives: Adjectives = {};
let pastParticiples: PastParticiples = {};

try {
  lineReader
    .on('line', function(line): void {
      const lineData: string[] = line.split('\t');
      const ff: string = lineData[0];
      const nature: string = lineData[1];
      const racine: string = lineData[2];
      const codes: string = lineData[3];

      let masc = 0;
      let fem = 0;
      let sing = 0;
      let plu = 0;

      if (codes.indexOf('m') > -1) {
        masc = 1;
      }
      if (codes.indexOf('f') > -1) {
        fem = 1;
      }
      if (fem === 0 && masc === 0) {
        fem = 1;
        masc = 1;
      }

      if (codes.indexOf('s') > -1) {
        sing = 1;
      }
      if (codes.indexOf('p') > -1) {
        plu = 1;
      }
      if (sing === 0 && plu === 0) {
        sing = 1;
        plu = 1;
      }

      /*
        nouns:
        in the file: nature='nc'
        key: ff
        val: racine
      */
      if (nature === 'nc') {
        nouns[ff] = racine;
      }

      /*
      adjectives:
      in the file: nature='adj'
      key: ff
      val: racine, isPp if K in codes

      potentially key is not unique, but do we care?
        fini = fini ms
        fini = finir Kms

      pp:
      in the file: 
        nature='adj'
        masc=1
        sing=1
      key: racine
      val: ff

      */
      if (nature === 'adj') {
        let isPp = codes.indexOf('K') > -1;
        adjectives[ff] = [
          racine,
          isPp
        ]
        if (isPp && masc===1 && sing===1) {
          pastParticiples[racine] = ff;
        }
      }



    })
    .on('close', function(): void {
      /*
        exceptions...
        yeux	nc	oeil	mp
        yeux	nc	yeux	mp
        chevaux	nc	cheval	mp
        chevaux	nc	chevau	mp
        chevaux	nc	chevaux	mp
      */
      nouns['yeux'] = 'oeil';
      nouns['chevaux'] = 'cheval';

      writeFileSync('resources_pub/nouns.json', JSON.stringify(nouns), 'utf8');
      writeFileSync('resources_pub/adjectives.json', JSON.stringify(adjectives), 'utf8');
      writeFileSync('resources_pub/pastParticiples.json', JSON.stringify(pastParticiples), 'utf8');

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
