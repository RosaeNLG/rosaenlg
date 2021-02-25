<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# English verbs conjugation

## Features

Agreement of English verbs, based on a few rules and on linguistic resources.

You have to import and provide independently linguistic resources:
- use `english-verbs-irregular` for a list of irregular verbs (with their preterit and past participle)
- use `english-verbs-gerunds` for a list of irregular gerunds (`ing`)

If you do not provide linguistic resources, very basic rules will be used: adding `ing` for gerunds, and `ed` for past and participles.


## Usage

`getConjugation` will return the conjugated verb based on:
- information about irregular verbs (preteric, past participle and gerund):
  - you can just put `null` if you don't care about irregular verbs, or if your tenses don't require them (only `SIMPLE_PRESENT` and `SIMPLE_FUTURE`)
  - other provide irregular verbs info, using `english-verbs-irregular`, and/or `english-verbs-gerunds`, using the provided helper `mergeVerbsData`
- the verb as a string
- the tense
- number: `S` for he/she/it, `P` for they
- `ExtraParams`: for `SIMPLE_FUTURE`, you can add `{ GOING_TO: true }` to trigger the _going to_ form; default is `{ WILL: true }`

Available tenses are: `SIMPLE_PAST` (or `PAST`), `SIMPLE_PRESENT` (or `PRESENT`), `SIMPLE_FUTURE` (or `FUTURE`), `PROGRESSIVE_PAST`, `PROGRESSIVE_PRESENT`, `PROGRESSIVE_FUTURE`, `PERFECT_PAST`, `PERFECT_PRESENT`, `PERFECT_FUTURE`, `PERFECT_PROGRESSIVE_PAST`, `PERFECT_PROGRESSIVE_PRESENT`, `PERFECT_PROGRESSIVE_FUTURE`.

`mergeVerbsData` will simply combine irregular verbs info and gerunds, to be used in `getConjugation`. In practice you will have `swim: ['swam', 'swum', 'swimming']`, here combining an irregular preterit, past participle and gerund. Parameters:
- `VerbsIrregularInfo`: use `english-verbs-irregular`, or null (irregular verbs are only required for some tenses)
- `GerundsInfo`: use `english-verbs-gerunds`, or null (gerunds are only required for some tenses)


## Limitations

- only `he` (singular S) or `they` (plural P) forms
- no negative form
- no interrogative form
- modals


## Installation 
```sh
npm install english-verbs-helper
```

## Usage

```javascript
const EnglishVerbs = require('english-verbs-helper');
const Irregular = require('english-verbs-irregular');
const Gerunds = require('english-verbs-gerunds');

const VerbsData = EnglishVerbs.mergeVerbsData(Irregular, Gerunds);

// eats
console.log(EnglishVerbs.getConjugation(null, 'eat', 'PRESENT', 'S'));

// ate
console.log(EnglishVerbs.getConjugation(VerbsData, 'eat', 'SIMPLE_PAST', 'S'));

// swimming
console.log(EnglishVerbs.getIngPart(VerbsData['swim'], 'swim'));
```
