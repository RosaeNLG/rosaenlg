import * as sqlite3 from "better-sqlite3"

const dbPath: string = __dirname + '/../resources_pub/de_DE/dict.db';

export class GermanDictHelper {

  db:sqlite3.Database;
  adjStmt: sqlite3.Statement;
  nounStmt: sqlite3.Statement;

  constructor() {
    this.db = new sqlite3(dbPath, {readonly: true, fileMustExist: true});
    this.nounStmt = this.db.prepare("SELECT lemma FROM dict WHERE nature='SUB' AND (ff=? OR lemma=?)");
    this.adjStmt = this.db.prepare("SELECT lemma FROM dict WHERE nature='ADJ' AND (ff=? OR lemma=?)");
  }

  isAdj(ff:string): boolean {
    return this.getAdj(ff)!=null;
  }
  isNoun(ff:string): boolean {
    return this.getNoun(ff)!=null;
  }

  getNoun(ff:string): string {
    //console.log(`looking for noun ${ff}`);
    let rows = this.nounStmt.all([ff, ff]);

    if (rows==null || rows.length==0) {
      //console.log(`nothing found for ${ff}`);
      return null;
    }    

    // it is normal to find many ones: cases
    //if (rows.length>1) {
    //}

    // console.log(rows);

    return rows[0]['lemma'];
  }

  getAdj(ff:string): string {
    //console.log(`looking for adj ${ff}`);

    let rows = this.adjStmt.all([ff, ff]);

    if (rows==null || rows.length==0) {
      //console.log(`nothing found for ${ff}`);
      return null;
    }    
    // it is normal to find many ones: cases
    //if (rows.length>1) {
    //}

    // console.log(rows);

    return rows[0]['lemma'];

  }

}
