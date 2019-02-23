/*
  load the german-pos-dict data into a sqlite db
*/
import { createInterface } from "readline";
import { createReadStream } from "fs"
import * as sqlite3 from "better-sqlite3"

const dictpath:string = 'resources_src/german-pos-dict/dictionary.dump';

let db = new sqlite3('./resources_pub/dict.db');

db.exec('DROP TABLE IF EXISTS dict')
  .exec(`CREATE TABLE dict(
      ff TEXT, 
      nature TEXT, 
      lemma TEXT, 
      gCase TEXT, 
      number TEXT,
      gender TEXT,
      art TEXT)`
  );

let lineReader = createInterface({
  input: createReadStream(dictpath)
});


console.log(`starting to process German POS dict file: ${dictpath}`);

db.exec("BEGIN");

var insertStmt = db.prepare(
  ` INSERT INTO dict(ff, nature, lemma, gCase, number, gender, art)
    VALUES(?, ?, ?, ?, ?, ?, ?)`);

try {
  lineReader.on('line', function (line) {
    const lineData: string[] = line.split('\t');
    const flexForm: string = lineData[0];
    const lemma: string = lineData[1];
    const props: string[] = lineData[2].split(':');

    const nature:string = props[0];

    /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
    */
    if (    nature=='SUB'
        ||  ( nature=='ADJ' && props[4]=='GRU' )  ) {

      const propCase: string = props[1];
      const propNumber: string = props[2];
      const propGender: string = props[3];
      let propArt: string = null;

      if (nature=='ADJ') {
        propArt = props[5];
      }

      insertStmt.run([flexForm, nature, lemma, propCase, propNumber, propGender, propArt]);

    }   

  }).on('close', function() {

    db.exec("COMMIT");

    db.exec(`DROP INDEX IF EXISTS dict_racine;`);
    db.exec(`CREATE INDEX dict_racine ON dict (lemma, nature);`);
    db.exec(`DROP INDEX IF EXISTS dict_ff;`);
    db.exec(`CREATE INDEX dict_ff ON dict (ff, nature);`);
   
    // Gurken	Gurke	SUB:NOM:PLU:FEM
    var getStmt = db.prepare(`SELECT lemma FROM dict WHERE nature='SUB' AND gCase='NOM' AND number='PLU' AND ff='Gurken'`);
    var row = getStmt.get();

    if (!row) {
      var err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `not found`;
      throw err;      
    } else {
      console.log(`ok: +${row.lemma}`);
    }

    console.log("done.");
  });
} catch (err) {
  console.log(err);
}
