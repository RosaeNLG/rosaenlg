/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageImpl, Numbers } from './LanguageImpl';
import { LanguageCommon } from 'rosaenlg-commons';
import { enUS as dataFnsEnUs } from 'date-fns/locale';

export class LanguageOther extends LanguageImpl {
  // let's be very permissive
  hasGender = false; // as we have no dict to check
  hasNeutral = true; // why not!
  langForDateFns = dataFnsEnUs;
  spacesWhenSeparatingElements = true;

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    this.iso2 = languageCommon.iso2;
  }

  // well this is a strange idea
  getAgreeAdj(
    adjective: string /* , _gender: Genders, _number: Numbers, _subject: any, _params: AgreeAdjParams */,
  ): string {
    return adjective;
  }

  getSubstantive(subst: string, number: Numbers): string {
    if (number == 'S') {
      return subst;
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `cannot make plural of word ${subst} in ${this.iso2}`;
      throw err;
    }
  }
}
