# Content Deduplicate

**This module is deprecated.**
You can still use it, but `node-simhash` provides better approach and value.
See https://medium.com/@jonathankoren/near-duplicate-detection-b6694e807f7a and https://moz.com/devblog/near-duplicate-detection.




This module brings a distance functions and various helpers to calculate distance between strings. It is designed to prevent "duplicate content": avoid having 2 texts which are too close.

It can be used for SEO purposes or anything.

It is tailored for middle-sized strings, let's say 30 to 300 words.

Provided functions are:
- a specific distance function - it is the main added value of the module
- a helper function that finds out whichs texts are too close from a given text
- a clustering function, which groups close texts together

All functions are language dependant. Supported languages are French, English, Italian and German.


## Distance calculation

### How it works

The main function calculates distances between two strings. It is tailored for middle-sized strings - 30 to 300 words. It is less "strict" than Levenshtein distance as the idea is to see how close two strings look like.

The algorithm is the following:
- stemming of both strings (which also removes punctuation and numbers)
- remove stop words
- each longest common substring counts for 1 (except the very first common one, to respect `dist(a,a) = 0`)
- each left element counts for 1

For example, `AAA BBB CCC KKK PPP OOO` to `ZZZ AAA BBB CCC PPP OOO` = 3:
- `AAA BBB CCC` is common => +0 (as it is the first match)
- left: `KKK PPP OOO` vs `ZZZ PPP OOO`
- `PPP OOO` is common => +1
- left: `KKK` vs `ZZZ` => +2

Mathematically it is almost a real distance:
- `d(a,b) = d(b,a)` is true
- `d(a,b) = 0 <=> a = b` is not really true as 2 strings can have a 0 distance even when they are different: for instance `he has 5` and `it has 6` have a 0 distance
- `d(a,c) <= d(a,b) + d(b,c)` is true

### Raw distance

Use `getDistanceRaw` to get that distance.

### Relative distance

It is sometimes more useful to get a relative distance: pourcentage of how close two strings are. It uses the same algorithm but divides the result by the sum of the number of words of both strings:
- 1 => both strings are 100% different
- 0 => both strings are the same
- 0.3 => both strings are 30% different

Use `getDistancePourcentage` to get that distance.

### Example

Example:
```javascript
const contentDeduplicate = require('./dist/index.js');

// should be 2
console.log(
  contentDeduplicate.getDistanceRaw('I eat huge quantities of vegetables', 'he eats huge quantities of meat', 'en_US'),
);

// should be 0.25
console.log(
  contentDeduplicate.getDistancePourcentage(
    'I eat huge quantities of vegetables',
    'he eats huge quantities of meat',
    null,
    'en_US',
  ),
);
```

In `getDistancePourcentage`, the 3rd parameter is a threshold. If, while being calculated, the distance becomes greater than this threshold, calculation stops and 1 (100% of difference) is returned. This is used to improve speed - usually we care about close strings, but not about the exact distance of distant strings.
```javascript
console.log(
  contentDeduplicate.getDistancePourcentage(
    'I eat huge quantities of vegetables and I love wine, beer and pineapples',
    'he eats huge quantities of meat and I love wine, coca-cola, and pineapples',
    0.1,
    'en_US',
  ),
);
```
will output 1: the distance is not 1, but is greater than 0.1.


## Distance report

Often you have a list of strings, and what to check how close they are each from other.

`getDistanceReport` will calculate all distances and produce a JSON report containing, for each text, the closest ones, but also the most distant one.

*Computation time can become quite long: 1 minute for a few hundreds of strings.*

Parameters are the following:
- an array of textual objects; each object `must` have a `text` property containing its string; feel free to put other properties typically an ID
- the maximal acceptable distance: if the distance between two strings is lower than this threshold, then it will not be added in the list of the closest ones; use 0.2 for instance to only trigger when texts are 20% different or less
- the maximum number of closest strings to be given in the output (only the most close will be given)
- the language of the strings

The output is an array of objects:
- `for`: reference to the textual object
- `closestOnes`: an array with the closes elements; each object points to an element (`with` property) and gives the distance (`difference` property)
- `mostDifferent` is the most distant text (`with` and `difference` properties)

Example:
```javascript
const contentDeduplicate = require('./dist/index.js');

const toCompare = [
  {
    id: 1,
    text: 'I eat huge quantities of vegetables',
  },
  {
    id: 2,
    text: 'he eats huge quantities of meat',
  },
  {
    id: 3,
    text: 'she is vegan',
  },
];

console.log(JSON.stringify(contentDeduplicate.getDistanceReport(toCompare, 0.3, 5, 'en_US'), null, 1));
```
will output:
```json
[
 {
  "for": {
   "id": 1,
   "text": "I eat huge quantities of vegetables"
  },
  "closestOnes": [
   {
    "difference": 0.25,
    "with": {
     "id": 2,
     "text": "he eats huge quantities of meat"
    }
   }
  ],
  "mostDifferent": {
   "with": {
    "id": 3,
    "text": "she is vegan"
   },
   "difference": 1
  }
 },
 {
  "for": {
   "id": 2,
   "text": "he eats huge quantities of meat"
  },
  "closestOnes": [
   {
    "difference": 0.25,
    "with": {
     "id": 1,
     "text": "I eat huge quantities of vegetables"
    }
   }
  ],
  "mostDifferent": {
   "with": {
    "id": 3,
    "text": "she is vegan"
   },
   "difference": 1
  }
 },
 {
  "for": {
   "id": 3,
   "text": "she is vegan"
  },
  "closestOnes": [],
  "mostDifferent": {
   "with": {
    "id": 2,
    "text": "he eats huge quantities of meat"
   },
   "difference": 1
  }
 }
]
```

## Clustering

Use `getClusters` to cluster your texts, thanks to `k-medoids` lib.

Input:
- an array of `Text` objects; each element must have a `text` property, and you can also use an ID or something to know which are the texts
- the number of clusters (it is not discovered automatically by this method)
- a language

Output: array of clusters.

Example:
```javascript
const contentDeduplicate = require('./dist/index.js');

const toCompare = [
  {
    id: 1,
    text: 'I eat huge quantities of vegetables',
  },
  {
    id: 2,
    text: 'he eats huge quantities of meat',
  },
  {
    id: 3,
    text: 'she is vegan',
  },
];

console.log(JSON.stringify(contentDeduplicate.getClusters(toCompare, 2, 'en_US'), null, 1));
```
will output 2 clusters:
```json
[
 [
  {
   "id": 3,
   "text": "she is vegan"
  }
 ],
 [
  {
   "id": 1,
   "text": "I eat huge quantities of vegetables"
  },
  {
   "id": 2,
   "text": "he eats huge quantities of meat"
  }
 ]
]
```

## Performance and cache

When using `getDistanceReport` and `getClusters`, 2 caches are used to avoid:
- preparing (stemming stopwords etc.) the same string multiple times
- recalculating already computed distances

