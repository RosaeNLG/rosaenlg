# german-verbs

Agreement of German verbs, depending on tense, person and number.

It is based on the german-pos-dict: https://github.com/languagetool-org/german-pos-dict which provides an extensive morphological and syntactic lexicon for German.


## Installation 
```sh
npm install german-verbs
```

## Usage

```javascript
var GermanVerbs = require('german-verbs');

// hörten
console.log( GermanVerbs.getConjugation('hören', 'PRATERITUM', 3, 'P') );

// werden gehabt haben
console.log( GermanVerbs.getConjugation('haben', 'FUTUR2', 3, 'P', 'HABEN') );
```

One single function `getConjugation` that takes multiple parameters and return the agreed verb:

* verb (string): the verb to agree
* tense (string): 
** Indicativ: PRASENS PRATERITUM FUTUR1 FUTUR2 PERFEKT PLUSQUAMPERFEKT
** Konjunktiv1: KONJUNKTIV1_PRASENS KONJUNKTIV1_FUTUR1 KONJUNKTIV1_PERFEKT 
** Konjunktiv2: KONJUNKTIV2_PRATERITUM KONJUNKTIV2_FUTUR1 KONJUNKTIV2_FUTUR2
* person: 1 2 or 3
* number: S or P
* aux: SEIN or HABEN. Mandatory when the tense requires an auxiliary (PERFEKT PLUSQUAMPERFEKT FUTUR2 KONJUNKTIV1_PERFEKT KONJUNKTIV2_FUTUR2), unless for a short list of verbs that always take SEIN (like _fliegen_ _gehen_ etc.)
* pronominal (boolean): put `true` if you want the reflexive form _Ich wasche mich_
* pronominalCase: ACCUSATIVE for Accusative or DATIVE for Dative. Mandatory when `pronominal` is true and S 1 or S 2.
* verb data to enrich the standard verb list with specific verbs, also overrides the standard list entries; key value format (for instance `{'fressen': ...}`); for the the format of the value see the output of `getVerbData`, it must be the same.

The agreed verb is a `string[]`, not a `string`, as for many tenses there are multiple parts, and as you might wish to put something between the different parts of the conjugated verb.

The size of the result array will always be:

* 1 for simple tenses
* 2 for FUTUR1 PERFEKT PLUSQUAMPERFEKT KONJUNKTIV1_FUTUR1 KONJUNKTIV1_PERFEKT KONJUNKTIV2_FUTUR1: for instance `['wird', 'sein']` for FUTUR1 sein 3S
* also 2 for FUTUR2 KONJUNKTIV2_FUTUR2; even if the result if 3 words long, the split is made at the right place to add content:  for instance `['werde', 'gegessen haben']` for KONJUNKTIV2_FUTUR2


## Todo

* imperative form

## Dependancies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.
