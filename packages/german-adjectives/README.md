<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# german-adjectives

Agreement of German adjectives, based on the gender and number of the word, and the case.
You can use `german-adjectives-dict` as the linguistic resource.

## Installation 
```sh
npm install german-adjectives
```

## Usage

```javascript
const GermanAdjectivesLib = require('german-adjectives');
const GermanAdjectives = require('german-adjectives-dict');

// neuen
console.log(GermanAdjectivesLib.agreeGermanAdjective(null, GermanAdjectives, 'neu', 'DATIVE', 'M', 'S', 'DEFINITE'));
```

One single function `agreeGermanAdjective` that takes multiple parameters and return the agreed adjective:

* exception list on linguistic resources (elements in that list will override elements in second parameter); in general just put `null` here
* linguistic resource (list of adjectives): for the format see below and `german-adjectives-dict` lib
* `adjective`: the adjective to agree, 
* `germanCase`: `NOMINATIVE` `ACCUSATIVE` `DATIVE` `GENITIVE`
* `gender` gender of the word; `M` `F` or `N`
* `number`: number of the word; `S` or `P`
* `det`: determiner; `DEFINITE` `INDEFINITE` or `DEMONSTRATIVE`

```json
[
  "Dortmunder":{  
    "AKK":{  
        "DEF":{  
          "P":"Dortmunder",
          "F":"Dortmunder",
          "M":"Dortmunder",
          "N":"Dortmunder"
        },
        "IND":{  
          "P":"Dortmunder",
          "F":"Dortmunder",
          "M":"Dortmunder",
          "N":"Dortmunder"
        },
        "SOL":{  
          "P":"Dortmunder",
          "F":"Dortmunder",
          "M":"Dortmunder",
          "N":"Dortmunder"
        }
    },
    "DAT":{  
      ...
    },
    "GEN":{  
      ...
    },
    "NOM":{  
      ...
    }
  },
  ...
]
```

## Todo

Add more possible determiners.


## dependencies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` (zipped in `dictionary.zip`) is this textual dump. It remains under CC-BY-SA-4.0 licence.
