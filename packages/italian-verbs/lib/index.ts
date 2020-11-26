/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const auxAvere: VerbInfo = {
  cond: { pres: { S3: 'avrebbe', P3: 'avrebbero', S1: 'avrei', P1: 'avremmo', P2: 'avreste', S2: 'avresti' } },
  ger: { pres: { '': 'avendo' } },
  impr: { pres: { S2: 'abbi', P1: 'abbiamo', P2: 'abbiate' } },
  ind: {
    pres: { P1: 'abbiamo', P2: 'avete', S3: 'ha', S2: 'hai', P3: 'hanno', S1: 'ho' },
    past: { P1: 'avemmo', P2: 'aveste', S2: 'avesti', S3: 'ebbe', P3: 'ebbero', S1: 'ebbi' },
    impf: { S3: 'aveva', P1: 'avevamo', P3: 'avevano', P2: 'avevate', S2: 'avevi', S1: 'avevo' },
    fut: { S2: 'avrai', P3: 'avranno', P1: 'avremo', P2: 'avrete', S3: 'avrà', S1: 'avrò' },
  },
  inf: { pres: { '': 'avere' } },
  part: {
    pres: { SF: 'avente', S: 'avente', PF: 'aventi', P: 'aventi' },
    past: { SF: 'avuta', PF: 'avute', P: 'avuti', S: 'avuto' },
  },
  sub: {
    pres: { S1: 'abbia', S2: 'abbia', S3: 'abbia', P1: 'abbiamo', P3: 'abbiano', P2: 'abbiate' },
    impf: { S3: 'avesse', P3: 'avessero', S1: 'avessi', S2: 'avessi', P1: 'avessimo', P2: 'aveste' },
  },
};

const auxEssere: VerbInfo = {
  cond: { pres: { S3: 'sarebbe', P3: 'sarebbero', S1: 'sarei', P1: 'saremmo', P2: 'sareste', S2: 'saresti' } },
  ger: { pres: { '': 'essendo' } },
  impr: { pres: { P1: 'siamo', P2: 'siate', S2: 'sii' } },
  ind: {
    /*
    è essere VER,ind+pres+3+s
    é essere VER,ind+pres+3+s
    but è is the good one
    */
    pres: { S2: 'sei', P1: 'siamo', P2: 'siete', P3: 'sono', S1: 'sono', S3: 'è' },
    past: { P2: 'foste', S2: 'fosti', S3: 'fu', S1: 'fui', P1: 'fummo', P3: 'furono' },
    impf: { S3: 'era', P3: 'erano', P1: 'eravamo', P2: 'eravate', S2: 'eri', S1: 'ero' },
    fut: { S2: 'sarai', P3: 'saranno', P1: 'saremo', P2: 'sarete', S3: 'sarà', S1: 'sarò' },
  },
  inf: { pres: { '': 'essere' } },
  part: {
    pres: { SF: 'essente', S: 'essente', PF: 'essenti', P: 'essenti' },
    past: { SF: 'stata', PF: 'state', P: 'stati', S: 'stato' },
  },
  sub: {
    pres: { S1: 'sia', S2: 'sia', S3: 'sia', P1: 'siamo', P3: 'siano', P2: 'siate' },
    impf: { S3: 'fosse', P3: 'fossero', S1: 'fossi', S2: 'fossi', P1: 'fossimo', P2: 'foste' },
  },
};

export type Tense = 'pres' | 'past' | 'impf' | 'fut';
export type Gender = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Person = 1 | 2 | 3;
export type GendersMF = 'M' | 'F';

export interface VerbsInfo {
  [key: string]: VerbInfo;
}
// mode -> tense -> properties
// cannot use Record<Mode, VerbInfoMode> as impr is optional e.g. abboffare
export interface VerbInfo {
  ger?: VerbInfoMode;
  inf?: VerbInfoMode;
  impr?: VerbInfoMode;
  cond?: VerbInfoMode;
  ind?: VerbInfoMode;
  part?: VerbInfoMode;
  sub?: VerbInfoMode;
}

export interface VerbInfoMode {
  pres?: VerbInfoTense | string; // inf pres and ger pres: single string
  past?: VerbInfoTense;
  impf?: VerbInfoTense;
  fut?: VerbInfoTense;
}

export interface VerbInfoTense {
  [key: string]: string;
}

