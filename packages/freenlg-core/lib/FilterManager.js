const titleCase_en_US = require('titlecase');
const titleCase_fr_FR = require('titlecase-french');
var compromise = require('compromise');

function FilterManager(params) {
  this.hasFilteredInMixin = false;
  this.language = params.language;
};



function getCompromiseValidArticle(input) {
  var nlpRes = compromise(input).nouns().articles();
  //console.log( nlpRes[0] );
  return ( nlpRes!=null && nlpRes[0]!=null && ['a','an'].indexOf(nlpRes[0].article)>-1) ? nlpRes[0].article : null;
}


String.prototype.unprotect = function(mappings) {

  // console.log('input: ' + input + ' / mappings: ' + JSON.stringify(mappings));
  var res = this;
  for(var key in mappings){
    // console.log('key/val: ' + key + '/' + mappings[key]);
    res = res.replace(key, mappings[key]);
  }

  return res;

};

const protectMap = {
  "AMPROTECT": "&amp;",
  "LTPROTECT": "&lt;",
  "GTPROTECT": "&gt;"
};
String.prototype.protectHtmlEscapeSeq = function() {
  var protectedInput = this;
  for(var key in protectMap) {
    protectedInput = protectedInput.replace(protectMap[key], key);
  }
  return protectedInput;
};
String.prototype.unProtectHtmlEscapeSeq = function() {
  var unProtectedInput = this;
  for(var key in protectMap) {
    unProtectedInput = unProtectedInput.replace(key, protectMap[key]);
  }
  return unProtectedInput;
};




String.prototype.protectBlocks = function() {

  var regexProtect = new RegExp('§([^§]*)§', 'g');

  var mappings = {};

  var index = 0;
  var protectedInput = this.replace(regexProtect, function(corresp, first, offset, orig) {
    //console.log("§§§ :<" + corresp + '>' + first);
    var replacement = 'ESCAPED_SEQ_' + (++index);
    mappings[replacement] = first;
    return replacement;
  });

  // console.log('escaped: ' + protectedInput);
  return { 'input': protectedInput, 'mappings': mappings };

};



FilterManager.prototype.filterForMixin = function(mixinName, params) {

  var html_before = this.spy.getPugHtml();
  this.spy.getPugMixins()[mixinName](params);
  var produced = this.spy.getPugHtml().substring(html_before.length);
  this.spy.setPugHtml( html_before + this.filter(produced, 'mixinFiltering') );

  // we return the unfiltered content for debug
  return produced;
};


FilterManager.prototype.filter = function(input, context) {

  // we don't make the final global filtering if some parts of the text have already been filtered before
  if (context=='finalFiltering' && this.hasFilteredInMixin) {
    // console.log('WE WONT FILTER TWICE');
    return input;
  }

  if (context=='mixinFiltering') {
    this.hasFilteredInMixin = true;
  }

  //console.log('FILTERING ' + input);

  var language = this.language;
  String.prototype.applyFilters = function(toApply) {
    res = this;
    for (var i = 0; i<toApply.length; i++) {
      res = filters[toApply[i]](res, language);
      //console.log(res);
    }
    return res;  
  };

  var filterFctsWhenProtected = [  
    'joinLines', 'cleanSpacesPunctuation', 'cleanStruct', 
    'parenthesis', 'addCaps', 'contractions',
    'egg', 'titlecase'
  ];
  
  var res = input.applyFilters([ 'a_an_beforeProtect' ]);
  var protected = res.protectHtmlEscapeSeq().protectBlocks();
   
  res = ('START. ' + protected.input) // to avoid the problem of the ^ in regexp
    .applyFilters(filterFctsWhenProtected)
    .applyFilters([ 'a_an' ])
    .unprotect(protected.mappings)
    .unProtectHtmlEscapeSeq()
    .replace(/^START\.\s*/, '');
  
  return res;

};

module.exports = {
  FilterManager,
};



const filters = {

  joinLines: function (input) {
    return input.replace(/\n|\r/g, " ");
  },

  titlecase: function(input, lang) {
    var res = input;

    const titlecaseFlag = '_TITLECASE_';
    var regexTitlecase = new RegExp(`${titlecaseFlag}\\s*(.*?)\\s*${titlecaseFlag}`, 'g');

    res = res.replace(regexTitlecase, function(corresp, first, offset, orig) {
      // console.log("TITLECASE :<" + corresp + '><' + first + '>');
      if (lang=='en_US') {
        return titleCase_en_US.toLaxTitleCase(first);
      } else if (lang=='fr_FR') {
        return titleCase_fr_FR.convert(first);
      }          
    });
    
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


    // ['<li> xxx', '<li>xxx'],
    // ['xxx </li>', 'xxx<li>'],
    res = res.replace(/>\s+/g, '>');
    res = res.replace(/\s+</g, '<');

    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'\s*/g, '\'');


    // semicolon ;
    if (lang=='en_US') {
      res = res.replace(/\s*;\s*/g, '; ');
    } else if (lang=='fr_FR') {
      res = res.replace(/\s*;\s*/g, ' ; ');
    }  



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
        // console.log(`BEFORE PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);
            
        var compResult = getCompromiseValidArticle(second + ' ' + third);
        
        if (compResult) {
          var replacement = compResult + ' ' + third;
          return corresp.substring(0,1) + second + '§' + replacement.substring(1);
        } else {
          // we do nothing
          return corresp;
        }
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
        //console.log(`AFTER PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);
        
        // if it worked we use it, otherwise we do nothing
        // we catch third because compromise lib can change the text : AI->ai but we want to keep AI
        var compResult = getCompromiseValidArticle(first);
        
        if (compResult) {
          var replacement = `${compResult} ${third}`;
          // we keep the first char which was just before the 'a'
          // and we keep the caps (a or A)
          return corresp.substring(0,1) + second + replacement.substring(1);
        } else {
          return corresp;
        }

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

function getNonAccentue(carRecherche){
  for (caractere in correspondances){
    if (correspondances[caractere].indexOf(carRecherche)>-1) { return caractere; }
  }
}


const voyellesSimplesMinuscules = "aeiouy";
const toutesVoyellesMinuscules = getToutesVoyellesMinuscules();
const toutesVoyellesMajuscules = toutesVoyellesMinuscules.toUpperCase();
const toutesVoyellesMinMaj = toutesVoyellesMinuscules + toutesVoyellesMajuscules;

const tousCaracteresMinuscules_re = getTousCaracteresMinuscules_re();
const tousCaracteresMajuscules_re = tousCaracteresMinuscules_re.toUpperCase();
const tousCaracteresMinMaj_re = tousCaracteresMinuscules_re + tousCaracteresMajuscules_re;
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
