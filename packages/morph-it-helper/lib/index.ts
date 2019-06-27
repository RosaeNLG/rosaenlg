import * as sqlite3 from 'better-sqlite3';

//import * as Debug from 'debug';
//const debug = Debug("morph-it-helper");

const dbPath: string = __dirname + '/../resources_pub/morph-it.db';

export class MorphItHelper {
  private db: sqlite3.Database;
  private adjStmtLemma: sqlite3.Statement;
  private nounStmtLemma: sqlite3.Statement;
  private adjStmtFf: sqlite3.Statement;
  private nounStmtFf: sqlite3.Statement;

  public constructor() {
    this.db = new sqlite3(dbPath, { readonly: true, fileMustExist: true });
    this.adjStmtLemma = this.db.prepare("SELECT lemma FROM morphit WHERE nature='ADJ' AND lemma=?");
    this.nounStmtLemma = this.db.prepare("SELECT lemma FROM morphit WHERE nature='NOUN' AND lemma=?");
    this.adjStmtFf = this.db.prepare("SELECT lemma FROM morphit WHERE nature='ADJ' AND flexform=?");
    this.nounStmtFf = this.db.prepare("SELECT lemma FROM morphit WHERE nature='NOUN' AND flexform=?");
  }

  public isAdj(flexform: string): boolean {
    return this.getAdj(flexform) != null;
  }
  public isNoun(flexform: string): boolean {
    return this.getNoun(flexform) != null;
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

  private tryToGet(statement: sqlite3.Statement, param: string): string {
    let rows = statement.all([param]);

    if (rows == null || rows.length == 0) {
      return null;
    }

    /* istanbul ignore if */
    if (rows.length > 1) {
      // debug(`multiple ff found for ${ff}: ${this.getAllResults(rows)}, returning the 1st one.`);
    }
    // debug(rows);

    return rows[0]['lemma'];
  }

  public getNoun(param: string): string {
    // debug(`looking for noun ${ff}`);
    let found = this.tryToGet(this.nounStmtLemma, param);
    if (found == null) {
      found = this.tryToGet(this.nounStmtFf, param);
    }
    return found;
  }

  public getAdj(param: string): string {
    let found = this.tryToGet(this.adjStmtLemma, param);
    if (found == null) {
      found = this.tryToGet(this.adjStmtFf, param);
    }
    return found;
  }
}
