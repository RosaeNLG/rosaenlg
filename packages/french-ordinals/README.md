<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-ordinals

A very simple Node.js module that gives the ordinal representation of numbers in French: _douzième_ for 12 etc. Based on a static list. Works up to 100.

For 1, you can add a second parameter (M or F) to distinguish between _premier_ and _première_, M being default.

## Installation 
```sh
npm install french-ordinals
```

## Usage

```javascript
var ordinals = require('french-ordinals');

// première
console.log(`1 F => ${ordinals.getOrdinal(1, 'F')}`);

// douzième
console.log(`12 => ${ordinals.getOrdinal(12)}`);
```

## dependencies

N/A
