# rosaenlg-pluralize-es

Is a fork of [pluralize-es (MIT)](https://github.com/jfromaniello/pluralize-es) with new exceptions added.
Feel free to make pull requests to add more.

> Finds the plural form of most spanish words. Many exceptions are covered.

## Installation
```
$ npm install --save rosaenlg-pluralize-es
```

## Usage

```js
var plural = require('rosaenlg-pluralize-es');

plural('universidad');
//=> 'universidades'
```

## API

### plural(str)

#### str

Type: `string`

The noun to make plural.

