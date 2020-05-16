import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

const modes = ['cond', 'ger', 'impr', 'ind', 'inf', 'part', 'sub'];
const tenses = ['pres', 'past', 'impf', 'fut'];
const possibleClitics = [
  'cela',
  'cele',
  'celi',
  'celo',
  'cene',
  'ci',
  'gli',
  'gliela',
  'gliele',
  'glieli',
  'glielo',
  'gliene',
  'la',
  'le',
  'li',
  'lo',
  'mela',
  'mele',
  'meli',
  'melo',
  'mene',
  'mi',
  'ne',
  'sela',
  'sele',
  'seli',
  'selo',
  'sene',
  'si',
  'tela',
  'tele',
  'teli',
  'telo',
  'tene',
  'ti',
  'vela',
  'vele',
  'veli',
  'velo',
  'vene',
  'vi',
];

export function processItalianVerbs(inputFile: string, outputFile: string, cb: Function): void {
  console.log(`starting to process Italian dictionary file: ${inputFile} for verbs`);

  const outputData: any = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile, { encoding: 'latin1' }),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        if (lineData.length != 3) {
          return;
        }
        const flexForm: string = lineData[0];
        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');

        if (props.length != 2) {
          return;
        }
        const derivational: string[] = props[0].split('-');
        if (derivational.length < 1) {
          return;
        }
        const type = derivational[0];
        const inflectional: string[] = props[1].split('+');

        if (type === 'VER' && lemma != 'essere' && lemma != 'avere') {
          //console.log(`${flexForm} ${lemma} ${props}`);

          // cond/ger/impr/ind/inf/part/sub: Conditional, gerundive, imperative, indicative, infinitive, participle, subjunctive.
          let mode: string;
          for (let i = 0; i < modes.length; i++) {
            if (inflectional.indexOf(modes[i]) > -1) {
              mode = modes[i];
              break;
            }
          }
          if (!mode) {
            console.log(`no mode! ${line}`);
          }

          /*
            mangia	mangiare	VER:impr+pres+2+s
            mangiameli	mangiare	VER:impr+pres+2+s+meli
            cela/cele/celi/celo/cene/ci/gli/gliela/gliele/glieli/glielo/gliene/la/
            le/li/lo/mela/mele/meli/melo/mene/mi/ne/sela/sele/seli/selo/sene/si/
            tela/tele/teli/telo/tene/ti/vela/vele/veli/velo/vene/vi
            Clitics attached to the verb.
            */

          const clitics: string[] = [];
          for (let i = 0; i < possibleClitics.length; i++) {
            if (inflectional.indexOf(possibleClitics[i]) > -1) {
              clitics.push(possibleClitics[i]);
            }
          }

          // pre/past/impf/fut: Present, past, imperfective, future.
          let tense: any;
          for (let i = 0; i < tenses.length; i++) {
            if (inflectional.indexOf(tenses[i]) > -1) {
              tense = tenses[i];
              break;
            }
          }
          if (!tense) {
            console.log(`no tense! ${line}`);
          }

          const newProps = [];
          // s/p: Number.
          // can be null
          let number: any;
          if (inflectional.indexOf('s') > -1) {
            number = 'S';
          } else if (inflectional.indexOf('p') > -1) {
            number = 'P';
          }
          if (number) {
            newProps.push(number);
          }

          // 1/2/3: Person.
          // can be null
          let person: any;
          if (inflectional.indexOf('1') > -1) {
            person = 1;
          } else if (inflectional.indexOf('2') > -1) {
            person = 2;
          } else if (inflectional.indexOf('3') > -1) {
            person = 3;
          }
          if (person) {
            newProps.push(person);
          }

          // f/m: Gender (only relevant for participles).
          // can be null
          let gender: any;
          if (inflectional.indexOf('f') > -1) {
            gender = 'F';
          } else if (inflectional.indexOf('M') > -1) {
            gender = 'M';
          }
          if (gender) {
            newProps.push(gender);
          }

          if (!outputData[lemma]) {
            outputData[lemma] = {
              cond: null,
              ger: null,
              impr: null,
              ind: null,
              inf: null,
              part: null,
              sub: null,
            };
          }
          if (!outputData[lemma][mode]) {
            outputData[lemma][mode] = {
              pres: null,
              past: null,
              impf: null,
              fut: null,
            };
          }

          if (!outputData[lemma][mode][tense]) {
            outputData[lemma][mode][tense] = {};
          }

          const newPropsKey = newProps.join('');

          if (newPropsKey != '') {
            // sometimes we already have the value
            // we override only if this one has no clitic
            if (!outputData[lemma][mode][tense][newPropsKey] || clitics.length === 0) {
              outputData[lemma][mode][tense][newPropsKey] = flexForm;
            }
          } else {
            // inf pres and ger pres
            outputData[lemma][mode][tense] = flexForm;
          }
        }
      })
      .on('close', function (): void {
        // console.log(JSON.stringify(outputData));

        // check holes, useful mainly to create edge test cases

        Object.keys(outputData).forEach(function (verb: string): void {
          /*
          if (outputData[verb]['part'] && outputData[verb]['part']['past']) {
            let pp: any = outputData[verb]['part']['past'];
            let expected = ['S', 'P', 'SF', 'PF'];
            for (let i = 0; i < expected.length; i++) {
              if (!pp[expected[i]]) {
                console.log(`no ${expected[i]} for pp ${verb}`);
              }
            }
          }
          */
          /*
          for (let i = 0; i < modes.length; i++) {
            if (!outputData[verb][modes[i]]) {
              console.log(`no ${modes[i]} mode for ${verb}`);
            }
          }
          */
        });

        outputStream.write(
          // remove null keys
          JSON.stringify(outputData, function (key: string, value: any): any {
            if (value) return value;
          }),
        );
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
