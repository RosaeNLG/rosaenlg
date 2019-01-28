# lefff-helper

The [Lefff](http://pauillac.inria.fr/~sagot/index.html#lefff) (Lexique des Formes Fléchies du Français) is a large-scale morphological and syntactic lexicon for French, distributed under the free LGPL-LR licence (Lesser General Public License For Linguistic Resources).

`lefff-helper` very simple Node.js module that contains:

* the Lefff in an embedded sqlite database (instead of a huge text file)
* a helper class to get data from that Lefff database

The derived database remains under [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html).

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

* Each instance creates its own connection to the database, so you should use a singleton.
* You can access directly to the database which is in `resources_pub\lefff.db`.
* The database is created from the Lefff via the `createDb` script.

Current helpers:

*  `getAdj` takes a flex form (string) of an adjective and returns its root.  _bel_ => _beau_.
*  `getNoun` takes a flex form (string) of a noun and returns its root. _yeux_ => _oeil_.

## Todo

Enrich features, especially around verbs.

## Dependancies

.Dependancies
[options="header"]
|=====================================================================
| Resource | Usage | Licence
| `Lefff` | database content | [LGPLLR](http://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html)
|=====================================================================
