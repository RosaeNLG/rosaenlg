/*
  load the lefff data into a sqlite db
*/
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import * as sqlite3 from 'better-sqlite3';

const lefffpath = 'resources_src/lefff-3.4.mlex/lefff-3.4.mlex';

let db = new sqlite3('./resources_pub/lefff.db');

db.exec('DROP TABLE IF EXISTS lefff').exec(`CREATE TABLE lefff(
      ff TEXT, 
      nature TEXT, 
      racine TEXT, 
      codes TEXT, 
      masc BOOLEAN DEFAULT FALSE,
      fem BOOLEAN DEFAULT FALSE,
      sing BOOLEAN DEFAULT FALSE,
      plu BOOLEAN DEFAULT FALSE)`);

let lineReader = createInterface({
  input: createReadStream(lefffpath),
});

console.log('starting to process LEFFF file: ' + lefffpath);

db.exec('BEGIN');

var insertStmt = db.prepare(
  ` INSERT INTO lefff(ff, nature, racine, codes, masc, fem, sing, plu)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
);

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
      if (fem == 0 && masc == 0) {
        fem = 1;
        masc = 1;
      }

      if (codes.indexOf('s') > -1) {
        sing = 1;
      }
      if (codes.indexOf('p') > -1) {
        plu = 1;
      }
      if (sing == 0 && plu == 0) {
        sing = 1;
        plu = 1;
      }

      if (nature == 'nc' || nature == 'adj') {
        insertStmt.run([ff, nature, racine, codes, masc, fem, sing, plu]);
      }

      // todo verbes
    })
    .on('close', function(): void {
      db.exec('COMMIT');

      // indexes
      db.exec(`DROP INDEX IF EXISTS lefff_racine;`);
      db.exec(`CREATE INDEX lefff_racine ON lefff (racine, nature);`);
      db.exec(`DROP INDEX IF EXISTS lefff_ff;`);
      db.exec(`CREATE INDEX lefff_ff ON lefff (ff, nature);`);

      var getStmt = db.prepare(`SELECT ff FROM lefff WHERE ff=?`);
      var row = getStmt.get(['beaux-fils']);

      if (!row) {
        var err = new Error();
        err.name = 'NotFoundInDict';
        err.message = `not found`;
        throw err;
      } else {
        console.log(`ok: +${row.ff}`);
      }

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
