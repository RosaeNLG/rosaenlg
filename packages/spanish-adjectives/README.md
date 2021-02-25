<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# spanish-adjectives

Agreement of Spanish adjectives, based on the gender and number.

Manages a lot of special cases:
* extensive list of nationalities: _francés_ becomes _francesas_ FP
* invariable: _esmeralda_, _macho_
* exceptions: _joven_ becomes _jóvenes_ MP
* apocopes (_bueno_ becomes _buen_ when placed before a M S word)

## Installation 
```sh
npm install spanish-adjectives
```

## Usage

```javascript
const SpanishAdjectives = require('spanish-adjectives');

// negras
console.log(SpanishAdjectives.agreeAdjective('negro', 'F', 'P'));

// daneses
console.log(SpanishAdjectives.agreeAdjective('danés', 'M', 'P'));
```

One main function `agreeAdjective` that takes multiple parameters and return the agreed adjective:

* `adjective`: the adjective to agree; it must be the lemma, not the agreed form
* `gender` gender of the word; `M` `F`
* `number`: number of the word; `S` or `P`
* `precedesNoun`: put `true` if the adjective will precede the noun; default `false`; used for apocopes
