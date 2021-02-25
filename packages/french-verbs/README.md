<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-verbs

## Features

Agreement of French verbs, based on a list of verbs.

Use `french-verbs-lefff` as a compatible list of verbs.

Contractions are managed: _elle s'est marrée_, _il se gausse_, _elle s'hydrate_, _ils se haïssent_.

Contains a short static list of verbs that always take "être" auxiliary at past tenses (_Passé Composé_ and _Plus Que Parfait_).


## Installation 
```sh
npm install french-verbs
```

## Usage

```javascript
const FrenchVerbs = require('french-verbs');
const Lefff = require('french-verbs-lefff');

// elle est allée
console.log('elle ' + FrenchVerbs.getConjugation(Lefff, 'aller', 'PASSE_COMPOSE', 2, 'ETRE', 'F'));

// je finis
console.log('je ' + FrenchVerbs.getConjugation(Lefff, 'finir', 'PRESENT', 0));
```

For *conjugations*, one single function `getConjugation`, with multiple parameters:

* `verbsList`: list of verbs; use `french-verbs-lefff` for instance (or anything with the same format)
* `verb`: string, mandatory. Infinitive form of the verb.
* `tense`: string, mandatory. Choose beetwen `PRESENT`, `FUTUR`, `IMPARFAIT`, `PASSE_SIMPLE`, `CONDITIONNEL_PRESENT`, `IMPERATIF_PRESENT`, `SUBJONCTIF_PRESENT`, `SUBJONCTIF_IMPARFAIT`, `PASSE_COMPOSE`, `PLUS_QUE_PARFAIT`.
* `person`: number, mandatory. Indicates the person: 0=je, 1=tu, 2=il/elle, 3=nous, 4=vous, 5=ils/elles.
* when thense is `PASSE_COMPOSE` or `PLUS_QUE_PARFAIT`:
  * `aux`: auxiliary, `AVOIR` or `ETRE`. If the auxiliary is not set, these rules will apply:
    * pronominal verbs always use `ETRE`
    * there is a short list of verbs that always take `ETRE`
    * transitive verbs rather take `AVOIR`
  * `agreeGender`: `M` or `F` if you want to agree the past participle
  * `agreeNumber`: `S` or `P` if you want to agree the past participle
* `pronominal`: boolean. Put `true` to trigger pronominal form. You can alternatively indicate the pronominal form in the verb directly: `s'écrier`, `se rendre`, etc.


`alwaysAuxEtre` returns `true` if the verb (passed as an infitive) always conjugates with "être" auxiliary.

`isTransitive` returns `true` if the verb (passed as an infitive) is transitive.

The agreement is not done automatically even when `aux` is `ETRE`, as the subject gender is not known.

