/*-----------------------------------------------------------------------------------
|                              |                          |     |           | Person
  Tense                        | Conjugation Required     | Key | Composed  | Dependent
  -----------------------------------------------------------------------------------
  PRESENT                      | indicatif présent        |  P  |   false   |  true 
  PASSE_COMPOSE                | indicatif présent *      |  P  |   true    |  true 
  IMPARFAIT                    | indicatif imparfait      |  I  |   false   |  true 
  PLUS_QUE_PARFAIT             | indicatif imparfait *    |  I  |   true    |  true 
  PASSE_SIMPLE                 | indicatif passé-simple   |  J  |   false   |  true 
  PASSE_ANTERIEUR              | indicatif passé-simple * |  J  |   true    |  true 
  FUTUR                        | indicatif futur          |  F  |   false   |  true 
  FUTUR_ANTERIEUR              | indicatif futur *        |  F  |   true    |  true 
  CONDITIONNEL_PRESENT         | conditionnel présent     |  C  |   false   |  true 
  CONDITIONNEL_PASSE           | conditionnel présent *   |  C  |   true    |  true 
  SUBJONCTIF_PRESENT           | subjonctif présent       |  S  |   false   |  true 
  SUBJONCTIF_PASSE             | subjonctif présent *     |  S  |   true    |  true 
  SUBJONCTIF_IMPARFAIT         | subjonctif imparfait     |  T  |   false   |  true 
  SUBJONCTIF_PLUS_QUE_PARFAIT  | subjonctif imparfait *   |  T  |   true    |  true 
  IMPERATIF_PRESENT            | impératif présent        |  Y  |   false   |  true 
  IMPERATIF_PASSE              | impératif présent *      |  Y  |   true    |  true 
  INFINITIF_PASSE              | infinitif présent *      |  W  |   true    |  false
  PARTICIPE_PRESENT            | participe présent        |  G  |   false   |  false 
  PARTICIPE_PASSE              | participe passé          |  K  |   false   |  false 
  PARTICIPE_COMPOSE            | participe présent *      |  G  |   true    |  false 
  GERONDIF_PRESENT             | participe présent        |  G  |   false   |  false 
  GERONDIF_PASSE               | participe présent *      |  G  |   true    |  false 
  -----------------------------------------------------------------------------------

  * NOTE: The 'Conjugation Required' for composed tenses pertains to 
          their auxiliary verbs, with the inputted verb always being 
          in the 'participe passé' form.

  */

import { VerbInfoIndex } from 'french-verbs-lefff';

export const tenseMapping: {
  [index: string]: {
    conjugation: VerbInfoIndex;
    composed: boolean;
    personDependent: boolean;
  };
} = {
  PRESENT: { conjugation: 'P', composed: false, personDependent: true },
  PASSE_COMPOSE: { conjugation: 'P', composed: true, personDependent: true },
  IMPARFAIT: { conjugation: 'I', composed: false, personDependent: true },
  PLUS_QUE_PARFAIT: { conjugation: 'I', composed: true, personDependent: true },
  PASSE_SIMPLE: { conjugation: 'J', composed: false, personDependent: true },
  PASSE_ANTERIEUR: { conjugation: 'J', composed: true, personDependent: true },
  FUTUR: { conjugation: 'F', composed: false, personDependent: true },
  FUTUR_ANTERIEUR: { conjugation: 'F', composed: true, personDependent: true },
  CONDITIONNEL_PRESENT: { conjugation: 'C', composed: false, personDependent: true },
  CONDITIONNEL_PASSE: { conjugation: 'C', composed: true, personDependent: true },
  SUBJONCTIF_PRESENT: { conjugation: 'S', composed: false, personDependent: true },
  SUBJONCTIF_PASSE: { conjugation: 'S', composed: true, personDependent: true },
  SUBJONCTIF_IMPARFAIT: { conjugation: 'T', composed: false, personDependent: true },
  SUBJONCTIF_PLUS_QUE_PARFAIT: { conjugation: 'T', composed: true, personDependent: true },
  IMPERATIF_PRESENT: { conjugation: 'Y', composed: false, personDependent: true },
  IMPERATIF_PASSE: { conjugation: 'Y', composed: true, personDependent: true },
  INFINITIF_PASSE: { conjugation: 'W', composed: true, personDependent: false },
  PARTICIPE_PRESENT: { conjugation: 'G', composed: false, personDependent: false },
  PARTICIPE_PASSE: { conjugation: 'K', composed: false, personDependent: false },
  PARTICIPE_COMPOSE: { conjugation: 'G', composed: true, personDependent: false },
  GERONDIF_PRESENT: { conjugation: 'G', composed: false, personDependent: false },
  GERONDIF_PASSE: { conjugation: 'G', composed: true, personDependent: false },
};
