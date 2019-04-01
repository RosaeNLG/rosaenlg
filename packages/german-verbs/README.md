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

For FUTUR1 FUTUR2 PERFEKT PLUSQUAMPERFEKT KONJUNKTIV1_FUTUR1 KONJUNKTIV1_PERFEKT KONJUNKTIV2_FUTUR1 KONJUNKTIV2_FUTUR2 you will get a result containing multiple words (for instance `wird sein` for FUTUR1 sein 3S). If you need to put something between the different parts of the conjugated verb just split the result.

## Todo

* pronominal form

## Dependancies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.
