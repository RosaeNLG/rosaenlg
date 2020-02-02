export type EnglishTense = 'PRESENT' | 'PAST' | 'FUTURE';
export type Numbers = 'S' | 'P';

import compromise from 'compromise';

export function getConjugation(verb: string, tense: EnglishTense, number: Numbers): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (tense === 'PRESENT' && number === 'P') {
    return verb;
  }

  const tenseMapping = {
    PRESENT: 'PresentTense',
    PAST: 'PastTense',
    FUTURE: 'FutureTense',
  };

  const conjugated: any[] = compromise('he ' + verb)
    .verbs()
    .conjugate();

  if (conjugated && conjugated.length > 0) {
    return conjugated[0][tenseMapping[tense]];
  }

  const err = new Error();
  err.name = 'InvalidArgumentError';
  err.message = `could not conjugate ${verb} properly using compromise lib`;
  throw err;
}
