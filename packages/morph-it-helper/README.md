<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# morph-it-helper

[morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) provides an extensive  morphological resource for the Italian language. It is dual-licensed free software and can be redistributed it and/or modified  under the terms of the under the Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License.

`morph-it-helper` very simple Node.js module that contains:

* morph-it derived json files
* a helper class to get data from these json files

The derived json files content remains under the same [Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License licence](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it#licensing_information).


## Installation 
```sh
npm install morph-it-helper
```

## Usage

```javascript
let MorphItHelper = require('morph-it-helper').MorphItHelper;

let mih = new MorphItHelper();

// uomo
console.log(mih.getNoun('uomini'));

// antico
console.log(mih.getAdj('antiche'));
```

The json files are created from morph-it via the `createDb` script.

Current helpers:

*  `getNoun` takes a lemma (string) or flex form (string) of a noun and returns its root. _uomini_ => _uomo_. `null` when not found. When it is a past participle, it will not return the lemma (the infinitive verb) but its masculine singular form: _educati_ => _educati_ (and not _educare_)
*  `getAdj` takes a lemma (string) or a flex form (string) of an adjective and returns its root. _antiche_ => _antico_. `null` when not found.

## Todo

Enrich features.

## dependencies and licences

The code is under Apache 2.0 license.

The derived json files content remains under the same [Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License licence](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it#licensing_information).
