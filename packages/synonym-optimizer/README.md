<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# synonym-optimizer

Gives a score to a string depending on the variety of the synonyms used. 

For instance, let's compare _The coffee is good. I love that coffee_ with _The coffee is good. I love that bewerage_. The second alternative is better because a synonym is used for _coffee_. This module will give a better score to the second alternative.

*The lowest score the better.*

_Fully supported languages_ are *French* *German* *English* *Italian* and *Spanish*.

What it does / How it works:

* single words are extracted thanks to a tokenizer `wink-tokenizer`
* words are lowercased
* stopwords are removed
  * for fully supported languages, a default stopwords list is included, which you can customize
  * for all other languages, no default list is included, but you can provide a custom stop words lists
* for fully supported languages, words are stemmed using `snowball-stemmer` (for all other languages: no stemming)
* when the same word appears multiples times, it raises the score depending on the distance of the two occurrences (if the occurrences are closes it raises the score a lot)

Designed primarly to test the output of a NLG (Natural Language Generation) system.

The stemmer is not perfect. For instance in Italian, _cameriere_ and _cameriera_ have the same stem (_camerier_), while _camerieri_ and _cameriera_ have a different one (_camer_ and _camerier_).

## Installation 
```sh
npm install synonym-optimizer
```

## Usage

```javascript
var synOptimizer = require('synonym-optimizer');

alts = [
  'The coffee is good. I love that coffee.',
  'The coffee is good. I love that bewerage.'
]

/*
The coffee is good. I love that coffee.: 0.5
The coffee is good. I love that bewerage.: 0
*/
alts.forEach((alt) => {
  let score = synOptimizer.scoreAlternative('en_US', alt, null, null, null, null);
  console.log(`${alt}: ${score}`);
});
```

The main function is `scoreAlternative`. It takes a string and returns its score. Arguments are:

* `lang` (string, mandatory): the language.
  * fully supported languages are `fr_FR`, `en_US`, `de_DE`, `it_IT` and `es_ES`
  * with any other language (for instance Dutch `nl_NL`) stemming is disabled and stopwords are not removed
* `alternative` (string, mandatory): the string to score
* `stopWordsToAdd` (string[], optional): list of stopwords to _add_ to the standard stopwords list
* `stopWordsToRemove` (string[], optional): list of stopwords to _remove_ to the standard stopwords list
* `stopWordsOverride` (string[], optional): replaces the standard stopword list
* `identicals` (string[][], optional): list of words that should be considered as beeing identical, for instance `[ ['phone', 'cellphone', 'smartphone'] ]`.

You can also use the `getBest` function. Most arguments are exactly the same, but instead of `alternative`, use `alternatives` (string[]). The output number will not be the score, but simply the index of the best alternative.

The tokenizer is `wink-tokenizer`, it does works with many languages (English, French, German, Hindi, Sanskrit, Marathi etc.) but not asian languages. Therefore the module will not work properly with Japanese, Chinese etc.


## Adding new languages (for developpers / maintainers)

* check for existence of stopwords module: `stopwords-*`
* check for stemmer in `snowball-stemmer` collection (or plug another stemmer)
* plug everything and add tests
* find a proper tokenizer if `wink-tokenizer` does not work

## dependencies and licences

* `wink-tokenizer` to tokenize sentences in multiple languages (MIT).
* `stopwords-en/de/fs/it/es` for standard stopwords lists per language (MIT).
* `snowball-stemmer` to stem words per language (MIT).
