/*
  reads the LEFFF and produces a list of the French verbs with their conjugations

impératif Y : NA lorsque pas de sens
null lorsque pas dispo / pas de sens

P indicatif présent
F indicatif futur
I indicatif imparfait
J indicatif passé-simple
C conditionnel présent
Y imperatif présent
S subjonctif présent
T subjonctif imparfait
K participe passé
G participe présent
W infinitif présent

1 1repersonne
2 2epersonne
3 3epersonne
m genre masculin
f genre féeminin
s nombre singulier
p nombre pluriel

  */

var readline = require('readline');
var fs = require('fs');

function getPlaceholder(temps) {
  if (temps=='Y') { // impératif
    return ['NA', null, 'NA', null, null, 'NA'];
  } else if (temps=='K') { // participe passé
    return [null, null, null, null];
  } else if (temps=='G') { // participe présent
    return [null];
  } else if (temps=='W') { // infinitif
    return [null];
  } else { // cas général
    return [null, null, null, null, null, null];
  }  
}

function parseCode(code) {
  const TYPES_TEMPS = 'PFIJCYSTKGW';
  const TYPES_PERSONNES = '123';
  const TYPES_GENRES = 'mf';
  const TYPES_NOMBRES = 'sp';

  var res = {};
  res.liste_temps = [];
  res.liste_personne = [];
  res.liste_genre = [];
  res.liste_nombre = [];

  for (var i=0; i<code.length; i++) {
    var lettre = code[i];
    if ( TYPES_TEMPS.indexOf(lettre)>-1 ) {
      res.liste_temps.push(lettre);
    } else if ( TYPES_PERSONNES.indexOf(lettre)>-1 ) {
      res.liste_personne.push(lettre);
    } else if (TYPES_GENRES.indexOf(lettre)>-1) {
      res.liste_genre.push(lettre);
    } else if (TYPES_NOMBRES.indexOf(lettre)>-1) {
      res.liste_nombre.push(lettre);
    } else {
      console.log("lettre pas reconnue: " + lettre);
    }
  }
    
  return res;
}

function fillOutputData(parsedCode, verbData, ff) {
  for (var i=0; i<parsedCode.liste_temps.length; i++) {
    var temps = parsedCode.liste_temps[i];

    if ( verbData[temps]==null ) {
      verbData[temps] = getPlaceholder(temps);
    }

    if (temps=='K') { // participe passé : ms mp fs fp - c'est tout
      function hasGenreNombre(genre, nombre) {
        return parsedCode.liste_genre.indexOf(genre)!=-1 && parsedCode.liste_nombre.indexOf(nombre)!=-1;
      }
      if (hasGenreNombre('m','s')) { verbData[temps][0] = ff; }
      if (hasGenreNombre('m','p')) { verbData[temps][1] = ff; }
      if (hasGenreNombre('f','s')) { verbData[temps][2] = ff; }
      if (hasGenreNombre('f','p')) { verbData[temps][3] = ff; }

      // [ 'admis', 'v', 'admettre', 'Km' ]
      if ( parsedCode.liste_nombre.length==0 ) {
        if ( parsedCode.liste_genre.indexOf('m')!=-1 ) {
          verbData[temps][0] = ff;
          verbData[temps][1] = ff;
        }
        if ( parsedCode.liste_genre.indexOf('f')!=-1 ) {
          verbData[temps][2] = ff;
          verbData[temps][3] = ff;
        }
      }

      // [ 'autosuffi', 'v', 'autosuffire', 'K' ]
      if ( parsedCode.liste_nombre.length==0 &&  parsedCode.liste_genre.length==0 ) {
        verbData[temps][0] = ff;
        verbData[temps][1] = ff;
        verbData[temps][2] = ff;
        verbData[temps][3] = ff;
      }

    } else if (temps=='G') { // participe présent
      verbData[temps][0] = ff;
    } else if (temps=='W') { // infinitif
      verbData[temps][0] = ff;
    } else { // cas général
      for (var j=0; j<parsedCode.liste_personne.length; j++) {
        var personne = parsedCode.liste_personne[j];

        for (var k=0; k<parsedCode.liste_nombre.length; k++) {
          var nombre = parsedCode.liste_nombre[k];
          var indice = parseInt(personne) + ( nombre=='s' ? 0 : 3 ) - 1;
          // console.log(`${inf} ${temps} ${indice} = ${ff}` );
          verbData[temps][indice] = ff;
        }
      }  
    }
  }
}




function processFrenchVerbs(inputFile, outputFile) {
  console.log("starting to process LEFFF file: " + inputFile);

  outputData = {};

  try {
    var lineReader = readline.createInterface({
      input: fs.createReadStream(inputFile)
    });

    if (fs.existsSync(outputFile)) { fs.unlink(outputFile); }
    var outputStream = fs.createWriteStream(outputFile);

    lineReader.on('line', function (line) {
      var lineData = line.split('\t');

      if (lineData[1]=='v') {

        var ff = lineData[0];
        var inf = lineData[2];
        var code = lineData[3];

        function toIgnore() {
          if (inf=='_error') return true;
          if (inf=='être' && code=='P3p' && ff=='st') return true;
          return false;
        }

        if (!toIgnore() /* && inf=='boire' */) {

          //console.log(lineData);

          var parsedCode = parseCode(code);

          if ( outputData[inf]==null ) {
            outputData[inf] = {};
          }

          fillOutputData(parsedCode, outputData[inf], ff);
        
        }

      }

    }).on('close', function() {
      outputStream.write(JSON.stringify(outputData));
      console.log("done, produced: " + outputFile);
    });
  } catch (err) {
    console.log(err);
  }
}

processFrenchVerbs('resources_src/fr_FR/lefff-3.4.mlex/lefff-3.4.mlex', 'resources_pub/fr_FR/conjugations.json');
