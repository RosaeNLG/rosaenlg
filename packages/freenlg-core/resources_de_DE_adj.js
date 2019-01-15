/*


*/

var readline = require('readline');
var fs = require('fs');

function processGermanAdjectives(inputFile, outputFile) {
  console.log(`starting to process German dictionary file: ${inputFile} for adjectives`);

  outputData = {};

  try {
    var lineReader = readline.createInterface({
      input: fs.createReadStream(inputFile)
    });

    if (fs.existsSync(outputFile)) { fs.unlink(outputFile); }
    var outputStream = fs.createWriteStream(outputFile);

    lineReader.on('line', function (line) {
      const lineData = line.split('\t');
      const flexForm = lineData[0];
      const lemma = lineData[1];
      const props = lineData[2].split(':');

      /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
      */
      if (props[0]=='ADJ' && props[4]=='GRU' /* && lemma=='alt' */) {
        // console.log(`${flexForm} ${lemma} ${props}`);

        const propCase = props[1];
        const propNumber = props[2];
        const propGender = props[3];
        const propArt = props[5];

        // create obj
        if ( outputData[lemma]==null ) {
          outputData[lemma] = {};
        }
        var wordData = outputData[lemma];

        if (wordData[propCase]==null) {
          wordData[propCase] = {};
        }
        var wordDataCase = wordData[propCase];

        if (wordDataCase[propArt]==null) {
          wordDataCase[propArt] = {};
        }
        wordDataCaseArt = wordDataCase[propArt];
        
        if (propNumber=='SIN') {
          const genderMapping = {
            'MAS': 'M',
            'FEM': 'F',
            'NEU':'N'
          };
          wordDataCaseArt[ genderMapping[propGender] ] = flexForm;
        } else { // 'PLU' we assume it's all the same, does not depend on gender
          wordDataCaseArt['P'] = flexForm;
        }


      }
      

    }).on('close', function() {
      // console.log(outputData);

      outputStream.write(JSON.stringify(outputData));
      console.log("done, produced: " + outputFile);
    });
  } catch (err) {
    console.log(err);
  }
}


processGermanAdjectives('resources_src/de_DE/german-pos-dict/dictionary.dump', 
  'resources_pub/de_DE/adjectives.json');
