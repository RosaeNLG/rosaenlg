
import * as compromise from "compromise";
import { isHAspire } from "french-h-muet-aspire";

import * as titleCase_en_US from "better-title-case";
import * as titleCase_fr_FR from "titlecase-french";


const protectMap = {
  "AMPROTECT": "&amp;",
  "LTPROTECT": "&lt;",
  "GTPROTECT": "&gt;"
};

function applyFilters(input:string, toApply: Array<Function>, language: string): string {
  let res: string = input;
  for (let i = 0; i<toApply.length; i++) {
    res = toApply[i](res, language);
    //console.log(res);
  }
  return res;  
};

class ProtectMapping {
  protected: string;
  mappings: any;
  constructor(params:any) {
    this.protected = params.protected;
    this.mappings = params.mappings;
  }
}

function unprotect(toUnprotect:string, mappings: any):string {
  // console.log('input: ' + input + ' / mappings: ' + JSON.stringify(mappings));
  let res: string = toUnprotect;
  for(let key in mappings){
    // console.log('key/val: ' + key + '/' + mappings[key]);
    res = res.replace(key, mappings[key]);
  }

  return res;

};


function protectHtmlEscapeSeq(input: string): string {
  let res:string = input;
  for(let key in protectMap) {
    res = res.replace(protectMap[key], key);
  }
  return res;
}

function unProtectHtmlEscapeSeq(input: string): string {
  let res: string = input;
  for(let key in protectMap) {
    res = res.replace(key, protectMap[key]);
  }
  return res;
}


function protectBlocks(input: string): ProtectMapping {

  let regexProtect: RegExp = new RegExp('§([^§]*)§', 'g');

  let mappings: any = {};

  let index: number = 0;
  let protectedInput: string = input.replace(regexProtect, function(corresp, first, offset, orig) {
    //console.log("§§§ :<" + corresp + '>' + first);
    // must not start with E otherwise creates issues with French constractions: d'ESCAPED
    let replacement = 'XESCAPED_SEQ_' + (++index);
    mappings[replacement] = first;
    return replacement;
  });

  // console.log('escaped: ' + protectedInput);
  return new ProtectMapping({
    'protected': protectedInput, 
    'mappings': mappings
  });

}


function getCompromiseValidArticle(input: string): string {
  let nlpRes = compromise(input).nouns().articles();
  //console.log( nlpRes[0] );
  return ( nlpRes!=null && nlpRes[0]!=null && ['a','an'].indexOf(nlpRes[0].article)>-1) ? nlpRes[0].article : null;
}





export function filter(input: string, language: string): string {
  // console.log('FILTER CALL');

  //console.log('FILTERING ' + input);
  
  const filterFctsWhenProtected: Array<Function> = [  
    joinLines, cleanSpacesPunctuation, cleanStruct, 
    parenthesis, addCaps, contractions,
    egg, titlecase
  ];
  
  let res: string = applyFilters(input, [ a_an_beforeProtect ], language);
  
  // pk ProtectMapping ne marche pas ici ???
  let protectedString: string = protectHtmlEscapeSeq(res);
  
  let protectedMappings:ProtectMapping = protectBlocks(protectedString);

  res = ('START. ' + protectedMappings.protected); // to avoid the problem of the ^ in regexp
  res = applyFilters(res, filterFctsWhenProtected, language);
  res = applyFilters(res, [ a_an ], language);
  res = unprotect(res, protectedMappings.mappings);
  res = unProtectHtmlEscapeSeq(res);
  res = res.replace(/^START\.\s*/, '');
  
  return res;
}



// same signature

function joinLines(input: string, lang: string): string {
  return input.replace(/\n|\r/g, " ");
}

function titlecase(input: string, lang: string) {
  let res: string = input;

  const titlecaseFlag: string = '_TITLECASE_';
  let regexTitlecase: RegExp = new RegExp(`${titlecaseFlag}\\s*(.*?)\\s*${titlecaseFlag}`, 'g');

  res = res.replace(regexTitlecase, function(corresp, first, offset, orig) {
    // console.log("TITLECASE :<" + corresp + '><' + first + '>');
    if (lang=='en_US') {
      return titleCase_en_US(first);

    } else if (lang=='fr_FR') {
      return titleCase_fr_FR.convert(first);
    }          
  });
  
  return res;
}

