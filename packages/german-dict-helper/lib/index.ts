import * as sqlite3 from 'better-sqlite3';

//import * as Debug from 'debug';
//const debug = Debug('german-dict-helper');

const dbPath: string = __dirname + '/../resources_pub/dict.db';

export class GermanDictHelper {
  private db: sqlite3.Database;
  private adjStmt: sqlite3.Statement;
  private nounStmt: sqlite3.Statement;

  public constructor() {
    this.db = new sqlite3(dbPath, { readonly: true, fileMustExist: true });
    this.nounStmt = this.db.prepare("SELECT lemma FROM dict WHERE nature='SUB' AND (ff=? OR lemma=?)");
    this.adjStmt = this.db.prepare("SELECT lemma FROM dict WHERE nature='ADJ' AND (ff=? OR lemma=?)");
  }

  public isAdj(ff: string): boolean {
    return this.getAdj(ff) != null;
  }
  public isNoun(ff: string): boolean {
    return this.getNoun(ff) != null;
  }

  public getNoun(ff: string): string {
    // debug(`looking for noun ${ff}`);
    let rows = this.nounStmt.all([ff, ff]);

    if (rows == null || rows.length == 0) {
      // debug(`nothing found for ${ff}`);
      return null;
    }

    // it is normal to find many ones: cases

    return rows[0]['lemma'];
  }

  public getAdj(ff: string): string {
    // debug(`looking for adj ${ff}`);

    let rows = this.adjStmt.all([ff, ff]);

    if (rows == null || rows.length == 0) {
      // debug(`nothing found for ${ff}`);
      return null;
    }

    // it is normal to find many ones: cases

    return rows[0]['lemma'];
  }
}
