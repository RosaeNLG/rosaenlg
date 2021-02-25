<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# german-dict-helper

https://github.com/languagetool-org/german-pos-dict provides an extensive morphological and syntactic lexicon for German.

`german-dict-helper` very simple Node.js module that contains:

* parts of this data if different specific json files
* a helper class to get data from these files


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

The json files are created from the source data via the `createDb` script.

Current helpers:

*  `getAdj` takes a flex form (string) of an adjective and returns its root.  _gelbe_ => _gelb_. `null` when not found.
*  `getNoun` takes a flex form (string) of a noun and returns its root. _Flaschen_ => _Flasche_. `null` when not found.

## Todo



## dependencies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` (zipped in `dictionary.zip`) is this textual dump. It remains under CC-BY-SA-4.0 licence.

The derived json files included in this package remain under the same CC-BY-SA-4.0 licence.
