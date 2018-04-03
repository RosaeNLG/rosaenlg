
/*

*/

let testCasesByLang = {
  'fr_FR': [
    ['bla:bla', 'Bla : bla'],

  ],  
  'en_US': [

    // en_US specific
    ['bla:bla', 'Bla: bla'],
    
    // COMMON ONES

    // spaces ponctuation etc.
    ['mot1  mot2', 'Mot1 mot2'],
    ['bla ..', 'Bla.'],
    ['bla .   .', 'Bla.'],
    ['bla .. .', 'Bla.'],
    ['toto,il', 'Toto, il'],
    ['toto,   il', 'Toto, il'],
    ['bla, . bla', 'Bla. Bla'],
    ['bla,.bla', 'Bla. Bla'],
    ['bla  /   bla', 'Bla / bla'],
    ['bla/bla', 'Bla/bla'],
    ['bla ! . bla', 'Bla! Bla'],

    // ...
    ['bla …', 'Bla…'],
    ['bla ...', 'Bla…'],
    ['bla ...bla', 'Bla… bla'],

    // résidu d'assembly
    ['<p>.</p>', ''],
    ['</p>.</p>', '</p></p>'],
    ['</p> . </p>', '</p></p>'],
    ['bla bla. </p>', 'Bla bla.</p>'],
    ['bla.  .   </p>', 'Bla.</p>'],
    ['bla  .   </p>', 'Bla.</p>'],
    ['bla   </p>', 'Bla</p>'],
    

    // capitalization
    ['bla.bla', 'Bla. Bla'],
    ['bla.Bla', 'Bla. Bla'],
    ['bla. bla', 'Bla. Bla'], 
    ['bla. à côté', 'Bla. À côté'], 
    ['bla. de une part', 'Bla. D\'une part'], 
    ['<p>toto</p>', '<p>Toto</p>'],
    ['<pa>toto</pa>', '<pa>toto</pa>'],
    ['<i>toto</i>', '<i>toto</i>'],
    ['<p> test', '<p>Test'],
    ['<p>the xxx', '<p>The xxx'],
    ['<p>  the xxx', '<p>The xxx'],
    ['  the xxx', 'The xxx'],
    ['xxx. </p>', 'Xxx.</p>'],

    // parenthesis
    ['bla( bla bla )', 'Bla (bla bla)'],
    ['bla(bla', 'Bla (bla'],
    ['bla( bla', 'Bla (bla'],
    ['bla    ( bla', 'Bla (bla'],
    ['bla)bla', 'Bla) bla'],

    // contractions
    ['bla de votre', 'Bla de votre'],
    ['test de un', 'Test d\'un'],
    ['test de à côté', 'Test d\'à côté'],
    ['test de À côté', 'Test d\'À côté'],
    ['bla de 0.35 carat', 'Bla de 0.35 carat'],
    ['test que à', 'Test qu\'à'],
    ['test de le test', 'Test du test'],
    ['test de les test', 'Test des test'],
    ['de les test', 'Des test'],
    ['test des les test', 'Test des test'],
    ['test de le Or', 'Test de l\'Or'],
    ['bla a AI company', 'Bla an AI company'],
    ['bla a §AI company§', 'Bla an AI company'],
    ['bla a §AI company a hour§', 'Bla an AI company a hour'],
    ['a AI company', 'An AI company'],

    // escaped blocks
    ['bla §Security Bank Corp. (Philippines)§ bla', 'Bla Security Bank Corp. (Philippines) bla'],
    ['bla §Tokio Marine Holdings, Inc.§ and §Nomura Holdings, Inc.§ bla', 'Bla Tokio Marine Holdings, Inc. and Nomura Holdings, Inc. bla']
  ]
}


var compromise = require('compromise');

String.prototype.unprotect = function(mappings) {

  // console.log('input: ' + input + ' / mappings: ' + JSON.stringify(mappings));
  var res = this;
  for(var key in mappings){
    // console.log('key/val: ' + key + '/' + mappings[key]);
    res = res.replace(key, mappings[key]);
  }

  return res;

};

String.prototype.protectBlocks = function() {

  var regexProtect = new RegExp('§([^§]*)§', 'g');

  var mappings = {};

  var index = 0;
  protectedInput = this.replace(regexProtect, function(corresp, first, offset, orig) {
    //console.log("§§§ :<" + corresp + '>' + first);
    var replacement = 'ESCAPED_SEQ_' + (++index);
    mappings[replacement] = first;
    return replacement;
  });

  // console.log('escaped: ' + protectedInput);
  return { 'input': protectedInput, 'mappings': mappings };

};


