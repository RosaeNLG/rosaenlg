'use strict';

function agreeSingleWord(str) {
  const euAuWithS = ['bleu', 'émeu', 'landau', 'pneu', 'sarrau', 'beu', 'bisteu', 'enfeu', 'eu', 'neuneu', 'rebeu'];
  const ouWithX = ['bijou', 'chou', 'genou', 'caillou', 'hibou', 'joujou', 'pou', 'ripou', 'chouchou', 'boutchou'];
  const ailToAux = ['bail', 'corail', 'émail', 'gemmail', 'soupirail', 'travail', 'vantail', 'vitrail'];
  const alWithS = [
    'aval',
    'bal',
    'banal',
    'bancal',
    'cal',
    'carnaval',
    'cérémonial',
    'choral',
    'étal',
    'fatal',
    'festival',
    'natal',
    'naval',
    'pal',
    'récital',
    'régal',
    'tonal',
    'val',
    'virginal',
    'chacal',
    'serval',
  ];
  const exceptions = {
    ail: 'aulx',
    oeil: 'yeux',
    œil: 'yeux',
  };

  const last_letter = str[str.length - 1], // Last letter of str
    last_2_letters = str.slice(-2), // Last 3 letters of str
    last_3_letters = str.slice(-3);
  // exception for /s/z/x
  if (exceptions[str]) {
    return exceptions[str];
  } else if (last_letter === 's' || last_letter === 'z' || last_letter === 'x') {
    return str;
  }
  // Exception for /eau/au/eu
  else if (last_2_letters === 'au' || last_2_letters === 'eu') {
    if (euAuWithS.includes(str)) {
      return str + 's';
    } else {
      return str + 'x';
    }
  } else if (last_2_letters === 'ou') {
    if (ouWithX.includes(str)) {
      return str + 'x';
    } else {
      return str + 's';
    }
  } else if (last_3_letters === 'ail') {
    if (ailToAux.includes(str)) {
      const radical = str.substring(0, str.length - 3);
      return radical + 'aux';
    } else {
      return str + 's';
    }
  } else if (last_2_letters === 'al') {
    if (alWithS.includes(str)) {
      return str + 's';
    } else {
      const radical = str.substring(0, str.length - 2);
      return radical + 'aux';
    }
  } else {
    return str + 's';
  }
}

module.exports = function (fullStr) {
  const strings = fullStr.split(' ');

  if (strings.length === 1) {
    return agreeSingleWord(strings[0]);
  } else if (strings.length > 1 && strings[1] === 'à') {
    // machine à laver
    return agreeSingleWord(strings[0]) + ' ' + strings.slice(1).join(' ');
  } else {
    const plurals = [];
    for (let i = 0; i < strings.length; i++) {
      plurals.push(agreeSingleWord(strings[i]));
    }
    return plurals.join(' ');
  }
};
