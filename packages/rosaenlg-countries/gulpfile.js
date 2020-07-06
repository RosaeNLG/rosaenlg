const { /*src, dest,*/ series, parallel } = require('gulp');
const fs = require('fs');
// const countries = require('world-countries/dist/countries.json');

function init(cb) {
  const folders = ['dist'];

  folders.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log('📁  folder created:', dir);
    }
  });
  cb();
}

function getCountry(countries, cca2) {
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (country.cca2 == cca2) {
      return country;
    }
  }
}

// see https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000019509867&dateTexte=
function addNlgCountries(countries) {
  const toAdd = [
    ['BZ', 'Bélize'],
    ['LR', 'Libéria'],
    ['MK', 'Macédoine'],
    ['PW', 'Palaos'],
    ['VA', 'Saint-Siège'],
    ['ST', 'Sao Tomé-et-Principe'],
    ['SR', 'Suriname'],
    ['VN', 'Vietnam'],
    ['CD', 'République démocratique du Congo'],
    ['CZ', 'République tchèque'],
  ];

  for (let i = 0; i < toAdd.length; i++) {
    getCountry(countries, toAdd[i][0]).translations.fra.nlg = { name: toAdd[i][1] };
  }
}

function getDeFrList() {
  const raw = fs.readFileSync('lib/deFr.txt', 'utf8');
  const lines = raw.split(/[\n]/);
  const res = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const beginings = ['de la', 'des', "de l'", 'de', 'du', "d'"]; // order matters
    let found = false;
    for (let j = 0; j < beginings.length; j++) {
      if (line.startsWith(beginings[j])) {
        found = true;
        const name = line.replace(beginings[j], '').trim();
        res[name] = beginings[j];
        break;
      }
    }
    if (!found) {
      console.log(`not found: ${line}`);
    }
  }
  return res;
}

function getIndexForFrName(countries, name) {
  for (let i = 0; i < countries.length; i++) {
    const translations = countries[i].translations;
    const fraTr = translations.fra;
    if (!fraTr) {
      throw new Error(`no fra translation for ${name}`);
    }
    //console.log(fraTr.common);
    if (
      fraTr.common.toLocaleLowerCase() == name.toLocaleLowerCase() ||
      (fraTr.nlg && fraTr.nlg.name && fraTr.nlg.name.toLocaleLowerCase() == name.toLocaleLowerCase())
    ) {
      return i;
    }
  }
  return -1;
}

function enrichFr(countries) {
  addNlgCountries(countries);

  const deList = getDeFrList();
  // console.log(deList);

  const raw = fs.readFileSync('lib/rawFr.csv', 'utf8');
  const lines = raw.split(/[\n]/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const elts = line.split(',');

    // console.log(elts);
    const origName = elts[0].replace('’', "'");
    const origArticle = elts[1];
    const origGenre = elts[2];
    const origAle = elts[3].replace(origName, '').trim();

    // find the country
    const foundCountryIndex = getIndexForFrName(countries, origName);

    if (foundCountryIndex == -1) {
      throw new Error(`no country found for ${origName}`);
    }

    // genre
    let finalGenre;
    switch (origGenre) {
      case 'masculin':
        finalGenre = 'M';
        break;
      case 'féminin':
        finalGenre = 'F';
        break;
      default:
        throw new Error(`unknown gender: ${origGenre}`);
    }

    // article
    let contract = false;
    let plural = false;
    let noArticle = false;
    switch (origArticle) {
      case 'le': {
        if (finalGenre != 'M') {
          throw new Error(`strange: ${elts}, ${origArticle}, ${finalGenre}`);
        }
        break;
      }
      case 'la': {
        if (finalGenre != 'F') {
          throw new Error(`strange: ${elts}, ${origArticle}, ${finalGenre}`);
        }
        break;
      }
      case 'l’': {
        contract = true;
        break;
      }
      case 'les': {
        plural = true;
        if (origAle != 'aux') {
          console.log(`strange: ${elts}`);
        }
        break;
      }
      case 'sans article': {
        noArticle = true;
        break;
      }
      default: {
        console.log(elts);
      }
    }
    const finalAle = origAle.replace('’', "'");

    let finalDe;
    if (deList[origName]) {
      finalDe = deList[origName];
      delete deList[origName];
    }

    const nlgObj = countries[foundCountryIndex].translations.fra.nlg || {};

    nlgObj.gender = finalGenre;
    nlgObj.ale = finalAle;
    nlgObj.de = finalDe;
    if (contract) {
      nlgObj.contract = true;
    }
    if (plural) {
      nlgObj.plural = true;
    }
    if (noArticle) {
      nlgObj.noArticle = true;
    }
    // console.log(nlgObj);

    countries[foundCountryIndex].translations.fra.nlg = nlgObj;
  }
}

