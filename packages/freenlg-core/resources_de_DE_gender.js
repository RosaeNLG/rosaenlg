/*


*/

var readline = require('readline');
var fs = require('fs');

function processGermanWords(inputFile, outputFile) {
  console.log("starting to process German dictionary file: " + inputFile);

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
      VER: <= ignore
      SUB: <=
      Telefon Telefon SUB,AKK,SIN,NEU
      Telefon Telefon SUB,DAT,SIN,NEU
      Telefon Telefon SUB,NOM,SIN,NEU
      Telefone Telefon SUB,AKK,PLU,NEU
      Telefone Telefon SUB,GEN,PLU,NEU
      Telefone Telefon SUB,NOM,PLU,NEU
      Telefonen Telefon SUB,DAT,PLU,NEU
      Telefons Telefon SUB,GEN,SIN,NEU
      */
      if (props[0]=='SUB'/* && lemma=='Telefon'*/) {
        // console.log(`${flexForm} ${lemma} ${props}`);

        const propCase = props[1];
        const propNumber = props[2];
        const propGender = props[3];

        // create obj
        if ( outputData[lemma]==null ) {
          outputData[lemma] = {};
        }

        var wordData = outputData[lemma];

        // gender
        if ( propCase=='NOM' && propNumber=='SIN' ) {
          const genderMapping = {
            'MAS': 'M',
            'FEM': 'F',
            'NEU':'N'
          };
          wordData['G'] = genderMapping[propGender];
        }

        // flex forms
        if (wordData[propCase]==null) {
          wordData[propCase] = {};
        }
        wordData[propCase][propNumber] = flexForm;
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


processGermanWords('resources_src/de_DE/german-pos-dict/dictionary.dump', 
  'resources_pub/de_DE/wordsWithGender.json');
