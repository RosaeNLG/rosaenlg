<!--
Copyright 2020, Marco Riva, 2019, Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# italian-ordinals-cardinals

A very simple Node.js module that gives textual representations of ordinal numbers in Italian: 12 => _dodicesimo_ (up to 1000000 included thanks to Marco Riva!).

Cardinal numbers representation in this module has been removed:
- support was very poor in general
- you should use `n2words` which supports very well Italian


## Installation 
```sh
npm install italian-ordinals-cardinals
```

## Usage

```javascript
var ordinalsCardinals = require('italian-ordinals-cardinals');

// dodicesimo
console.log(`12 => ${ordinalsCardinals.getOrdinal(12)}`);
```


## dependencies

`n2words` for cardinal numbers before transforming them in ordinal numbers
