<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# german-ordinals

A very simple Node.js module that gives the ordinal representation of numbers in German: _zwölfte_ for 12 etc. Based on a static list. Works up to 30.


## Installation 
```sh
npm install german-ordinals
```

## Usage

```javascript
var ordinals = require('german-ordinals');

// zwölfte
console.log(`12 => ${ordinals.getOrdinal(12)}`);
```

Will throw an error when the number is too high.

## dependencies and licences

N/A