function egg(input: string, lang: string): string {
  let res: string = input;

  let x:string = '\x41\x64\x64\x76\x65\x6E\x74\x61';
  let regex: RegExp = new RegExp(x, 'g');
  res = res.replace(regex, x + ' 👍');

  return res;
}


function cleanSpacesPunctuation(input: string, lang: string): string {
  let res: string = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');



  // ['bla ! . bla', 'Bla! Bla'],
  res = res.replace(/\s*!\s*\.\s*/g, '!');

  // :
  if (lang=='en_US' || lang=='de_DE') {
    res = res.replace(/\s*:\s*/g, ': ');
  } else if (lang=='fr_FR') {
    res = res.replace(/\s*:\s*/g, ' : ');
  }  
  // !
  if (lang=='en_US' || lang=='de_DE') {
    res = res.replace(/\s*!/g, '!');
  } else if (lang=='fr_FR') {
    res = res.replace(/\s*!/g, ' !');
  }  
  // ? - same rule as !
  if (lang=='en_US' || lang=='de_DE') {
    res = res.replace(/\s*\?/g, '?');
  } else if (lang=='fr_FR') {
    res = res.replace(/\s*\?/g, ' ?');
  }  


  // 2 spaces
  res = res.replace(/\s{2,}/g, ' ');

  // </p>.
  // res = res.replace(/<\/p>\./g, '</p>');

  // remove spaces before and after dot
  res = res.replace(/(\.\s*)+/g, '.');    

  // no space before dot and 1 space after
  res = res.replace(/\s+\.\s*/g, '. ');

  // commas
  res = res.replace(/\s*,\s*/g, ', ');
  // ! + ? + semicolon ;
  if (lang=='en_US' || lang=='de_DE') {
    res = res.replace(/\s*!\s*/g, '! ');
    res = res.replace(/\s*\?\s*/g, '? ');
    res = res.replace(/\s*;\s*/g, '; ');
  } else if (lang=='fr_FR') {
    res = res.replace(/\s*!\s*/g, ' ! ');
    res = res.replace(/\s*\?\s*/g, ' ? ');
    res = res.replace(/\s*;\s*/g, ' ; ');
  }
  
  // comma and dot just after
  res = res.replace(/\s*,\s*\./g, '. ');

  // ['bla  .   </p>', 'bla.</p>']
  res = res.replace(/\s*\.\s*</g, '.<');

  // ['bla   </p>', 'bla</p>'],
  res = res.replace(/\s+<\/p>/g, '</p>');

  // ['xxx. </p>', 'xxx.</p>'],
  res = res.replace(/\.\s+<\/p>/g, '.</p>');

  // spaces at the very end
  res = res.trim();

  // eat spaces
  res = res.replace(/\s+EATSPACE\s+/g, '');
  

  // ...

  // ['bla …', 'bla…'],
  res = res.replace(/\s+…/g, '…');


  // ['bla ...bla', 'bla… bla'],
  let regexSpaceAfterEllipsis: RegExp = new RegExp('…\s*([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexSpaceAfterEllipsis, function(corresp, first, offset, orig) {
    //console.log("AAA :" + corresp);
    return '… ' + first;
  });


  // ['<li> xxx', '<li>xxx'],
  // ['xxx </li>', 'xxx<li>'],
  res = res.replace(/>\s+/g, '>');
  res = res.replace(/\s+</g, '<');

  if (lang=='en_US') {
    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'\s*/g, '\'');
  }



  return res;
}

function cleanStruct(input: string, lang: string): string {
  let res:string = input;

  res = res.replace('<p>.</p>', '');
  res = res.replace('</p>.</p>', '</p></p>');
  res = res.replace(/<\/p>\s*.\s*<\/p>/, '</p></p>');

  return res;
}

