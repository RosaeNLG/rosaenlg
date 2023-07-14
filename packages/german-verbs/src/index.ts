/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerbsInfo, VerbInfo } from 'german-verbs-dict';
export { VerbsInfo, VerbInfo } from 'german-verbs-dict';

const auxHaben: VerbInfo = {
  PA2: ['gehabt'],
  KJ1: { S: { '1': 'habe', '2': 'habest', '3': 'habe' }, P: { '1': 'haben', '2': 'habet', '3': 'haben' } },
  PRÄ: { S: { '1': 'habe', '2': 'hast', '3': 'hat' }, P: { '1': 'haben', '2': 'habt', '3': 'haben' } },
  IMP: { S: 'habe', P: 'habt' },
  INF: 'haben',
  PA1: 'habend',
  PRT: { S: { '1': 'hatte', '2': 'hattest', '3': 'hatte' }, P: { '1': 'hatten', '2': 'hattet', '3': 'hatten' } },
  KJ2: { S: { '1': 'hätte', '2': 'hättest', '3': 'hätte' }, P: { '1': 'hätten', '2': 'hättet', '3': 'hätten' } },
};
const auxSein: VerbInfo = {
  PRÄ: { S: { '1': 'bin', '2': 'bist', '3': 'ist' }, P: { '1': 'sind', '2': 'seid', '3': 'sind' } },
  PA2: ['gewesen'],
  KJ1: { S: { '1': 'sei', '2': 'seist', '3': 'sei' }, P: { '1': 'seien', '2': 'seiet', '3': 'seien' } },
  IMP: { S: 'sei', P: 'seid' },
  PA1: 'seiend',
  INF: 'sein',
  PRT: { S: { '1': 'war', '2': 'warst', '3': 'war' }, P: { '1': 'waren', '2': 'wart', '3': 'waren' } },
  KJ2: { S: { '1': 'wäre', '2': 'wärst', '3': 'wäre' }, P: { '1': 'wären', '2': 'wärt', '3': 'wären' } },
};
const auxWerden: VerbInfo = {
  PA2: ['geworden', 'worden'],
  KJ1: { S: { '1': 'werde', '2': 'werdest', '3': 'werde' }, P: { '1': 'werden', '2': 'werdet', '3': 'werden' } },
  PRÄ: { S: { '1': 'werde', '2': 'wirst', '3': 'wird' }, P: { '1': 'werden', '2': 'werdet', '3': 'werden' } },
  IMP: { S: 'werde', P: 'werdet' },
  INF: 'werden',
  PA1: 'werdend',
  PRT: { S: { '1': 'wurde', '2': 'wurdest', '3': 'wurde' }, P: { '1': 'wurden', '2': 'wurdet', '3': 'wurden' } },
  KJ2: { S: { '1': 'würde', '2': 'würdest', '3': 'würde' }, P: { '1': 'würden', '2': 'würdet', '3': 'würden' } },
};

