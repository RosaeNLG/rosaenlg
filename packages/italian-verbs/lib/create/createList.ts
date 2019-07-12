import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

import { Mode, Tense, Gender, Numbers, Person, VerbsInfo } from '../index';

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

function processItalianVerbs(inputFile: string, outputFile: string): void {
  console.log(`starting to process Italian dictionary file: ${inputFile} for verbs`);

  let outputData: VerbsInfo = {};

  try {
    var lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile, { encoding: 'latin1' }),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    var outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function(line: string): void {
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

        if (type == 'VER' && lemma != 'essere' && lemma != 'avere') {
          //console.log(`${flexForm} ${lemma} ${props}`);

          // cond/ger/impr/ind/inf/part/sub: Conditional, gerundive, imperative, indicative, infinitive, participle, subjunctive.
          let mode: Mode;
          for (let i = 0; i < modes.length; i++) {
            if (inflectional.indexOf(modes[i]) > -1) {
              mode = modes[i] as Mode;
              break;
            }
          }
          if (mode == null) {
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

          let clitics: string[] = [];
          for (let i = 0; i < possibleClitics.length; i++) {
            if (inflectional.indexOf(possibleClitics[i]) > -1) {
              clitics.push(possibleClitics[i]);
            }
          }

          // pre/past/impf/fut: Present, past, imperfective, future.
          let tense: Tense;
          for (let i = 0; i < tenses.length; i++) {
            if (inflectional.indexOf(tenses[i]) > -1) {
              tense = tenses[i] as Tense;
              break;
            }
          }
          if (tense == null) {
            console.log(`no tense! ${line}`);
          }

          let newProps = [];
          // s/p: Number.
          // can be null
          let number: Numbers;
          if (inflectional.indexOf('s') > -1) {
            number = 'S';
          } else if (inflectional.indexOf('p') > -1) {
            number = 'P';
          }
          if (number != null) {
            newProps.push(number);
          }

          // 1/2/3: Person.
          // can be null
          let person: Person;
          if (inflectional.indexOf('1') > -1) {
            person = 1;
          } else if (inflectional.indexOf('2') > -1) {
            person = 2;
          } else if (inflectional.indexOf('3') > -1) {
            person = 3;
          }
          if (person != null) {
            newProps.push(person);
          }

          // f/m: Gender (only relevant for participles).
          // can be null
          let gender: Gender;
          if (inflectional.indexOf('f') > -1) {
            gender = 'F';
          } else if (inflectional.indexOf('M') > -1) {
            gender = 'M';
          }
          if (gender != null) {
            newProps.push(gender);
          }

          if (outputData[lemma] == null) {
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
          if (outputData[lemma][mode] == null) {
            outputData[lemma][mode] = {
              pres: null,
              past: null,
              impf: null,
              fut: null,
            };
          }

          if (outputData[lemma][mode][tense] == null) {
            outputData[lemma][mode][tense] = {};
          }

          // sometimes we already have the value
          // we override only if this one has no clitic
          let newPropsKey = newProps.join('');
          if (!outputData[lemma][mode][tense][newPropsKey] || clitics.length == 0) {
            outputData[lemma][mode][tense][newPropsKey] = flexForm;
          }
        }
      })
      .on('close', function(): void {
        // debug(JSON.stringify(outputData));

        // check holes, useful mainly to create edge test cases

        Object.keys(outputData).forEach(function(verb: string): void {
          /*
          if (outputData[verb]['part'] != null && outputData[verb]['part']['past'] != null) {
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
            if (outputData[verb][modes[i]] == null) {
              console.log(`no ${modes[i]} mode for ${verb}`);
            }
          }
          */
        });

        outputStream.write(
          // remove null keys
          JSON.stringify(outputData, function(key: string, value: any): any {
            if (value !== null) return value;
          }),
        );
        console.log('done, produced: ' + outputFile);
      });
  } catch (err) {
    console.log(err);
  }
}

processItalianVerbs('resources_src/morph-it/morph-it_048.txt', 'resources_pub/verbs.json');