// quite the same as a_an but works when the string is protected
function a_an_beforeProtect(input: string, lang: string): string {
  let res: string = input;
  //console.log("xx: "+ input);

  if (lang=='en_US') {
    
    let regexA: RegExp = new RegExp('[^' + tousCaracteresMinMaj_re + '](([aA])\\s*§([' + tousCaracteresMinMaj_re + ']*))', 'g');
    res = res.replace(regexA, function(corresp, first, second, third, offset, orig) {
      // console.log(`BEFORE PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);
          
      let compResult = getCompromiseValidArticle(second + ' ' + third);
      
      if (compResult) {
        let replacement: string = compResult + ' ' + third;
        return corresp.substring(0,1) + second + '§' + replacement.substring(1);
      } else {
        // we do nothing
        return corresp;
      }
    });
    
  }
  return res;

}


function a_an(input: string, lang: string): string {

  let res: string = input;
  //console.log("xx: "+ input);

  if (lang=='en_US') {
    
    let regexA: RegExp = new RegExp('[^' + tousCaracteresMinMaj_re + '](([aA])\\s+([' + tousCaracteresMinMaj_re + ']*))', 'g');
    res = res.replace(regexA, function(corresp, first, second, third, offset, orig) {
      //console.log(`AFTER PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);
      
      // if it worked we use it, otherwise we do nothing
      // we catch third because compromise lib can change the text : AI->ai but we want to keep AI
      let compResult: string = getCompromiseValidArticle(first);
      
      if (compResult) {
        let replacement: string = `${compResult} ${third}`;
        // we keep the first char which was just before the 'a'
        // and we keep the caps (a or A)
        return corresp.substring(0,1) + second + replacement.substring(1);
      } else {
        return corresp;
      }

    });
    
  }
  return res;
}

function addCaps(input: string, lang: string): string {
  let res: string = input;

  let regexCapsAfterDot: RegExp = new RegExp('\\.\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexCapsAfterDot, function(corresp, first, offset, orig) {
    //console.log("AAA :" + corresp);
    return '. ' + first.toUpperCase();
  });

  let regexCapsAfterExMark: RegExp = new RegExp('\!\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexCapsAfterExMark, function(corresp, first, offset, orig) {
    //console.log("AAA :" + corresp);
    return '! ' + first.toUpperCase();
  });

  let regexCapsAfterQuestionMark: RegExp = new RegExp('\\?\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexCapsAfterQuestionMark, function(corresp, first, offset, orig) {
    //console.log("AAA :" + corresp);
    return '? ' + first.toUpperCase();
  });

  let regexCapsAfterP: RegExp = new RegExp('(<p>)\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexCapsAfterP, function(corresp, first, second, offset, orig) {
    // console.log("BBB :" + corresp);
    return first + second.toUpperCase();
  });

  // caps at the very beginning
  let regexCapsAtVeryBeginning: RegExp = new RegExp('^([' + tousCaracteresMinMaj_re + '])', 'g');
  res = res.replace(regexCapsAtVeryBeginning, function(corresp, first, offset, orig) {
    //console.log("AAA :" + corresp);
    return first.toUpperCase();
  });

  return res;

}

function parenthesis(input: string, lang: string): string {
  let res: string = input;

  // remove spaces after '(' or before ')'
  res = res.replace(/\(\s+/g, '(');
  res = res.replace(/\s+\)/g, ')');

  // add spaces before '(' or after ')'
  let regexSpaceBeforePar: RegExp = new RegExp('[' + tousCaracteresMinMaj_re + ']\\(', 'g');
  res = res.replace(regexSpaceBeforePar, function(corresp, offset, orig) {
    //console.log("BBB :<" + corresp + "><" + first + '>');
    return corresp.charAt(0) + ' (';
  });
  let regexSpaceAfterPar: RegExp = new RegExp('\\)[' + tousCaracteresMinMaj_re + ']', 'g');
  res = res.replace(regexSpaceAfterPar, function(corresp, first, offset, orig) {
    //console.log("BBB :<" + corresp + "><" + first + '>');
    return ') ' + corresp.charAt(1);
  });



  return res;
}

