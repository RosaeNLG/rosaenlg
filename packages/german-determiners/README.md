# german-determiners

A simple Node.js module that contains German adjectives.

For instance _der_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 4 arguments:

* determiner type (string, mandatory): DEFINITE DEMONSTRATIVE or POSSESSIVE
* case (string, mandatory): NOMINATIVE ACCUSATIVE DATIVE or GENITIVE
* gender of the *owner* (string, mandatory when determiner is POSSESSIVE): `M` for masculine, `F` for feminine, `N` for neutral
* gender of the *owned* (string, mandatory): `M` `F` `N`
* number (string, mandatory): `S` for singular, `P` for plural

## Installation 
```sh
npm install german-determiners
```

## Usage

```javascript
var determiners = require('german-determiners');

// der
console.log( determiners.getDet('DEFINITE', 'NOMINATIVE', null, 'M', 'S') );

// dieser
console.log( determiners.getDet('DEMONSTRATIVE', 'GENITIVE', null, null, 'P') );

// ihres
console.log( determiners.getDet('POSSESSIVE', 'GENITIVE', 'F', 'N', 'S') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
