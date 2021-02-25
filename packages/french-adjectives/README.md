<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-adjectives

A simple Node.js module that makes the agreement of French adjectives with gender and number.
For instance _beau_ becomes _belles_ in feminine plural, and _beaux_ in masculine plural.

It is based on rules and exceptions, not on an extensive list.

In French, the adjective can also vary depending on its position, if it is _before_ or _after_ the noun, and the kind of noun: _un homme vieux_ / _un vieil homme_, _un homme fou_ / _un fol homme_, _un mol ectoplasme_ / _un ectoplasme mou_, _un hamac vieux_ / _un vieux hamac_.
This is also managed by this lib.

It exposes a single function, `agree`, that takes up to 5 arguments:

* adjective (string, mandatory): the adjective not yet agreed
* gender (string, mandatory): `M` for masculine, `F` for feminine
* number (string, mandatory): `S` for singular, `P` for plural
* noun (string, optional): a string containing the noun; used only when the adjective is before the noun
* adjective is before noun (boolean, optional): set this last parameter to `true` if the noun is before the adjective; defaults to `false`, as in French the adjective is most often after the noun
* contraction exceptions (optional): contracted words are managed automatically, like in _un vieil homme_, but you can provide exceptions or override default; provide a map where the noun is the key and where the value is an object having a boolean `contract` property (see `french-contractions`)

## Installation 
```sh
npm install french-adjectives
```

## Usage

```javascript
var adjectives = require('french-adjectives');

// "belles"
console.log( adjectives.agree('beau', 'F', 'P') );

// "vieil"
console.log( adjectives.agree('vieux', 'M', 'S', 'homme', true) );
```

See `test.js` for examples.

## dependencies and licences

* `french-contractions`: Checks how French words should be contracted (Apache 2.0)
