# french-h-muet-aspire

A very simple Node.js module that checks if a French word starting with a h letter is "aspiré" or "muet". For instance _hérisson_ is "aspiré" while _homme_ is "muet".

It is a list with a few helper functions.

## Installation 
```sh
npm install french-h-muet-aspire
```

## Usage

```javascript
var haspire = require('french-h-muet-aspire');

// the full list
console.log( haspire.hAspireList );

// some clever functions
const test = 'hérissonne';
console.log(`dans "${test}" le h est aspiré ? ${haspire.isHAspire(test)}`);
```
