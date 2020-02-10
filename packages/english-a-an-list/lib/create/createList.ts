import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processEnglishAAn(inputFolder: string, outputFile: string, cb: Function): void {
  console.log('starting to process WordNet: ' + inputFolder);

  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

  const an = [];

  const reGeneral = new RegExp('[^\\w]an [\\w]+', 'g');
  const reDetail = new RegExp('[^\\w]an ([\\w]+)');

  fs.readdir(inputFolder, (err, files) => {
    const todo = [...files];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputFile = inputFolder + '/' + file;

      let count = 0;
      console.log(`reading file: ${inputFile}...`);

      try {
        const lineReader: ReadLine = createInterface({
          input: fs.createReadStream(inputFile),
        });

        lineReader
          .on('line', function(line: string): void {
            const matched = line.match(reGeneral);
            if (matched) {
              for (let j = 0; j < matched.length; j++) {
                const detail = matched[j].match(reDetail);

                // keep the case
                const word = detail[1];
                if (an.indexOf(word) == -1) {
                  an.push(word);
                }

                count++;
              }
            }
          })
          .on('close', function(): void {
            console.log(`${file}: extracted ${count}`);
            todo.splice(todo.indexOf(file), 1);
            if (todo.length == 0) {
              const anAsObj = {};
              for (let k = 0; k < an.length; k++) {
                anAsObj[an[k]] = 1;
              }
              outputStream.write(JSON.stringify(anAsObj));
              outputStream.close();
              //console.log(an);
              console.log(`done, produced: ${outputFile}`);
              cb();
            }
          });
      } catch (err) {
        console.log(err);
      }
    }
  });
}
