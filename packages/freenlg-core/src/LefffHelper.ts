import * as sqlite3 from "better-sqlite3"

const dbPath: string = __dirname + '/../resources_pub/fr_FR/lefff.db';

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


  agreeAdj_DO_NOT_USE(adj: string, gender: string, number: string): string {
    let stmt: sqlite3.Statement;

    let isM:boolean;
    if (gender=='M' || gender==null) {
      isM=true;
    } else if (gender=='F') {
      isM=false;
    }

    let isS:boolean;
    if (number=='S' || number==null) {
      isS=true;
    } else if (number=='P') {
      isS=false;
    }

    if (isM && isS) { stmt = this.agreeAdjMSStmt;}
    else if (isM && !isS) { stmt = this.agreeAdjMPStmt;}
    else if (!isM && isS) { stmt = this.agreeAdjFSStmt;}
    else if (!isM && !isS) { stmt = this.agreeAdjFPStmt;}
  
    let rows = stmt.all([adj, adj]);

    if (rows==null || rows.length==0) {
      // console.log(`nothing found in lefff for ${adj} ${gender} ${number}`);
      return null;
    }    
    if (rows.length>1) {
      /*
      let all:string = '';
      for (var i=0; i<rows.length; i++) {
        all += ' ' + rows[i]['ff'];
      }
      console.log(`multiple adj found in lefff for ${adj}: ${all}, returning the 1st one ${rows[0]['ff']}.`);
      */
      /*
      sale: sal' sales
      vieux: vieil vieux
      fou: fol fou
      beau: beau bel bô
      impossible à distinguer => on renvoie rien
      */
     return null;
    }

    return rows[0]['ff'];

  }

}
