<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: MIT
-->
# english-ordinals

A very simple Node.js module that gives the ordinal representation of numbers in English: 2 => second, 20 => twentieth, etc.

Based on:
- `n2words` to first build cardinal numbers
- [make ordinals code](https://github.com/marlun78/number-to-words/blob/master/src/makeOrdinal.js) thanks to Martin Eneqvist the author


## Installation 
```sh
npm install english-ordinals
```

## Usage

```javascript
const ordinals = require('english-ordinals');

// twentieth
console.log(`20 => ${ordinals.getOrdinal(20)}`);
```

## dependencies

* `n2words` under MIT license
* contains code from [number-to-words](https://github.com/marlun78/number-to-words) under MIT license