export function getVerbInfo(verbsList: VerbsInfo, verb: string): VerbInfo {
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
    if (verb === 'avere') return auxAvere;
    if (verb === 'essere') return auxEssere;

    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in Italian dict`;
    throw err;
  }
}

const validTenses: string[] = [
  'PRESENTE',
  'IMPERFETTO',
  'PASSATO_REMOTO',
  'FUTURO_SEMPLICE',
  'PASSATO_PROSSIMO',
  'TRAPASSATO_PROSSIMO',
  'TRAPASSATO_REMOTO',
  'FUTURO_ANTERIORE',
  'CONG_PRESENTE',
  'CONG_PASSATO',
  'CONG_IMPERFETTO',
  'CONG_TRAPASSATO',
  'COND_PRESENTE',
  'COND_PASSATO',
  'IMPERATIVO',
];

export type ItalianAux = 'ESSERE' | 'AVERE';

export function getConjugation(
  verbsList: VerbsInfo,
  verb: string,
  tense: string,
  person: Person,
  number: Numbers,
  aux: ItalianAux,
  agreeGender: GendersMF,
  agreeNumber: Numbers,
): string {
  // check params

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must S or P, here ${number}`;
    throw err;
  }

  if (person != 1 && person != 2 && person != 3) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'person must 1 2 or 3';
    throw err;
  }

  if (!tense || validTenses.indexOf(tense) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `tense ${tense} err, must be ${validTenses.join()}`;
    throw err;
  }

  const tensesWithAux: string[] = [
    'PASSATO_PROSSIMO',
    'TRAPASSATO_PROSSIMO',
    'TRAPASSATO_REMOTO',
    'FUTURO_ANTERIORE',
    'CONG_PASSATO',
    'CONG_TRAPASSATO',
    'COND_PASSATO',
  ];
  if (tensesWithAux.indexOf(tense) > -1) {
    /*
    if (!aux && this.alwaysUsesSein(verb)) {
      aux = 'SEIN';
    }
    */

    if (aux != 'ESSERE' && aux != 'AVERE') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `this tense ${tense} requires aux param with ESSERE or AVERE`;
      throw err;
    }
  }

  if (tense === 'IMPERATIVO') {
    if (['S2', 'P1', 'P2'].indexOf(number + person) === -1) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `IMPERATIVO only works with S2 P1 or P2`;
      throw err;
    }
  }

  if (!agreeGender) {
    agreeGender = 'M';
  }
  if (agreeGender != 'M' && agreeGender != 'F') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `agreeGender must be M or F`;
    throw err;
  }

  if (!agreeNumber) {
    agreeNumber = 'S';
  }
  if (agreeNumber != 'S' && agreeNumber != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `agreeNumber must be S or P`;
    throw err;
  }

  const verbInfo: VerbInfo = getVerbInfo(verbsList, verb);

  const getPastParticiple = (): string => {
    // {"SF":"mangiata","PF":"mangiate","P":"mangiati","S":"mangiato"}
    const key = agreeNumber + (agreeGender === 'F' ? 'F' : '');
    const pp = verbInfo['part']['past'][key];
    if (!pp) {
      const err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `could not find ${key} past participle for ${verb}`;
      throw err;
    }
    return pp;
  };

  const getConjugatedAux = (): string => {
    const auxTenses = {
      PASSATO_PROSSIMO: 'PRESENTE',
      TRAPASSATO_PROSSIMO: 'IMPERFETTO',
      TRAPASSATO_REMOTO: 'PASSATO_REMOTO',
      FUTURO_ANTERIORE: 'FUTURO_SEMPLICE',
      CONG_PASSATO: 'CONG_PRESENTE',
      CONG_TRAPASSATO: 'CONG_IMPERFETTO',
      COND_PASSATO: 'COND_PRESENTE',
    };
    return this.getConjugation(verbsList, aux.toLowerCase(), auxTenses[tense], person, number, null, null, null, null);
  };

  if (tensesWithAux.indexOf(tense) > -1) {
    return `${getConjugatedAux()} ${getPastParticiple()}`;
  } else {
    const keys = {
      PRESENTE: ['ind', 'pres'],
      IMPERFETTO: ['ind', 'impf'],
      PASSATO_REMOTO: ['ind', 'past'],
      FUTURO_SEMPLICE: ['ind', 'fut'],
      CONG_PRESENTE: ['sub', 'pres'],
      CONG_IMPERFETTO: ['sub', 'impf'],
      COND_PRESENTE: ['cond', 'pres'],
      IMPERATIVO: ['impr', 'pres'],
    };

    const modeKey: string = keys[tense][0];
    const tenseKey: string = keys[tense][1];
    const numberPersonKey = number + person;

    if (!verbInfo[modeKey] || !verbInfo[modeKey][tenseKey] || !verbInfo[modeKey][tenseKey][numberPersonKey]) {
      const err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${verb} in Italian dict but not for ${tense} and ${number} and ${person}`;
      throw err;
    }

    return verbInfo[modeKey][tenseKey][numberPersonKey];
  }
}
