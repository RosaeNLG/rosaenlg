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

// should be 1
console.log(
  contentDeduplicate.getDistancePourcentage(
    'I eat huge quantities of vegetables and I love wine, beer and pineapples',
    'he eats huge quantities of meat and I love wine, coca-cola, and pineapples',
    0.1,
    'en_US',
  ),
);

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

console.log(JSON.stringify(contentDeduplicate.getClusters(toCompare, 2, 'en_US'), null, 1));
