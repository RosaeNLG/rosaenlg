/*
  reads the LEFFF and produces a list of the French verbs with their conjugations

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

function processFrenchWords(inputFile, outputFile) {
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
      /*
      boire	v	boire	W
      boirez	v	boire	F2p
      bois	v	boire	P12s

      PSs13 = présent de l'indicatif ou du subjonctif, à la 1re ou 2e personne du singulier.
      */
      const TYPES_TEMPS = 'PFIJCYSTKGW';
      const TYPES_PERSONNES = '123';
      const TYPES_GENRES = 'mf';
      const TYPES_NOMBRES = 'sp';

      if (lineData[1]=='v') {

        var ff = lineData[0];
        var inf = lineData[2];

        if (inf=='boire') {

          var code = lineData[3];
          
          var liste_temps = [];
          var liste_personne = [];
          var liste_genre = [];
          var liste_nombre = [];

          for (var i=0; i<code.length; i++) {
            var lettre = code[i];
            if ( TYPES_TEMPS.indexOf(lettre)>-1 ) {
              liste_temps.push(lettre);
            } else if ( TYPES_PERSONNES.indexOf(lettre)>-1 ) {
              liste_personne.push(lettre);
            } else if (TYPES_GENRES.indexOf(lettre)>-1) {
              liste_genre.push(lettre);
              /*
              [ 'bu', 'v', 'boire', 'Kms' ]
              [ 'bue', 'v', 'boire', 'Kfs' ]
              [ 'bues', 'v', 'boire', 'Kfp' ]
              [ 'bus', 'v', 'boire', 'Kmp' ]
              */
              // console.log(lineData);
            } else if (TYPES_NOMBRES.indexOf(lettre)>-1) {
              liste_nombre.push(lettre);
            } else {
              console.log("lettre pas reconnue: " + lettre);
            }
          }

          if ( outputData[inf]==null ) {
            outputData[inf] = {};
          }

          for (var i=0; i<liste_temps.length; i++) {
            var temps = liste_temps[i];

            if (temps=="P") {

              if ( outputData[inf][temps]==null ) {
                outputData[inf][temps] = ['TODO', 'TODO', 'TODO', 'TODO', 'TODO', 'TODO'];
              }
              for (var j=0; j<liste_personne.length; j++) {
                var personne = liste_personne[j];

                for (var k=0; k<liste_nombre.length; k++) {
                  var nombre = liste_nombre[k];
                  var indice = parseInt(personne) + ( nombre=='s' ? 0 : 3 ) - 1;
                  console.log(`${inf} ${temps} ${indice} = ${ff}` );
                  outputData[inf][temps][indice] = ff;
                }
  
              }

            }
    
          }
        
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


processFrenchWords('resources_src/fr_FR/lefff-3.4.mlex/lefff-3.4.mlex', 'resources_pub/fr_FR/conjugations.json');


