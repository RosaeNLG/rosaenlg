<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# spanish-verbs

Agreement of Spanish verbs.

Heavily based on [conjugator](https://github.com/ehoogerbeets/conjugator) (Copyright © 2017, HealthTap, Inc., under Apache 2.0 license).

Some of the changes:
- no dependancy on `fs` to be able to run in a browser
- TypeScript
- [eyeron-eieron-morph construction](https://www.fcg-net.org/demos/morphology/inflectional-patterns/) fix
- more exceptions

API: `getConjugation`

TODO:
- plenty of exceptions still missing



## Installation 
```sh
npm install spanish-verbs
```

## Usage

```javascript
const SpanishVerbs = require('spanish-verbs');

// habla
console.log(SpanishVerbs.getConjugation('hablar', 'INDICATIVE_PRESENT', 2));

```


