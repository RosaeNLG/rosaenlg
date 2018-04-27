import { GenderNumberManager } from "./GenderNumberManager";


export class Helper {
  genderNumberManager: GenderNumberManager;
  spy: Spy;

  constructor(params: any) {
    this.genderNumberManager = params.genderNumberManager;  
  }

  getSorP(table: Array<string>, obj: any): string {
    let number = this.genderNumberManager.getRefNumber(obj);
    if (number==null || number=='S') {
      return table[0];
    } else if (number=='P') {
      return table[1];
    }
    return null;
  }

  getMorF(table: Array<string>, obj: any): string {
    let gender = this.genderNumberManager.getRefGender(obj);
    if (gender==null || gender=='M') {
      return table[0];
    } else if (gender=='F') {
      return table[1];
    }
    return null;
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
    if (flag==null) {
      console.log('ERROR: hasFlag must be called with a flag param!');
    }
    if (params!=null && params[flag]==true) {
      return true;
    } else {
      return false;
    }
  }

  getFlagValue(params: any, flag: string): any {
    if (flag==null) {
      console.log('ERROR: getFlagValue must be called with a flag param!');
    }
    if (params!=null) {
      return params[flag];
    } else {
      return null;
    }
  }

  protectString(str: string): string {
    return '§' + str + '§';
  }
}
