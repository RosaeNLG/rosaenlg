# french-ordinals

A very simple Node.js module that gives the ordinal representation of numbers in French: _douzième_ for 12 etc. Based on a static list. Works up to 100.


## Installation 
```sh
npm install french-ordinals
```

## Usage

```javascript
var ordinals = require('french-h-muet-aspire');

// douzième
console.log(`12 => ${ordinals.getOrdinal(12)}`);
```
