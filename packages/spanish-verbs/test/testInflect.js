/*
 * testInflect.js - nodeunit test for the Spanish verb inflection generator function.
 *
 * Copyright © 2017, HealthTap, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const assert = require('assert');
const inflect = require('../dist/inflect.js').inflect;

const tests = {
  amar: {
    indicative: {
      present: {
        singular: {
          first: 'amo',
          second: 'amas',
          third: 'ama',
        },
        plural: {
          first: 'amamos',
          second: 'amáis',
          third: 'aman',
        },
      },
      preterite: {
        singular: {
          first: 'amé',
          second: 'amaste',
          third: 'amó',
        },
        plural: {
          first: 'amamos',
          second: 'amasteis',
          third: 'amaron',
        },
      },
      imperfect: {
        singular: {
          first: 'amaba',
          second: 'amabas',
          third: 'amaba',
        },
        plural: {
          first: 'amábamos',
          second: 'amabais',
          third: 'amaban',
        },
      },
      future: {
        singular: {
          first: 'amaré',
          second: 'amarás',
          third: 'amará',
        },
        plural: {
          first: 'amaremos',
          second: 'amaréis',
          third: 'amarán',
        },
      },
      perfect: {
        singular: {
          first: 'he amado',
          second: 'has amado',
          third: 'ha amado',
        },
        plural: {
          first: 'hemos amado',
          second: 'habéis amado',
          third: 'han amado',
        },
      },
      pluperfect: {
        singular: {
          first: 'había amado',
          second: 'habías amado',
          third: 'había amado',
        },
        plural: {
          first: 'habíamos amado',
          second: 'habíais amado',
          third: 'habían amado',
        },
      },
      'future perfect': {
        singular: {
          first: 'habré amado',
          second: 'habrás amado',
          third: 'habrá amado',
        },
        plural: {
          first: 'habremos amado',
          second: 'habréis amado',
          third: 'habrán amado',
        },
      },
      'preterite perfect': {
        singular: {
          first: 'hube amado',
          second: 'hubiste amado',
          third: 'hubo amado',
        },
        plural: {
          first: 'hubimos amado',
          second: 'hubisteis amado',
          third: 'hubieron amado',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'ame',
          second: 'ames',
          third: 'ame',
        },
        plural: {
          first: 'amemos',
          second: 'améis',
          third: 'amen',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'amara',
          second: 'amaras',
          third: 'amara',
        },
        plural: {
          first: 'amáramos',
          second: 'amarais',
          third: 'amaran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'amase',
          second: 'amases',
          third: 'amase',
        },
        plural: {
          first: 'amásemos',
          second: 'amaseis',
          third: 'amasen',
        },
      },
      future: {
        singular: {
          first: 'amare',
          second: 'amares',
          third: 'amare',
        },
        plural: {
          first: 'amáremos',
          second: 'amareis',
          third: 'amaren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'ama',
          third: 'ame',
        },
        plural: {
          first: 'amemos',
          second: 'amad',
          third: 'amen',
        },
      },
      negative: {
        singular: {
          second: 'ames',
          third: 'ame',
        },
        plural: {
          first: 'amemos',
          second: 'améis',
          third: 'amen',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'amaría',
          second: 'amarías',
          third: 'amaría',
        },
        plural: {
          first: 'amaríamos',
          second: 'amaríais',
          third: 'amarían',
        },
      },
      future: {
        singular: {
          first: 'amaría',
          second: 'amarías',
          third: 'amaría',
        },
        plural: {
          first: 'amaríamos',
          second: 'amaríais',
          third: 'amarían',
        },
      },
      perfect: {
        singular: {
          first: 'habría amado',
          second: 'habrías amado',
          third: 'habría amado',
        },
        plural: {
          first: 'habríamos amado',
          second: 'habríais amado',
          third: 'habrían amado',
        },
      },
    },
  },

  partir: {
    indicative: {
      present: {
        singular: {
          first: 'parto',
          second: 'partes',
          third: 'parte',
        },
        plural: {
          first: 'partimos',
          second: 'partís',
          third: 'parten',
        },
      },
      preterite: {
        singular: {
          first: 'partí',
          second: 'partiste',
          third: 'partió',
        },
        plural: {
          first: 'partimos',
          second: 'partisteis',
          third: 'partieron',
        },
      },
      imperfect: {
        singular: {
          first: 'partía',
          second: 'partías',
          third: 'partía',
        },
        plural: {
          first: 'partíamos',
          second: 'partíais',
          third: 'partían',
        },
      },
      future: {
        singular: {
          first: 'partiré',
          second: 'partirás',
          third: 'partirá',
        },
        plural: {
          first: 'partiremos',
          second: 'partiréis',
          third: 'partirán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'parta',
          second: 'partas',
          third: 'parta',
        },
        plural: {
          first: 'partamos',
          second: 'partáis',
          third: 'partan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'partiera',
          second: 'partieras',
          third: 'partiera',
        },
        plural: {
          first: 'partiéramos',
          second: 'partierais',
          third: 'partieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'partiese',
          second: 'partieses',
          third: 'partiese',
        },
        plural: {
          first: 'partiésemos',
          second: 'partieseis',
          third: 'partiesen',
        },
      },
      future: {
        singular: {
          first: 'partiere',
          second: 'partieres',
          third: 'partiere',
        },
        plural: {
          first: 'partiéremos',
          second: 'partiereis',
          third: 'partieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'parte',
          third: 'parta',
        },
        plural: {
          first: 'partamos',
          second: 'partid',
          third: 'partan',
        },
      },
      negative: {
        singular: {
          second: 'partas',
          third: 'parta',
        },
        plural: {
          first: 'partamos',
          second: 'partáis',
          third: 'partan',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'partiría',
          second: 'partirías',
          third: 'partiría',
        },
        plural: {
          first: 'partiríamos',
          second: 'partiríais',
          third: 'partirían',
        },
      },
      future: {
        singular: {
          first: 'partiría',
          second: 'partirías',
          third: 'partiría',
        },
        plural: {
          first: 'partiríamos',
          second: 'partiríais',
          third: 'partirían',
        },
      },
    },
  },

  comer: {
    indicative: {
      present: {
        singular: {
          first: 'como',
          second: 'comes',
          third: 'come',
        },
        plural: {
          first: 'comemos',
          second: 'coméis',
          third: 'comen',
        },
      },
      preterite: {
        singular: {
          first: 'comí',
          second: 'comiste',
          third: 'comió',
        },
        plural: {
          first: 'comimos',
          second: 'comisteis',
          third: 'comieron',
        },
      },
      imperfect: {
        singular: {
          first: 'comía',
          second: 'comías',
          third: 'comía',
        },
        plural: {
          first: 'comíamos',
          second: 'comíais',
          third: 'comían',
        },
      },
      future: {
        singular: {
          first: 'comeré',
          second: 'comerás',
          third: 'comerá',
        },
        plural: {
          first: 'comeremos',
          second: 'comeréis',
          third: 'comerán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'coma',
          second: 'comas',
          third: 'coma',
        },
        plural: {
          first: 'comamos',
          second: 'comáis',
          third: 'coman',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'comiera',
          second: 'comieras',
          third: 'comiera',
        },
        plural: {
          first: 'comiéramos',
          second: 'comierais',
          third: 'comieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'comiese',
          second: 'comieses',
          third: 'comiese',
        },
        plural: {
          first: 'comiésemos',
          second: 'comieseis',
          third: 'comiesen',
        },
      },
      future: {
        singular: {
          first: 'comiere',
          second: 'comieres',
          third: 'comiere',
        },
        plural: {
          first: 'comiéremos',
          second: 'comiereis',
          third: 'comieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'come',
          third: 'coma',
        },
        plural: {
          first: 'comamos',
          second: 'comed',
          third: 'coman',
        },
      },
      negative: {
        singular: {
          second: 'comas',
          third: 'coma',
        },
        plural: {
          first: 'comamos',
          second: 'comáis',
          third: 'coman',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'comería',
          second: 'comerías',
          third: 'comería',
        },
        plural: {
          first: 'comeríamos',
          second: 'comeríais',
          third: 'comerían',
        },
      },
      future: {
        singular: {
          first: 'comería',
          second: 'comerías',
          third: 'comería',
        },
        plural: {
          first: 'comeríamos',
          second: 'comeríais',
          third: 'comerían',
        },
      },
    },
  },
};

const newOnes = {
  aprobar: {
    indicative: {
      present: {
        singular: {
          third: 'aprueba',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'aprueba',
          third: 'apruebe',
        },
      },
    },
  },
  buscar: {
    indicative: {
      preterite: {
        singular: {
          first: 'busqué',
        },
      },
    },
  },
  jugar: {
    indicative: {
      preterite: {
        singular: {
          first: 'jugué',
        },
      },
    },
  },
  actualizar: {
    indicative: {
      preterite: {
        singular: {
          first: 'actualicé',
        },
      },
    },
  },
  conocer: {
    indicative: {
      present: {
        singular: {
          first: 'conozco',
        },
      },
    },
  },
  producir: {
    indicative: {
      present: {
        singular: {
          first: 'produzco',
        },
      },
      preterite: {
        singular: {
          first: 'produje',
          third: 'produjo',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          second: 'produzcas',
        },
        plural: {
          second: 'produzcáis',
        },
      },
    },
  },

  conducir: {
    indicative: {
      preterite: {
        singular: {
          third: 'condujo',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'conduzca',
          third: 'conduzca',
        },
      },
      future: {
        singular: {
          third: 'condujere',
        },
      },
      imperfect: {
        singular: {
          third: 'condujese',
        },
      },
    },
  },
};

const irregularPastParticiples = {
  abrir: {
    indicative: {
      perfect: {
        singular: {
          first: 'he abierto',
        },
      },
      pluperfect: {
        singular: {
          first: 'había abierto',
        },
      },
      'future perfect': {
        singular: {
          first: 'habré abierto',
        },
      },
      'preterite perfect': {
        singular: {
          first: 'hube abierto',
        },
        plural: {
          first: 'hubimos abierto',
        },
      },
    },
    conditional: {
      perfect: {
        singular: {
          first: 'habría abierto',
        },
        plural: {
          first: 'habríamos abierto',
        },
      },
    },
  },

  decir: {
    indicative: {
      perfect: {
        singular: {
          first: 'he dicho',
        },
      },
    },
  },

  escribir: {
    indicative: {
      perfect: {
        singular: {
          first: 'he escrito',
        },
      },
    },
  },

  hacer: {
    indicative: {
      perfect: {
        singular: {
          first: 'he hecho',
        },
      },
    },
  },

  poseer: {
    indicative: {
      imperfect: {
        singular: {
          third: 'poseía',
        },
      },
      preterite: {
        plural: {
          third: 'poseyeron',
        },
      },
    },
  },
  venir: {
    conditional: {
      present: {
        singular: {
          third: 'vendría',
        },
      },
    },
    subjunctive: {
      'imperfect -ra': {
        plural: {
          third: 'vinieran',
        },
      },
    },
  },
};

const irregularVerbs = {
  estar: {
    indicative: {
      present: {
        singular: {
          first: 'estoy',
          second: 'estás',
          third: 'está',
        },
        plural: {
          first: 'estamos',
          second: 'estáis',
          third: 'están',
        },
      },
      preterite: {
        singular: {
          first: 'estuve',
          second: 'estuviste',
          third: 'estuvo',
        },
        plural: {
          first: 'estuvimos',
          second: 'estuvisteis',
          third: 'estuvieron',
        },
      },
      imperfect: {
        singular: {
          first: 'estaba',
          second: 'estabas',
          third: 'estaba',
        },
        plural: {
          first: 'estábamos',
          second: 'estabais',
          third: 'estaban',
        },
      },
      future: {
        singular: {
          first: 'estaré',
          second: 'estarás',
          third: 'estará',
        },
        plural: {
          first: 'estaremos',
          second: 'estaréis',
          third: 'estarán',
        },
      },
      perfect: {
        singular: {
          first: 'he estado',
          second: 'has estado',
          third: 'ha estado',
        },
        plural: {
          first: 'hemos estado',
          second: 'habéis estado',
          third: 'han estado',
        },
      },
      pluperfect: {
        singular: {
          first: 'había estado',
          second: 'habías estado',
          third: 'había estado',
        },
        plural: {
          first: 'habíamos estado',
          second: 'habíais estado',
          third: 'habían estado',
        },
      },
      'future perfect': {
        singular: {
          first: 'habré estado',
          second: 'habrás estado',
          third: 'habrá estado',
        },
        plural: {
          first: 'habremos estado',
          second: 'habréis estado',
          third: 'habrán estado',
        },
      },
      'preterite perfect': {
        singular: {
          first: 'hube estado',
          second: 'hubiste estado',
          third: 'hubo estado',
        },
        plural: {
          first: 'hubimos estado',
          second: 'hubisteis estado',
          third: 'hubieron estado',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'esté',
          second: 'estés',
          third: 'esté',
        },
        plural: {
          first: 'estemos',
          second: 'estéis',
          third: 'estén',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'estuviera',
          second: 'estuvieras',
          third: 'estuviera',
        },
        plural: {
          first: 'estuviéramos',
          second: 'estuvierais',
          third: 'estuvieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'estuviese',
          second: 'estuvieses',
          third: 'estuviese',
        },
        plural: {
          first: 'estuviésemos',
          second: 'estuvieseis',
          third: 'estuviesen',
        },
      },
      future: {
        singular: {
          first: 'estuviere',
          second: 'estuvieres',
          third: 'estuviere',
        },
        plural: {
          first: 'estuviéremos',
          second: 'estuviereis',
          third: 'estuvieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'está',
          third: 'esté',
        },
        plural: {
          first: 'estemos',
          second: 'estad',
          third: 'estén',
        },
      },
      negative: {
        singular: {
          second: 'estés',
          third: 'esté',
        },
        plural: {
          first: 'estemos',
          second: 'estéis',
          third: 'estén',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'estaría',
          second: 'estarías',
          third: 'estaría',
        },
        plural: {
          first: 'estaríamos',
          second: 'estaríais',
          third: 'estarían',
        },
      },
      future: {
        singular: {
          first: 'estaría',
          second: 'estarías',
          third: 'estaría',
        },
        plural: {
          first: 'estaríamos',
          second: 'estaríais',
          third: 'estarían',
        },
      },
      perfect: {
        singular: {
          first: 'habría estado',
          second: 'habrías estado',
          third: 'habría estado',
        },
        plural: {
          first: 'habríamos estado',
          second: 'habríais estado',
          third: 'habrían estado',
        },
      },
    },
  },
};

function doTest(list) {
  Object.keys(list).forEach(function (verb) {
    const expected = list[verb];

    Object.keys(expected).forEach(function (mood) {
      Object.keys(expected[mood]).forEach(function (tense) {
        Object.keys(expected[mood][tense]).forEach(function (number) {
          Object.keys(expected[mood][tense][number]).forEach(function (person) {
            const options = {
              person: person,
              number: number,
              mood: mood,
            };

            if (mood === 'imperative') {
              options.positivity = tense;
            } else {
              options.tense = tense;
            }
            it(`${verb}, ${JSON.stringify(options)} => ${expected[mood][tense][number][person]}`, function () {
              assert.strictEqual(
                inflect(verb, options),
                expected[mood][tense][number][person],
                JSON.stringify(options),
              );
            });
          });
        });
      });
    });
  });
}

describe('spanish-verbs', function () {
  describe('#inflect()', function () {
    describe('testInflectRegular', function () {
      doTest(tests);
    });
    describe('testInflectIrregularPastParticples', function () {
      doTest(irregularPastParticiples);
    });
  });
  describe('testInflectIrregularVerbs', function () {
    doTest(irregularVerbs);
  });
  describe('new ones', function () {
    doTest(newOnes);
  });
  describe('edge', function () {
    it('too short verb', function () {
      assert.throws(() => inflect('a', null), /verb/);
    });
    it('invalid ending', function () {
      assert.strictEqual(inflect('ayy', null), 'ayy');
    });
    it('strange verb', function () {
      assert.strictEqual(
        inflect('aaaair', { person: 'first', number: 'singular', mood: 'indicative', tense: 'present' }),
        'aaaao',
      );
    });
    it('invalid person', function () {
      assert.throws(() => inflect('hablar', { person: 'fourth' }), /person/);
    });
    it('invalid number', function () {
      assert.throws(() => inflect('hablar', { person: 'first', number: 'other' }), /number/);
    });
    it('invalid mood', function () {
      assert.throws(() => inflect('hablar', { person: 'first', number: 'singular', mood: 'something' }), /mood/);
    });
    it('invalid tense', function () {
      assert.throws(
        () => inflect('hablar', { person: 'first', number: 'singular', mood: 'indicative', tense: 'something' }),
        /tense/,
      );
    });
  });
});
