import * as sqlite3 from 'better-sqlite3';

import * as Debug from 'debug';
//const debug = Debug("lefff-helper");

const dbPath: string = __dirname + '/../resources_pub/lefff.db';

export class LefffHelper {
  private db: sqlite3.Database;
  private adjStmt: sqlite3.Statement;
  private nounStmt: sqlite3.Statement;

  public constructor() {
    this.db = new sqlite3(dbPath, { readonly: true, fileMustExist: true });
    this.adjStmt = this.db.prepare("SELECT racine FROM lefff WHERE nature='adj' AND ff=?");
    this.nounStmt = this.db.prepare("SELECT racine FROM lefff WHERE nature='nc' AND ff=?");
  }

  public isAdj(ff: string): boolean {
    return this.getAdj(ff) != null;
  }
  public isNoun(ff: string): boolean {
    return this.getNoun(ff) != null;
  }

  /*
  getAllResults(rows:Array<Array<string>>): string {
    var res = '';
    for (var i=0; i<rows.length; i++) {
      res += rows[i]['racine'] + ' ';
    }
    return res;
  }
  */

  public getNoun(ff: string): string {
    // debug(`looking for noun ${ff}`);
    let rows = this.nounStmt.all([ff]);

    if (rows == null || rows.length == 0) {
      // debug(`nothing found for ${ff}`);
      return null;
    }

    /* istanbul ignore if */
    if (rows.length > 1) {
      // debug(`multiple ff found in lefff for ${ff}: ${this.getAllResults(rows)}, returning the 1st one.`);
    }

    // debug(rows);

    return rows[0]['racine'];
  }

  public getAdj(ff: string): string {
    // debug(`looking for adj ${ff}`);

    let rows = this.adjStmt.all([ff]);

    if (rows == null || rows.length == 0) {
      // debug(`nothing found for ${ff}`);
      return null;
    }

    /* istanbul ignore if */
    if (rows.length > 1) {
      // debug(`multiple ff found in lefff for ${ff}: ${this.getAllResults(rows)}, returning the 1st one.`);
    }

    // debug(rows);

    return rows[0]['racine'];
  }
}
