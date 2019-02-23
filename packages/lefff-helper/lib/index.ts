import * as sqlite3 from "better-sqlite3"

const dbPath: string = __dirname + '/../resources_pub/lefff.db';

export class LefffHelper {

  db:sqlite3.Database;
  adjStmt: sqlite3.Statement;
  nounStmt: sqlite3.Statement;
  agreeAdjMSStmt: sqlite3.Statement;
  agreeAdjMPStmt: sqlite3.Statement;
  agreeAdjFSStmt: sqlite3.Statement;
  agreeAdjFPStmt: sqlite3.Statement;

  constructor() {
    this.db = new sqlite3(dbPath, {readonly: true, fileMustExist: true});
    this.adjStmt = this.db.prepare("SELECT racine FROM lefff WHERE nature='adj' AND ff=?");
    this.nounStmt = this.db.prepare("SELECT racine FROM lefff WHERE nature='nc' AND ff=?");

    this.agreeAdjMSStmt = this.db.prepare("SELECT ff FROM lefff WHERE nature='adj' AND (racine=? OR ff=?) AND masc=1 AND sing=1");
    this.agreeAdjMPStmt = this.db.prepare("SELECT ff FROM lefff WHERE nature='adj' AND (racine=? OR ff=?) AND masc=1 AND plu=1");
    this.agreeAdjFSStmt = this.db.prepare("SELECT ff FROM lefff WHERE nature='adj' AND (racine=? OR ff=?) AND fem=1 AND sing=1");
    this.agreeAdjFPStmt = this.db.prepare("SELECT ff FROM lefff WHERE nature='adj' AND (racine=? OR ff=?) AND fem=1 AND plu=1");
  }

  isAdj(ff:string): boolean {
    return this.getAdj(ff)!=null;
  }
  isNoun(ff:string): boolean {
    return this.getNoun(ff)!=null;
  }

  getNoun(ff:string): string {
    //console.log(`looking for noun ${ff}`);
    let rows = this.nounStmt.all([ ff ]);

    if (rows==null || rows.length==0) {
      // console.log(`nothing found for ${ff}`);
      return null;
    }    
    if (rows.length>1) {
      // console.log(`multiple ff found in lefff for ${ff}, returning the 1st one.`);
    }

    // console.log(rows);

    return rows[0]['racine'];
  }

  getAdj(ff:string): string {
    // console.log(`looking for adj ${ff}`);

    let rows = this.adjStmt.all([ ff ]);

    if (rows==null || rows.length==0) {
      // console.log(`nothing found for ${ff}`);
      return null;
    }    
    if (rows.length>1) {
      // console.log(`multiple ff found in lefff for ${ff}, returning the 1st one.`);
    }

    // console.log(rows);

    return rows[0]['racine'];

  }

}
