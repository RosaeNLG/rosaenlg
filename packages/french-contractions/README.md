<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-contractions

Checks if a French word should be contracted:
- _le hérisson_ vs _l'homme_
- _le yaourt_ vs _l'ylang-ylang_
- _l'iode_ vs _le iota_

Same rules can also be used to manage cet/cet:
- _ce hérisson_ vs _cet homme_
- _cet arbre_ vs _ce yaourt_

And for adjectives:
- _vieux hérisson_ vs _vieil homme_
- _vieil arbre_ vs _vieux yaourt_

Also uses and provides a list of words with "h aspiré", which you can use with or without the helpers.


## Installation 
```sh
npm install french-contractions
```

## Usage

One function `contracts` that take 2 arguments:
- the word (noun or adjective)
- a map of custom exceptions (optional): the word is the key, the value must be an object having a `contracts` property with a boolean value


```javascript
const lib = require('french-contractions');

// hérisson contracts? false
// homme contracts? true
// yaourt contracts? false
// iode contracts? true
['hérisson', 'homme', 'yaourt', 'iode'].forEach((word) => {
  console.log(`${word} contracts? ${lib.contracts(word)}`);
});

```

## dependencies and licences

List of h words based on https://en.wikipedia.org/wiki/Aspirated_h. The derived list in `hmuet.ts` remains under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