export function getVerbInfo(verbsList: VerbsInfo, verb: string): VerbInfo {
  if (verb === 'haben') return auxHaben;
  if (verb === 'sein') return auxSein;
  if (verb === 'werden') return auxWerden;

  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }
  if (!verbsList) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb list must not be null';
    throw err;
  }

  if (verbsList[verb]) {
    return verbsList[verb];
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict`;
    throw err;
  }
}

export type Numbers = 'S' | 'P';
export type Persons = 1 | 2 | 3;

// exported only to ease testing
export function getReflexiveFormPronoun(
  pronominalCase: PronominalCase | undefined,
  person: Persons,
  number: Numbers,
): string {
  // we only care for pronominalCase for S1 or S2
  if (
    number === 'S' &&
    (person === 1 || person === 2) &&
    pronominalCase != 'ACCUSATIVE' &&
    pronominalCase != 'DATIVE'
  ) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `pronominalCase ACCUSATIVE or DATIVE required for S 1 or 2`;
    throw err;
  }

  const pronouns = {
    ACCUSATIVE: {
      S: {
        1: 'mich',
        2: 'dich',
        3: 'sich',
      },
      P: {
        1: 'uns',
        2: 'euch',
        3: 'sich',
      },
    },
    DATIVE: {
      S: {
        1: 'mir',
        2: 'dir',
        3: 'sich',
      },
      P: {
        1: 'uns',
        2: 'euch',
        3: 'sich',
      },
    },
  };

  return pronouns[pronominalCase || 'ACCUSATIVE'][number][person];
}

// exported only to ease testing
export function getReflexiveCase(verb: string): PronominalCase | null {
  const accList: string[] = [
    'abkühlen',
    'abheben',
    'amüsieren',
    'ärgern',
    'bewegen',
    'ergeben',
    'erholen',
    'freuen',
    'setzen',
    'sonnen',
    'treffen',
    'umwenden',
    'verabschieden',
    'verfahren',
  ];

  const datList: string[] = ['denken', 'kaufen', 'anziehen'];

  if (accList.includes(verb)) {
    return 'ACCUSATIVE';
  } else if (datList.includes(verb)) {
    return 'DATIVE';
  } else {
    return null;
  }
}

/* for PA2 it is better if it contains "ge", as we will use it for partizip, not for passive voice
  geworden	werden	VER:PA2:NON
  worden	werden	VER:PA2:NON

  sometimes no 'ge' form: verzeihen: verziehen verzeiht
*/
export function getPartizip2(verbsList: VerbsInfo, verb: string): string {
  const verbInfo: VerbInfo = getVerbInfo(verbsList, verb);

  const part2list: string[] | undefined = verbInfo['PA2'] as string[] | undefined;

  if (!part2list) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `no Partizip2 found for ${verb}`;
    throw err;
  }

  if (part2list.length === 1) {
    return part2list[0];
  } else {
    // we favor the 'ge' form hier, but it does not always exists
    for (const part2listElt of part2list) {
      if (part2listElt.includes('ge')) {
        return part2listElt;
      }
    }
    return part2list[0];
  }
}

const alwaysSein: string[] = [
  'aufwachen',
  'aufwachsen',
  'einziehen',
  'entstehen',
  'fahren',
  'fallen',
  'fliegen',
  'gehen',
  'geschehen',
  'hüpfen',
  'kommen',
  'laufen',
  'passieren',
  'reisen',
  'rennen',
  'springen',
  'steigen',
  'aussteigen',
  'einsteigen',
  'sinken',
  'sterben',
  'wachsen',
  'bleiben',
  'sein',
  'werden',
  'treten',
  'auswandern',
  'begegnen',
  'explodieren',
  'folgen',
  'landen',
  'reisen',
  'starten',
  'wandern',
  'zurückkehren',
  'verbrennen',
];

export function alwaysUsesSein(verb: string): boolean {
  return alwaysSein.indexOf(verb) > -1;
}

const validTenses: string[] = [
  'PRASENS',
  'PRATERITUM',
  'FUTUR1',
  'PERFEKT',
  'PLUSQUAMPERFEKT',
  'FUTUR2',
  'KONJUNKTIV1_PRASENS',
  'KONJUNKTIV1_FUTUR1',
  'KONJUNKTIV1_PERFEKT',
  'KONJUNKTIV2_PRATERITUM',
  'KONJUNKTIV2_FUTUR1',
  'KONJUNKTIV2_FUTUR2',
];

export type PronominalCase = 'ACCUSATIVE' | 'DATIVE';
export type GermanAux = 'SEIN' | 'HABEN';
export function getConjugation(
  verbsList: VerbsInfo,
  verb: string,
  tense: string,
  person: Persons,
  number: Numbers,
  aux: GermanAux | undefined,
  pronominal: boolean | undefined,
  pronominalCase: PronominalCase | undefined,
): string[] {
  // check params

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P, here ${number}`;
    throw err;
  }

  if (!tense || validTenses.indexOf(tense) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `tense ${tense} err, must be ${validTenses.join()}`;
    throw err;
  }

  const tensesWithAux: string[] = ['PERFEKT', 'PLUSQUAMPERFEKT', 'FUTUR2', 'KONJUNKTIV1_PERFEKT', 'KONJUNKTIV2_FUTUR2'];
  if (tensesWithAux.indexOf(tense) > -1) {
    if (!aux && alwaysUsesSein(verb)) {
      aux = 'SEIN';
    }

    if (aux != 'SEIN' && aux != 'HABEN') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `this tense ${tense} requires aux param with SEIN or HABEN`;
      throw err;
    }
  }

  if (verb && verb.startsWith('sich ')) {
    verb = verb.replace(/^sich\s+/, '');
    pronominal = true;
  }

  // do composed tenses
  switch (tense) {
    case 'FUTUR1':
      return [
        getConjugation(verbsList, 'werden', 'PRASENS', person, number, undefined, pronominal, pronominalCase).join(''),
        verb,
      ];
    case 'PERFEKT':
      return [
        getConjugation(
          verbsList,
          (aux as string).toLowerCase(),
          'PRASENS',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        getPartizip2(verbsList, verb),
      ];
    case 'PLUSQUAMPERFEKT':
      return [
        getConjugation(
          verbsList,
          (aux as string).toLowerCase(),
          'PRATERITUM',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        getPartizip2(verbsList, verb),
      ];
    case 'FUTUR2':
      return [
        getConjugation(verbsList, 'werden', 'PRASENS', person, number, undefined, pronominal, pronominalCase).join(''),
        `${getPartizip2(verbsList, verb)} ${(aux as string).toLowerCase()}`,
      ];
    case 'KONJUNKTIV1_FUTUR1':
      return [
        getConjugation(
          verbsList,
          'werden',
          'KONJUNKTIV1_PRASENS',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        verb,
      ];
    case 'KONJUNKTIV1_PERFEKT':
      return [
        getConjugation(
          verbsList,
          (aux as string).toLowerCase(),
          'KONJUNKTIV1_PRASENS',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        getPartizip2(verbsList, verb),
      ];
    case 'KONJUNKTIV2_FUTUR1':
      return [
        getConjugation(
          verbsList,
          'werden',
          'KONJUNKTIV2_PRATERITUM',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        verb,
      ];
    case 'KONJUNKTIV2_FUTUR2':
      return [
        getConjugation(
          verbsList,
          'werden',
          'KONJUNKTIV1_PRASENS',
          person,
          number,
          undefined,
          pronominal,
          pronominalCase,
        ).join(''),
        `${getPartizip2(verbsList, verb)} ${(aux as string).toLowerCase()}`,
      ];
  }

  // do all other tenses

  // get pronominal pronoun
  const pronominalPronoun: string | null = pronominal ? getReflexiveFormPronoun(pronominalCase, person, number) : null;

  if (person != 1 && person != 2 && person != 3) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'person must 1 2 or 3';
    throw err;
  }

  const verbInfo: VerbInfo = getVerbInfo(verbsList, verb);

  const tenseMapping = {
    PRASENS: 'PRÄ',
    PRATERITUM: 'PRT',
    KONJUNKTIV1_PRASENS: 'KJ1',
    KONJUNKTIV2_PRATERITUM: 'KJ2',
  };

  // sehen[PRÄ][SIN][1]

  const mappedTense: 'PRÄ' | 'PRT' | 'KJ1' | 'KJ2' = tenseMapping[
    tense as 'PRASENS' | 'PRATERITUM' | 'KONJUNKTIV1_PRASENS' | 'KONJUNKTIV2_PRATERITUM'
  ] as 'PRÄ' | 'PRT' | 'KJ1' | 'KJ2';

  const verbDataTense = verbInfo[mappedTense];
  if (!verbDataTense) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense}`;
    throw err;
  }

  const verbDataTenseNumber = verbDataTense[number];
  if (!verbDataTenseNumber) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense} and ${number}`;
    throw err;
  }

  const flexForm = verbDataTenseNumber[person];
  if (!flexForm) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense} and ${number} and ${person}`;
    throw err;
  }

  if (!pronominalPronoun) {
    return [flexForm];
  } else {
    return [`${flexForm} ${pronominalPronoun}`];
  }
}
