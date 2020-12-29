# rosaenlg-pluralize-fr

Is a fork of [pluralize-fr (MIT)](https://github.com/swestrich/pluralize-fr) with new exceptions added.
Feel free to make pull requests to add more.

Finds the plural form of most French words. Somes exceptions are covered.

TODO: composed words.

## Installation
```
$ npm install --save rosaenlg-pluralize-fr
```

## Usage

```js
var plural = require('rosaenlg-pluralize-fr');

plural('jambe');
//=> 'jambes'

plural('oeil');
//=> 'yeux'
```

## API

### plural(str)

#### str

Type: `string`

The noun to make plural.
