<!--
Copyright 2019 Ludan Stoecklé, 2016 Samuel Westrich
SPDX-License-Identifier: MIT
-->
# rosaenlg-gender-es

> Finds the gender of Spanish nouns.

Is a fork of [gender-es](https://github.com/swestrich/gender-es) with:
- some exceptions added https://en.wiktionary.org/wiki/Category:Spanish_nouns_with_irregular_gender
- features removed like determiners
- added neutral:
  - when can be either m or f e.g. 'estratega'
  - 'disco' is returned as neutral as depending the meaning it can be either m or f, same for 'panda' etc.


## Installation
```
$ npm install --save rosaenlg-gender-es
```

## Usage

```js
var gender = require('rosaenlg-gender-es');

gender('carne');
// -> 'f'


```

## API

### genderForNoun(str)

#### str

Type: `string`

Get the gender of the Spanish noun.

