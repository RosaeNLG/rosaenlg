# german-adjectives

Agreement of German adjectives, based on the gender and number of the word, and the case.

It is based on the german-pos-dict: https://github.com/languagetool-org/german-pos-dict which provides an extensive morphological and syntactic lexicon for German.


## Installation 
```sh
npm install german-adjectives
```

## Usage

```javascript
var GermanAdjectives = require('german-adjectives');

// neuen
console.log( GermanAdjectives.agreeGermanAdjective('neu', 'DATIVE', 'M', 'S', 'DEFINITE') );
```

One single function `agreeGermanAdjective` that takes multiple parameters and return the agreed adjective:

* `adjective`: the adjective to agree, 
* `germanCase`: NOMINATIVE ACCUSATIVE DATIVE GENITIVE
* `gender` gender of the word; M F or N
* `number`: number of the word; S or P
* `det`: determinant; DEFINITE or DEMONSTRATIVE


## Todo

Add more possible determinants.


## Dependancies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.