function contractions(input: string, lang: string): string {

  if (lang=='en_US') {
    return input;

  } else if (lang=='de_DE') {
    return input;

  } else if (lang=='fr_FR') {
    let res: string = input;
    
    // de + voyelle, que + voyelle, etc.
    const contrList: string[] = [ '[Dd]e', '[Qq]ue', '[Ll]e', '[Ll]a', '[Ss]e' ];
    for (let i=0; i<contrList.length; i++) {

      // gérer le cas où 'de' est en début de phrase
      let regexDe: RegExp = new RegExp(
        '(\\s+|p>)(' + contrList[i] + ')\\s+([' + toutesVoyellesMinMaj+'h' + '][' + tousCaracteresMinMaj_re + ']*)', 'g'
      );

      res = res.replace(regexDe, function(corresp, before, determinant, word, offset, orig) {
        if ( ! isHAspire(word) ) {
          return `${before}${determinant.substring(0,determinant.length-1)}'${word}`;
        } else {
          // do nothing
          return `${before}${determinant} ${word}`;
        }
      });
    }

    // ce arbre => cet arbre
    {
      let regexCe: RegExp = new RegExp(
        '(\\s+|p>)([Cc]e)\\s+([' + toutesVoyellesMinMaj+'h' + '][' + tousCaracteresMinMaj_re + ']*)', 'g');
      res = res.replace(regexCe, function(corresp, before, determinant, word, offset, orig) {
        // console.log(`${before} ${determinant} ${word}`);
        if ( ! isHAspire(word) ) {
          return `${before}${determinant}t ${word}`;
        } else {
          // do nothing
          return `${before}${determinant} ${word}`;
        }
      });
    }

    // de le => du
    res = res.replace(/\s+de\s+le\s+/g, ' du ');

    // De le => du
    res = res.replace(/De\s+le\s+/g, 'Du ');

    // de les => des
    res = res.replace(/\s+de\s+les\s+/g, ' des ');

    // De les => Des
    res = res.replace(/De\s+les\s+/g, 'Des ');
    
    // des les => des
    res = res.replace(/\s+des\s+les\s+/g, ' des ');

    if (input!=res) {
      //console.log("changed:" + input + '=>' + res);
    }
    return res;
  }


}


const correspondances = {
  a:"àáâãäå",
  A:"ÀÁÂ",
  e:"èéêë",
  E:"ÈÉÊË",
  i:"ìíîï",
  I:"ÌÍÎÏ",
  o:"òóôõöø",
  O:"ÒÓÔÕÖØ",
  u:"ùúûü",
  U:"ÙÚÛÜ",
  y:"ÿ",
  c: "ç",
  C:"Ç",
  n:"ñ",
  N:"Ñ"
}; 

function getNonAccentue(carRecherche: string): string {
  for (let caractere in correspondances){
    if (correspondances[caractere].indexOf(carRecherche)>-1) { return caractere; }
  }
}


const voyellesSimplesMinuscules: string = "aeiouy";
const toutesVoyellesMinuscules: string = getToutesVoyellesMinuscules();
const toutesVoyellesMajuscules: string = toutesVoyellesMinuscules.toUpperCase();
const toutesVoyellesMinMaj: string = toutesVoyellesMinuscules + toutesVoyellesMajuscules;

const tousCaracteresMinuscules_re: string = getTousCaracteresMinuscules_re();
const tousCaracteresMajuscules_re: string = tousCaracteresMinuscules_re.toUpperCase();
const tousCaracteresMinMaj_re: string = tousCaracteresMinuscules_re + tousCaracteresMajuscules_re + '\\-';
//console.log(tousCaracteresMinuscules_re);
//console.log(tousCaracteresMajuscules_re);
//console.log(toutesVoyellesMinMaj);

function getToutesVoyellesMinuscules(): string {
  let res = voyellesSimplesMinuscules;
  for (let i=0; i<voyellesSimplesMinuscules.length; i++) {
    res = res + correspondances[ voyellesSimplesMinuscules[i] ];
  }
  return res;
}
function getTousCaracteresMinuscules_re(): string {
  return 'a-z' + toutesVoyellesMinuscules;
}
