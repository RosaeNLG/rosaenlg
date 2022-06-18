/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { RefsManager, NextRef } from './RefsManager';
import { Helper } from './Helper';
import { LanguageImpl } from './LanguageImpl';
import { SpyI } from './Spy';

export class PossessiveManager {
  private languageImpl: LanguageImpl;
  private genderNumberManager: GenderNumberManager;
  private refsManager: RefsManager;
  private helper: Helper;
  private spy: SpyI;

  public constructor(
    languageImpl: LanguageImpl,
    genderNumberManager: GenderNumberManager,
    refsManager: RefsManager,
    helper: Helper,
  ) {
    this.languageImpl = languageImpl;
    this.genderNumberManager = genderNumberManager;
    this.refsManager = refsManager;
    this.helper = helper;
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  /*
    still very partial
  */
  public recipientPossession(owned: any): void {
    this.languageImpl.recipientPossession(owned, this.spy, this.refsManager, this.helper);
  }

  public thirdPossession(owner: any, owned: any, params: any): void {
    this.helper.insertSeparatingSpaceIfRequired();

    // we need to know if it will be ref or anaphora, but also gender, number...
    const nextRef: NextRef = this.refsManager.getNextRep(owner, params);

    switch (nextRef.REPRESENTANT) {
      case 'ref': {
        // ref not triggered, thus we will have to do it
        this.languageImpl.thirdPossessionTriggerRef(
          owner,
          owned,
          params,
          this.spy,
          this.helper,
          this.genderNumberManager,
        );
        break;
      }
      case 'refexpr': {
        // ref was already triggered, we only have to manage the possessive
        this.languageImpl.thirdPossessionRefTriggered(owner, owned, params, this.spy, this.genderNumberManager);
        break;
      }
      /* istanbul ignore next */
      default: {
        const err = new Error();
        err.name = '';
        err.message = `internal pb on thirdPossession: ${JSON.stringify(nextRef)}`;
        throw err;
      }
    }

    this.helper.insertSeparatingSpaceIfRequired();
  }
}
