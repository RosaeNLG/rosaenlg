<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# italian-verbs

Agreement of Italian verbs, depending on tense, person and number.

Use `italian-verbs-dict` for the linguistic resource.

## Installation 
```sh
npm install italian-verbs
```

## Usage

```javascript
const ItalianVerbs = require('italian-verbs');
const ItalianVerbsList = require('italian-verbs-dict');

// mangia
console.log(ItalianVerbs.getConjugation(ItalianVerbsList, 'mangiare', 'PRESENTE', 3, 'S'));

// avevano mangiato
console.log(ItalianVerbs.getConjugation(ItalianVerbsList, 'mangiare', 'TRAPASSATO_PROSSIMO', 3, 'P', 'AVERE'));
```

One single function `getConjugation` that takes multiple parameters and return the agreed verb:

* verbs list (linguistic resource): use `italian-verbs-dict` or an extract
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


## Todo

* reflexive form
* facultative `aux` when the verb has always the same aux
