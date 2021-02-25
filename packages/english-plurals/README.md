<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# English plurals

## Features

Agreement of English words (singular / plural), based on a few rules and on linguistic resources.

You have to import and provide independently linguistic resources: use `english-plurals-list`. If you do not provide linguistic resources, very basic rules will be used: adding `s` or `es` mainly.

Also see `pluralize-me` that does the same thing with another approach (almost no resources, more rules, and allows plural to singular transformation).

## Usage

`getPlural` returns the plural of a singular word, based on:
- a list of exception elements where singular is the key and having a `plural` property: in general leave null
- a list of irregular plurals: use `english-plurals-list`
- the singular word


## Installation 
```sh
npm install english-plurals
```

## Usage

```javascript
const EnglishPlurals = require('english-plurals');
const Irregular = require('english-plurals-list');

// women
console.log(EnglishPlurals.getPlural(Irregular, 'woman'));
```