let filter = function(input, params) {

  // awfull
  var theLanguage = (this!=null && this.language!=null) ? this.language : params.language;
  //console.log(JSON.stringify(this));
  
  //console.log('language is: ' + theLanguage);
  if (theLanguage==null) {
    console.log('ERROR: in filter language is mandatory');
  }

  String.prototype.applyFilters = function(toApply) {
    res = this;
    for (var i = 0; i<toApply.length; i++) {
      res = filters[toApply[i]](res, theLanguage);
      //console.log(res);
    }
    return res;  
  };

  var filterFctsWhenProtected = [  
    'joinLines', 'cleanSpacesPunctuation', 'cleanStruct', 
    'parenthesis', 'addCaps', 'contractions',
    'egg'
  ];
  
  var res = input.applyFilters([ 'a_an_beforeProtect' ]);
  var protected = res.protectBlocks();
  
  
  res = ('START. ' + protected.input) // to avoid the problem of the ^ in regexp
    .applyFilters(filterFctsWhenProtected)
    .applyFilters([ 'a_an' ])
    .unprotect(protected.mappings)
    .replace(/^START\.\s*/, '');
  
  return res;

};

module.exports = {
  filter,
  testCasesByLang
};

const filters = {

  joinLines: function (input) {
    var res = input;
    res = res.replace(/\r\n/g, ' ');
    res = res.replace(/\n/g, ' ');

    return res;
  },

  egg: function(input, lang) {
    var res = input;

    var x = '\x41\x64\x64\x76\x65\x6E\x74\x61';
    var regex = new RegExp(x, 'g');
    res = res.replace(regex, x + ' 👍');

    return res;
  },

  cleanSpacesPunctuation: function(input, lang) {
    var res = input;

    // ['bla ...', 'bla…'],
    res = res.replace(/\.\.\./g, '…');

    // :
    if (lang=='en_US') {
      res = res.replace(/\s*:\s*/g, ': ');
    }
    else if (lang=='fr_FR') {
      res = res.replace(/\s*:\s*/g, ' : ');
    }  


    // ['bla ! . bla', 'Bla! Bla'],
    res = res.replace(/\s*!\s*\.\s*/g, '!');

    // !
    if (lang=='en_US') {
      res = res.replace(/\s*!/g, '!');
    }
    else if (lang=='fr_FR') {
      res = res.replace(/\s*!/g, ' !');
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
    var regexSpaceAfterEllipsis = new RegExp('…\s*([' + tousCaracteresMinMaj_re + '])', 'g');
    res = res.replace(regexSpaceAfterEllipsis, function(corresp, first, offset, orig) {
      //console.log("AAA :" + corresp);
      return '… ' + first;
    });



    return res;
  },

  cleanStruct: function(input) {
    var res = input;

    res = res.replace('<p>.</p>', '');
    res = res.replace('</p>.</p>', '</p></p>');
    res = res.replace(/<\/p>\s*.\s*<\/p>/, '</p></p>');

    return res;
  },

  // quite the same as a_an but works when the string is protected
  a_an_beforeProtect: function(input, lang) {
    var res = input;
    //console.log("xx: "+ input);

    if (lang=='en_US') {
      
      var regexA = new RegExp('[^' + tousCaracteresMinMaj_re + '](([aA])\\s*§([' + tousCaracteresMinMaj_re + ']*))', 'g');
      res = res.replace(regexA, function(corresp, first, second, third, offset, orig) {
        // console.log("first:<" + first + ">" + " second:<" + second + ">" + " third:<" + third + ">");
        
        var nlpRes = compromise(second + ' ' + third).nouns().articles();

        var replacement = ( nlpRes!=null && nlpRes[0]!=null ) ? (nlpRes[0].article + ' ' + third) : first;

        var res = corresp.substring(0,1) + second + '§' + replacement.substring(1);
        // console.log('<' + corresp + '> => <' + res + '>');
        return res;
      });
      
    }
    return res;

  },

  a_an: function(input, lang) {
  
    var res = input;
    //console.log("xx: "+ input);

    if (lang=='en_US') {
      
      var regexA = new RegExp('[^' + tousCaracteresMinMaj_re + '](([aA])\\s+([' + tousCaracteresMinMaj_re + ']*))', 'g');
      res = res.replace(regexA, function(corresp, first, second, third, offset, orig) {
        // console.log("first:<" + first + ">" + " second:<" + second + ">" + " third:<" + third + ">");
        
        var nlpRes = compromise(first).nouns().articles();

        // if it worked we use it, otherwise we do nothing
        // we catch third because compromise lib can change the text : AI->ai but we want to keep AI
        var replacement = ( nlpRes!=null && nlpRes[0]!=null ) ? (nlpRes[0].article + ' ' + third) : first;

        // we keep the first char which was just before the 'a'
        // and we keep the caps (a or A)
        var res = corresp.substring(0,1) + second + replacement.substring(1);
        // console.log('<' + corresp + '> => <' + res + '>');
        return res;
      });
      
    }
    return res;
  },

  addCaps: function(input) {
    var res = input;

    var regexCapsAfterDot = new RegExp('\\.\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
    res = res.replace(regexCapsAfterDot, function(corresp, first, offset, orig) {
      //console.log("AAA :" + corresp);
      return '. ' + first.toUpperCase();
    });

    var regexCapsAfterExMark = new RegExp('\!\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
    res = res.replace(regexCapsAfterExMark, function(corresp, first, offset, orig) {
      //console.log("AAA :" + corresp);
      return '! ' + first.toUpperCase();
    });


    var regexCapsAfterP = new RegExp('(<p>)\\s*([' + tousCaracteresMinMaj_re + '])', 'g');
    res = res.replace(regexCapsAfterP, function(corresp, first, second, offset, orig) {
      // console.log("BBB :" + corresp);
      return first + second.toUpperCase();
    });

    // caps at the very beginning
    var regexCapsAtVeryBeginning = new RegExp('^([' + tousCaracteresMinMaj_re + '])', 'g');
    res = res.replace(regexCapsAtVeryBeginning, function(corresp, first, offset, orig) {
      //console.log("AAA :" + corresp);
      return first.toUpperCase();
    });
 
    return res;
  
  },

  parenthesis: function(input) {
    var res = input;

    // remove spaces after '(' or before ')'
    res = res.replace(/\(\s+/g, '(');
    res = res.replace(/\s+\)/g, ')');

    // add spaces before '(' or after ')'
    var regexSpaceBeforePar = new RegExp('[' + tousCaracteresMinMaj_re + ']\\(', 'g');
    res = res.replace(regexSpaceBeforePar, function(corresp, offset, orig) {
      //console.log("BBB :<" + corresp + "><" + first + '>');
      return corresp.charAt(0) + ' (';
    });
    var regexSpaceAfterPar = new RegExp('\\)[' + tousCaracteresMinMaj_re + ']', 'g');
    res = res.replace(regexSpaceAfterPar, function(corresp, first, offset, orig) {
      //console.log("BBB :<" + corresp + "><" + first + '>');
      return ') ' + corresp.charAt(1);
    });



    return res;
  },

  contractions: function(input) {
    var res = input;
    
    // de + voyelle, que + voyelle, etc.

    var contrList = [ '[Dd]e', '[Qq]ue', '[Ll]e', '[Ll]a' ];
    
    for (var i=0; i<contrList.length; i++) {

      // gérer le cas où 'de' est en début de phrase
      var regexDe = new RegExp('\\s+(' + contrList[i] + ')\\s+(?=[' + toutesVoyellesMinMaj + '])', 'g');

      // res = res.replace(/\s+de\s+(?=[AÀÂÄEÉÈÊËIÎÏOÔÖUÛÜYaàâäeéèêëiîïoôôuûüy])/g, ' d\'');
      res = res.replace(regexDe, function(corresp, first, offset, orig) {
        // console.log("BBB :<" + corresp + '>' + first);
        return ' ' + first.substring(0,first.length-1) + '\'';
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

    return res;
  
  }



};




var correspondances = {
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

function getNonAccentue(carRecherche){
  for (caractere in correspondances){
    if (correspondances[caractere].indexOf(carRecherche)>-1) { return caractere; }
  }
}


var voyellesSimplesMinuscules = "aeiouy";
var toutesVoyellesMinuscules = getToutesVoyellesMinuscules();
var toutesVoyellesMajuscules = toutesVoyellesMinuscules.toUpperCase();
var toutesVoyellesMinMaj = toutesVoyellesMinuscules + toutesVoyellesMajuscules;

var tousCaracteresMinuscules_re = getTousCaracteresMinuscules_re();
var tousCaracteresMajuscules_re = tousCaracteresMinuscules_re.toUpperCase();
var tousCaracteresMinMaj_re = tousCaracteresMinuscules_re + tousCaracteresMajuscules_re;
//console.log(tousCaracteresMinuscules_re);
//console.log(tousCaracteresMajuscules_re);
//console.log(toutesVoyellesMinMaj);

function getToutesVoyellesMinuscules() {
  var res = voyellesSimplesMinuscules;
  for (var i=0; i<voyellesSimplesMinuscules.length; i++) {
    res = res + correspondances[ voyellesSimplesMinuscules[i] ];
  }
  return res;
}
function getTousCaracteresMinuscules_re() {
  return 'a-z' + toutesVoyellesMinuscules;
}
