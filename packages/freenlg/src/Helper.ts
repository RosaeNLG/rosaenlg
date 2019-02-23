import { GenderNumberManager } from "./GenderNumberManager";


export class Helper {
  genderNumberManager: GenderNumberManager;
  spy: Spy;

  constructor(params: any) {
    this.genderNumberManager = params.genderNumberManager;  
  }

  getSorP(table: Array<string>, obj: any): string {
    if (table==null || table.length<2) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'you must provide a table with 2 elements: S + P';
      throw err;
    }

    let number = this.genderNumberManager.getRefNumber(obj, null);

    if (number=='P') {
      return table[1];
    }
    // default: number==null || number=='S'
    return table[0];
  }

  getMFN(table: Array<string>, obj: any): string {
    let gender = this.genderNumberManager.getRefGender(obj, null);

    if (table==null || table.length==0) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `you must provide a table with elements MF(N)`;
      throw err;
    }
    
    if (gender=='F') {
      if (table.length<2) {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `${obj} is Feminine, you must provide a table with 2 elements MF`;
        throw err;
      }
      return table[1];
    } else if (gender=='N') {
      if (table.length<3) {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `${obj} is Neutral, you must provide a table with 3 elements MFN`;
        throw err;
      }
      return table[2];
    }

    // default: gender==null || gender=='M'
    return table[0];

  }

  isSentenceStart(): boolean {
    /*
      .   xxxx
      .xxx
      ne marche pas sur les inline

      > xxxx
      >xxx
      attention car n'est pas vrai sur tous les tags : </b> ne marque pas une fin de phrase
    */

    // console.log("last characters: [" + pug_html.substr(pug_html.length - 6) + ']');
    if ( /\.\s*$/.test( this.spy.getPugHtml() ) ) {
      return true;
    }
    if ( />\s*$/.test( this.spy.getPugHtml() ) ) {
      return true;
    }

    return false;

  }

  getUppercaseWords(str: string): string {
    if (str!=null && str.length > 0) {
      if (this.spy.isEvaluatingEmpty()) {
        return 'SOME_WORDS';
      } else {
        return str.replace(/\b\w/g, l => l.toUpperCase());
      }
    }
  }

  hasFlag(params: any, flag: string): boolean {
    if (this.getFlagValue(params, flag)==true) {
      return true;
    } else {
      return false;
    }
  }

  getFlagValue(params: any, flag: string): any {
    if (params!=null) {
      if (flag!=null) {
        return params[flag];
      } else {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = 'getFlagValue flag value must not be null';
        throw err;
      }
    } else {
      return null;
    }
  }

  protectString(str: string): string {
    return '§' + str + '§';
  }
}
