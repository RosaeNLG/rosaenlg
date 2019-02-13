# german-dict-helper

https://github.com/languagetool-org/german-pos-dict provides an extensive morphological and syntactic lexicon for German.

`german-dict-helper` very simple Node.js module that contains:

* this data in an embedded sqlite database (instead of a huge text file)
* a helper class to get data from that database

In practice, you can use it this database to agree adjectives and nouns in German, taking the case into account.


## Installation 
```sh
npm install german-dict-helper
```

## Usage

```javascript
var GermanDictHelper = require('german-dict-helper').GermanDictHelper;


var gdh = new GermanDictHelper();

// Frühstück
console.log( gdh.getNoun("Frühstücken") );

// schön
console.log( gdh.getAdj("schöner") );
```

* Each instance creates its own connection to the database, so you should use a singleton.
* You can access directly to the database which is in `resources_pub\dict.db`.
* The database is created from the source data via the `createDb` script.

Current helpers:

*  `getAdj` takes a flex form (string) of an adjective and returns its root.  _gelbe_ => _gelb_.
*  `getNoun` takes a flex form (string) of a noun and returns its root. _Flaschen_ => _Flasche_.

## Todo

Enrich features, especially around verbs.

## Dependancies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.

The derived database included in this package remains under the same CC-BY-SA-4.0 licence.
