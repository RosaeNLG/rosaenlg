<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# italian-adjectives

Agreement of Italian adjectives, based on the gender and number of the word.

Manages irregular adjectives (_bello_ _buono_ _grande_ _santo_) when placed before the noun.

Use `italian-adjectives-dict` as linguistic resource.


## Installation 
```sh
npm install italian-adjectives
```

## Usage

```javascript
const ItalianAdjectives = require('italian-adjectives');
const ItalianAdjectivesList = require('italian-adjectives-dict');

// azzurre
console.log(ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'azzurro', 'F', 'P'));

// Sant'
console.log(ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'Santo', 'F', 'S', 'Anna', true));
```

One main function `agreeitalianAdjective` that takes multiple parameters and return the agreed adjective:

* exception data that overrides adjective data (usually just put `null`)
* adjective data (linguistic resource), see `italian-adjectives-dict`
* `adjective`: the adjective to agree; it must be the lemma, not the agreed form (i.e. _azzurro_ not _azzurre_); when participe put the masculine singular (`educato` MP => _educati_)
* `gender` gender of the word; `M` `F` or `N`
* `number`: number of the word; `S` or `P`
* `noun`: if `isBeforeNoun` is `true` _and_ the adjective is irregular, you must indicate the noun
* `isBeforeNoun`: put `true` if the adjective is meant to be placed before the noun; default is `false`

`getAdjectiveInfo` to get raw data about an adjective.

Possessive articles (`mio` `tio` etc.) are supported (and you do not need to put `isBeforeNoun` to true).

