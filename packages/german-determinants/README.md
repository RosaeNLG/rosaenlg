# german-determinants

A simple Node.js module that contains German adjectives.

For instance _der_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 4 arguments:

* determinant type (string, mandatory): DEFINITE or DEMONSTRATIVE
* case (string, mandatory): NOMINATIVE ACCUSATIVE DATIVE or GENITIVE
* gender (string, mandatory): `M` for masculine, `F` for feminine, `N` for neutral
* number (string, mandatory): `S` for singular, `P` for plural

## Installation 
```sh
npm install german-determinants
```

## Usage

```javascript
var determinants = require('german-determinants');

// der
console.log( determinants.getDet('DEFINITE', 'NOMINATIVE', 'M', 'S') );

// dieser
console.log( determinants.getDet('DEMONSTRATIVE', 'GENITIVE', null, 'P') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
