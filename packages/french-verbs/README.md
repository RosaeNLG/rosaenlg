# french-verbs

## Features

* agreement of French verbs (based on Lefff)
* list of verbs that always take "être" auxiliary
* list of transitive verbs (based on wiktionary)
* list of intransitive verbs


### Agreement of French verbs

Agreement of French verbs, based on the Lefff.

The [Lefff](http://pauillac.inria.fr/~sagot/index.html#lefff) (Lexique des Formes Fléchies du Français) is a large-scale morphological and syntactic lexicon for French, distributed under the free LGPL-LR licence (Lesser General Public License For Linguistic Resources).

The derived resource file `resources_pub/conjugation/conjugation.json` remains under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html).

Contractions are managed: _elle s'est marrée_, _il se gausse_, _elle s'hydrate_, _ils se haïssent_.

### Verbs that always take "être"

Short static list of verbs that always take "être" auxiliary at past tenses (_Passé Composé_ and _Plus Que Parfait_).

### Transitive verbs

Long static list of transitive verbs.

Based on [wiktionary](https://fr.wiktionary.org/wiki/Cat%C3%A9gorie:Verbes_transitifs_en_fran%C3%A7ais).
The `resources_pub/transitive/transitive.json` resource remains under [CC BY-SA 3.0 licence](https://creativecommons.org/licenses/by-sa/3.0/deed.fr).

---
**INFO**

In French, intransitive verbs often have a transitive usage, and transitive verbs almost always have an intransitive usage.
---


### Intransitive verbs

Medium static list of intransitive verbs.


## Installation 
```sh
npm install french-verbs
```

## Usage

```javascript
var FrenchVerbs = require('french-verbs');

// elle est allée
console.log( "elle " + FrenchVerbs.getConjugation({
  verb: 'aller',
  person: 2,
  aux: 'ETRE',
  tense: 'PASSE_COMPOSE',
  agreeGender:'F'
}) );

// je finis
console.log( "je " + FrenchVerbs.getConjugation({
  verb: 'finir',
  person: 0,
  tense: 'PRESENT'
}) );


// true
console.log(FrenchVerbs.alwaysAuxEtre('demeurer'));

// true
console.log(FrenchVerbs.isIntransitive('voleter'));

// true
console.log(FrenchVerbs.isTransitive('abandonner'));
```

For *conjugations*, one single function `getConjugation`, with a single param object:

* `verb`: string, mandatory. Infinitive form of the verb.
* `person`: number, mandatory. Indicates the person: 0=je, 1=tu, 2=il/elle, 3=nous, 4=vous, 5=ils/elles.
* `tense`: string, mandatory. Choose beetwen `PRESENT`, `FUTUR`, `IMPARFAIT`, `PASSE_SIMPLE`, `CONDITIONNEL_PRESENT`, `IMPERATIF_PRESENT`, `SUBJONCTIF_PRESENT`, `SUBJONCTIF_IMPARFAIT`, `PASSE_COMPOSE`, `PLUS_QUE_PARFAIT`.
* `pronominal`: boolean, optional. Put `true` to trigger pronominal form (doesn't really work).
* when thense is `PASSE_COMPOSE` or `PLUS_QUE_PARFAIT`:
** `aux`: auxiliary, `AVOIR` or `ETRE`. If the auxiliary is not set, these rules will apply:
*** pronominal verbs always use `ETRE`
*** there is a short list of verbs that always take `ETRE`
*** transitive verbs rather take `AVOIR`
** `agreeGender`: `M` or `F` if you want to agree the past participle
** `agreeNumber`: `S` or `P` if you want to agree the past participle


`alwaysAuxEtre` returns `true` if the verb (passed as an infitive) always conjugates with "être" auxiliary.

`isIntransitive` returns `true` if the verb (passed as an infitive) is intransitive.

`isTransitive` returns `true` if the verb (passed as an infitive) is transitive.


## Todo

* In some cases the how to agree the participle could be decided automatically.


## Dependancies and licences

* verbs database (sqlite) for conjugation under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html)
* transitive verbs list crawled via wiktionary API under [CC BY-SA 3.0 licence](https://creativecommons.org/licenses/by-sa/3.0/deed.fr)