function getFrenchExtract(countries) {
  return countries.map((country) => {
    let res = {
      cca2: country.cca2,
      ccn3: country.ccn3,
      cca3: country.cca3,
    };
    res = { ...res, ...country.translations.fra.nlg };
    if (!res.name) {
      res.name = country.translations.fra.common;
    }
    return res;
  });
}

// https://www.grammar-quizzes.com/article4c.html
function enrichEn(countries) {
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const commonName = country.name.common;
    // const officialName = country.name.official;
    // console.log(commonName);
    const elts = commonName.split(' ');

    let article = false;
    let capitalize = false;

    const isSingleName = elts.length == 1;
    const isPlural = commonName.endsWith('s');

    const kindsOfState = ['republic', 'kingdom', 'principality', 'commonwealth', 'union', 'confederation', 'states'];
    let isKindOfState = false;
    for (let j = 0; j < kindsOfState.length; j++) {
      if (commonName.toLocaleLowerCase().indexOf(kindsOfState[j]) > -1) {
        isKindOfState = true;
        break;
      }
    }

    const hasAnd = commonName.indexOf(' and ') > -1;

    let done = false;

    // article, capitalize
    const hardCoded = {
      'Vatican City': [true, false],
      Gambia: [true, true],
      Barbados: [false, false],
      Bahamas: [true, true],
      'Heard Island and McDonald Islands': [false, false],
      'Saint Kitts and Nevis': [false, false], // is not plural...
      'Saint Vincent and the Grenadines': [false, false],
    };

    if (hardCoded[commonName]) {
      article = hardCoded[commonName][0];
      capitalize = hardCoded[commonName][1];
      done = true;
    } else {
      if (isPlural) {
        article = true;
        done = true;
      } else if (isKindOfState) {
        article = true;
        done = true;
      } else {
        if (isSingleName) {
          article = false;
          done = true;
        } else if (hasAnd) {
          article = false;
          done = true;
        }
      }
    }

    country.nlg = {};
    if (article) {
      country.nlg.article = true;
    }
    if (capitalize) {
      country.nlg.capitalize = true;
    }

    /*
    if (!done) {
      console.log('XXXX', commonName);
    }
    */
  }
}

function getEnglishExtract(countries) {
  return countries.map((country) => {
    const res = {
      cca2: country.cca2,
      ccn3: country.ccn3,
      cca3: country.cca3,
      name: country.name.common,
    };
    if (country.nlg.article) {
      res.article = true;
    }
    if (country.nlg.capitalize) {
      res.capitalize = true;
    }
    return res;
  });
}

function writeJsFile(language, parsedResource, cb) {
  let countriesJs = fs.readFileSync('lib/countries.js', 'utf-8');
  countriesJs = countriesJs
    .replace('COUNTRIES_PLACEHOLDER', '`' + JSON.stringify(parsedResource) + '`')
    .replace(/_LANG/g, '_' + language);

  fs.writeFile(`dist/countries_${language}.js`, countriesJs, 'utf-8', cb);
}

function doFrench(cb) {
  const countries = JSON.parse(fs.readFileSync('../../node_modules/world-countries/dist/countries.json', 'utf-8'));
  enrichFr(countries);
  writeJsFile('fr_FR', getFrenchExtract(countries, cb), cb);
}

function doEnglish(cb) {
  const countries = JSON.parse(fs.readFileSync('../../node_modules/world-countries/dist/countries.json', 'utf-8'));
  enrichEn(countries);
  writeJsFile('en_US', getEnglishExtract(countries, cb), cb);
}

function copyPug(cb) {
  fs.copyFile('lib/countries.pug', 'dist/countries.pug', cb);
}

exports.buildlist = parallel(series(init, parallel(doFrench, doEnglish)), copyPug);
