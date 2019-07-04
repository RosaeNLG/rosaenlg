/*
  load the morph-it data into a sqlite db
*/
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import * as sqlite3 from 'better-sqlite3';

const morphItPath = 'resources_src/morph-it/morph-it_048.txt';

let db = new sqlite3('./resources_pub/morph-it.db');

db.exec('DROP TABLE IF EXISTS morphit').exec(`CREATE TABLE morphit(
      flexform TEXT, 
      nature TEXT, 
      lemma TEXT, 
      gender TEXT,
      number TEXT
  )`);

let lineReader = createInterface({
  input: createReadStream(morphItPath, { encoding: 'latin1' }),
});

console.log('starting to process morph-it file: ' + morphItPath);

db.exec('BEGIN');

let insertStmt = db.prepare(
  ` INSERT INTO morphit(flexform, nature, lemma, gender, number)
    VALUES(?, ?, ?, ?, ?)`,
);

try {
  lineReader
    .on('line', function(line): void {
      const lineData: string[] = line.split('\t');
      if (lineData.length != 3) {
        return;
      }
      const flexform: string = lineData[0];
      const lemma: string = lineData[1];
      const props: string[] = lineData[2].split(':');
      if (props.length != 2) {
        return;
      }

      const derivational: string[] = props[0].split('-');
      const inflectional: string[] = props[1].split('+');

      if (derivational.length < 1) {
        return;
      }

      let nature = derivational[0];
      if (nature != 'NOUN' && nature != 'ADJ' && nature != 'VER') {
        return;
      }
      if (nature == 'ADJ' && inflectional.indexOf('pos') == -1) {
        return;
      }
      if (nature == 'VER' && (inflectional.indexOf('part') == -1 || inflectional.indexOf('past') == -1)) {
        return;
      }

      let gender: 'M' | 'F';
      let number: 'S' | 'P';

      switch (nature) {
        case 'NOUN': {
          if (derivational.indexOf('M') > -1) {
            gender = 'M';
          } else if (derivational.indexOf('F') > -1) {
            gender = 'F';
          }
          break;
        }
        case 'VER':
        case 'ADJ': {
          if (inflectional.indexOf('m') > -1) {
            gender = 'M';
          } else if (inflectional.indexOf('f') > -1) {
            gender = 'F';
          }
          break;
        }
      }

      if (inflectional.indexOf('s') > -1) {
        number = 'S';
      } else if (inflectional.indexOf('p') > -1) {
        number = 'P';
      }

      if (gender == null || number == null) {
        console.log(`incomplete: ${line}`);
      }

      const natureMapping = {
        VER: 'PP', // past participle
        ADJ: 'ADJ',
        NOUN: 'NOUN',
      };

      insertStmt.run([flexform, natureMapping[nature], lemma, gender, number]);
    })
    .on('close', function(): void {
      db.exec('COMMIT');

      // indexes
      db.exec(`DROP INDEX IF EXISTS morphit_flexform_nature;`);
      db.exec(`CREATE INDEX morphit_flexform_nature ON morphit (flexform, nature);`);

      let getStmt = db.prepare(`SELECT lemma FROM morphit WHERE flexform=?`);
      let row = getStmt.get(['camerieri']);

      if (!row) {
        let err = new Error();
        err.name = 'NotFoundInDict';
        err.message = `not found`;
        throw err;
      } else {
        console.log(`ok: +${row.lemma}`);
      }

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
