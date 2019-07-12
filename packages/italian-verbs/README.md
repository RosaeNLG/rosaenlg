# italian-verbs

Agreement of Italian verbs, depending on tense, person and number.

It is based on [morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) which provides an extensive  morphological resource for the Italian language.


## Installation 
```sh
npm install italian-verbs
```

## Usage

```javascript
var ItalianVerbs = require('italian-verbs');

// mangia
console.log(ItalianVerbs.getConjugation('mangiare', 'PRESENTE', 3, 'S'));

// avevano mangiato
console.log(ItalianVerbs.getConjugation('mangiare', 'TRAPASSATO_PROSSIMO', 3, 'P', 'AVERE'));
```

One single function `getConjugation` that takes multiple parameters and return the agreed verb:

* verb (string): the verb to agree
* tense (string): 
  * Indicative: `PRESENTE`, `IMPERFETTO`, `PASSATO_REMOTO`, `FUTURO_SEMPLICE`, `PASSATO_PROSSIMO`, `TRAPASSATO_PROSSIMO`, `TRAPASSATO_REMOTO`, `FUTURO_ANTERIORE`
  * Conjonctive: `CONG_PRESENTE`, `CONG_PASSATO`, `CONG_IMPERFETTO`, `CONG_TRAPASSATO`
  * Conditional: `COND_PRESENTE`, `COND_PASSATO`
  * `IMPERATIVO`
* person: `1` `2` or `3`
* number: `S` or `P`
* when tense is a composed tense (`PASSATO_PROSSIMO`, `TRAPASSATO_PROSSIMO`, `TRAPASSATO_REMOTO`, `FUTURO_ANTERIORE`, `CONG_PASSATO`, `CONG_TRAPASSATO`, `COND_PASSATO`):
  * `aux`: `ESSERE` or `AVERE`. Mandatory.
  * `agreeGender`: `M` or `F` if you want to agree the past participle
  * `agreeNumber`: `S` or `P` if you want to agree the past participle
* verb data to enrich the standard verb list with specific verbs, also overrides the standard list entries; key value format (for instance `{'mangiare': ...}`); for the the format of the value see the output of `getVerbInfo`, it must be the same.


## Todo

* reflexive form
* facultative `aux` when the verb has always the same aux

## Dependancies and licences

[morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) provides an extensive  morphological resource for the Italian language. It is dual-licensed free software and can be redistributed it and/or modified  under the terms of the under the Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License.
The derived file `verbs.json` remains under the same licence.
