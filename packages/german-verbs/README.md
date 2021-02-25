<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# german-verbs

Agreement of German verbs, depending on tense, person and number.

Use `german-verbs-dict` as the linguistic resource.

## Installation 
```sh
npm install german-verbs
```

## Usage

```javascript
const GermanVerbsLib = require('german-verbs');
const GermanVerbsDict = require('german-verbs-dict');

// hörten
console.log(GermanVerbsLib.getConjugation(GermanVerbsDict, 'hören', 'PRATERITUM', 3, 'P'));

// werden gehabt haben
console.log(GermanVerbsLib.getConjugation(GermanVerbsDict, 'haben', 'FUTUR2', 3, 'P', 'HABEN'));
```

One single function `getConjugation` that takes multiple parameters and return the agreed verb:

* verb data (linguistic resource): see `german-verbs-dict` for the format
* verb (string): the verb to agree
* tense (string): 
  * Indicativ: `PRASENS` `PRATERITUM` `FUTUR1` `FUTUR2` `PERFEKT` `PLUSQUAMPERFEKT`
  * Konjunktiv1: `KONJUNKTIV1_PRASENS` `KONJUNKTIV1_FUTUR1` `KONJUNKTIV1_PERFEKT`
  * Konjunktiv2: `KONJUNKTIV2_PRATERITUM` `KONJUNKTIV2_FUTUR1` `KONJUNKTIV2_FUTUR2`
* person: `1` `2` or `3`
* number: `S` or `P`
* aux: SEIN or HABEN. Mandatory when the tense requires an auxiliary (`PERFEKT` `PLUSQUAMPERFEKT` `FUTUR2` `KONJUNKTIV1_PERFEKT` `KONJUNKTIV2_FUTUR2`), unless for a short list of verbs that always take `SEIN` (like _fliegen_ _gehen_ etc.)
* pronominal (boolean): put `true` if you want the reflexive form _Ich wasche mich_. You can also directly use the pronominal infinitive: `sich waschen`.
* pronominalCase: `ACCUSATIVE` for Accusative or `DATIVE` for Dative. Mandatory when `pronominal` is true and `S` `1` or `S` `2`.

The agreed verb is a `string[]`, not a `string`, as for many tenses there are multiple parts, and as you might wish to put something between the different parts of the conjugated verb.

The size of the result array will always be:

* 1 for simple tenses
* 2 for `FUTUR1` `PERFEKT` `PLUSQUAMPERFEKT` `KONJUNKTIV1_FUTUR1` `KONJUNKTIV1_PERFEKT` `KONJUNKTIV2_FUTUR1`: for instance `['wird', 'sein']` for `FUTUR1 sein 3S`
* also 2 for `FUTUR2` `KONJUNKTIV2_FUTUR2`; even if the result if 3 words long, the split is made at the right place to add content:  for instance `['werde', 'gegessen haben']` for KONJUNKTIV2_FUTUR2


## Todo

* imperative form
