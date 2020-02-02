# french-words-gender

Gender of French words: _autoroute_ is feminine, _déjeuner_ is masculine, etc.
Use `french-words-gender-lefff` to add real linguistic resources.


## Installation 
```sh
npm install french-words-gender
```

## Usage

```javascript
const FrenchWordsLib = require('french-words-gender');
const FrenchWordsLefff = require('french-words-gender-lefff');

// M
console.log(FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, 'déjeuner'));

// F
console.log(FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, 'Console'));
```

One single function `getGenderFrenchWord`, with the following parameters:

* word list (see `french-words-gender-lefff` for format: `{'bague':'F', 'blablabla':'F', ...}`)
* word at its root form (will find _autoroute_ but not _autoroutes_)

Case matters: DEA, DESS, DEUG etc.
