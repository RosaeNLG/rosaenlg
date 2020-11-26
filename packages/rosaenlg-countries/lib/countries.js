/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


/* eslint-disable @typescript-eslint/no-unused-vars */

const countries_LANG = JSON.parse(COUNTRIES_PLACEHOLDER);

function getCountry_LANG(ids) {
  let key;
  if (ids.cca2) {
    key = 'cca2';
  } else if (ids.cca3) {
    key = 'cca3';
  } else if (ids.ccn3) {
    key = 'ccn3';
  } else {
    throw new Error('key must be cca2 cca3 or ccn3');
  }

  for (let i = 0; i < countries_LANG.length; i++) {
    if (countries_LANG[i][key] == ids[key]) {
      return countries_LANG[i];
    }
  }
}
