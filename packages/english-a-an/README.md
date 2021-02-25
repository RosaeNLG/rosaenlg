<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# English a/an

Determines whether a sequence (noun or adjective) should start with `a` or `an`: _an elephant_, _a European_, _an Irishman_, _an heir_, etc.

It is based on a list of words that must be preceded by `an`: use `english-a-an-list` as that list.


## Usage

`getAAn` will return either `a` or `an` based on:
- a list custom of exceptions: map where the word is the key, and value has a `aan` key with either `a` or `an` as a value; in general put just null here
- a list of words that must be preceded by `an`: use `english-a-an-list`
- the word as a string

Case matters:
- `English` => `an English`, while `english` will not be found
- `an AND` makes sense, while `a/an and` doesn't

## Installation 
```sh
npm install english-a-an
```

## Usage

```javascript
const englishAAn = require('english-a-an');
const englishAAnList = require('english-a-an-list');

// an
console.log(englishAAn.getAAn(null, englishAAnList, 'English'));

// a
console.log(englishAAn.getAAn(null, englishAAnList, 'European'));
```

