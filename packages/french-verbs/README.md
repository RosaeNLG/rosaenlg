# french-verbs

Agreement of French verbs, based on the Lefff.

The [Lefff](http://pauillac.inria.fr/~sagot/index.html#lefff) (Lexique des Formes Fléchies du Français) is a large-scale morphological and syntactic lexicon for French, distributed under the free LGPL-LR licence (Lesser General Public License For Linguistic Resources).

The derived resource file (verbs list) remains under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html).

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
```

One single function `getConjugation`, with a single param object:

* `verb`: string, mandatory. Infinitive form of the verb.
* `person`: number, mandatory. Indicates the person: 0=je, 1=tu, 2=il/elle, 3=nous, 4=vous, 5=ils/elles.
* `tense`: string, mandaotry. Choose beetwen `PRESENT`, `FUTUR`, `IMPARFAIT`, `PASSE_SIMPLE`, `CONDITIONNEL_PRESENT`, `IMPERATIF_PRESENT`, `SUBJONCTIF_PRESENT`, `SUBJONCTIF_IMPARFAIT`, `PASSE_COMPOSE`, `PLUS_QUE_PARFAIT`.
* `pronominal`:boolean, optional. Put `true` to trigger pronominal form (doesn't really work).
* when thense is `PASSE_COMPOSE` or `PLUS_QUE_PARFAIT`:
** `aux`: , `aux` is mandatory and must be `AVOIR` or `ETRE`.
** `agreeGender`: `M` or `F` if you want to agree the past participle
** `agreeNumber`: `S` or `P` if you want to agree the past participle

## Todo

* Pronominal form `s'` (in _je m'arrange_) is not managed yet.
* In some cases the auxiliary (_être_ or _avoir_) and how to agree the participle could be decided automatically.


## Dependancies

.Dependancies
[options="header"]
|=====================================================================
| Resource | Usage | Licence
| `Lefff` | database content | [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html)
|=====================================================================

