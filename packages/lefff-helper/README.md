<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# lefff-helper

The [Lefff](http://pauillac.inria.fr/~sagot/index.html#lefff) (Lexique des Formes Fléchies du Français) is a large-scale morphological and syntactic lexicon for French, distributed under the free LGPL-LR licence (Lesser General Public License For Linguistic Resources).

`lefff-helper` very simple Node.js module that contains:

* json files derived from Lefff
* a helper class to get data from these json files

The derived json files remains under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html).

## Installation 
```sh
npm install lefff-helper
```

## Usage

```javascript
var LefffHelper = require('lefff-helper').LefffHelper;

var lh = new LefffHelper();

// oeil
console.log( lh.getNoun("yeux") );

// beau
console.log( lh.getAdj("bel") );
```

The json files are created from the Lefff via the `createDb` script.

Current helpers:

*  `getAdj` takes a flex form (string) of an adjective and returns its root.  _bel_ => _beau_. `null` when not found. When the adjective is a past participle like _embarrassée_, the returned root is not the real lemma of the leff (would be _embarrasser_) but the masculine singular form (here _embarrassé_).
*  `getNoun` takes a flex form (string) of a noun and returns its root. _yeux_ => _oeil_. `null` when not found.

## Todo

Manage exceptions, as the Lefff often contain many roots for one plural, like:
```
chevaux	nc	cheval	mp
chevaux	nc	chevau	mp
chevaux	nc	chevaux	mp
```
The best choice is _cheval_ / _chevaux_, but there is no clear information in the Lefff about the most frequent alternative.

## dependencies and licences

Derived json files content under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html).

