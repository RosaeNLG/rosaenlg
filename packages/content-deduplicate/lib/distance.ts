import { getStandardStopWords, getStemmedWords, Languages } from 'synonym-optimizer';

interface FoundCommon {
  found: string[];
  length: number;
  indexS1: number;
  indexS2: number;
}

export interface Distance {
  val: number;
  max: number;
}

export type CacheDistMap = Map<string, Map<string, Distance>>;

export type EncodedMap = Map<string, string[]>;

/* https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/string/longest-common-substring/longestCommonSubstring.js
is MIT
*/
function longestCommonSubstring(s1: string[], s2: string[]): FoundCommon {
  // Convert strings to arrays to treat unicode symbols length correctly.
  // For example:
  // '𐌵'.length === 2
  // [...'𐌵'].length === 1
  //const s1 = [...string1];
  //const s2 = [...string2];

  // Init the matrix of all substring lengths to use Dynamic Programming approach.
  const substringMatrix = Array(s2.length + 1)
    .fill(null)
    .map(() => {
      return Array(s1.length + 1).fill(null);
    });

  // Fill the first row and first column with zeros to provide initial values.
  for (let columnIndex = 0; columnIndex <= s1.length; columnIndex += 1) {
    substringMatrix[0][columnIndex] = 0;
  }

  for (let rowIndex = 0; rowIndex <= s2.length; rowIndex += 1) {
    substringMatrix[rowIndex][0] = 0;
  }

  // Build the matrix of all substring lengths to use Dynamic Programming approach.
  let longestSubstringLength = 0;
  let longestSubstringColumn = 0;
  let longestSubstringRow = 0;

  for (let rowIndex = 1; rowIndex <= s2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= s1.length; columnIndex += 1) {
      if (s1[columnIndex - 1] === s2[rowIndex - 1]) {
        substringMatrix[rowIndex][columnIndex] = substringMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        substringMatrix[rowIndex][columnIndex] = 0;
      }

      // Try to find the biggest length of all common substring lengths
      // and to memorize its last character position (indices)
      if (substringMatrix[rowIndex][columnIndex] > longestSubstringLength) {
        longestSubstringLength = substringMatrix[rowIndex][columnIndex];
        longestSubstringColumn = columnIndex;
        longestSubstringRow = rowIndex;
      }
    }
  }

  if (longestSubstringLength === 0) {
    // Longest common substring has not been found.
    return {
      found: [],
      length: longestSubstringLength,
      indexS1: -1,
      indexS2: -1,
    };
  }

  const res: FoundCommon = {
    found: [],
    length: longestSubstringLength,
    indexS1: longestSubstringColumn - longestSubstringLength,
    indexS2: longestSubstringRow - longestSubstringLength,
  };

  // Detect the longest substring from the matrix.
  // const longestSubstring = [];

  while (substringMatrix[longestSubstringRow][longestSubstringColumn] > 0) {
    // longestSubstring = s1[longestSubstringColumn - 1] + longestSubstring;
    res.found.unshift(s1[longestSubstringColumn - 1]);
    longestSubstringRow -= 1;
    longestSubstringColumn -= 1;
  }
  return res;
}

function distanceHelper(s1: string[], s2: string[], addNext: number, distMaxAbsoluteLeft: number): number {
  // console.log(`s1: ${s1}`);
  // console.log(`s2: ${s2}`);
  // console.log(`distMaxAbsoluteLeft: ${distMaxAbsoluteLeft}`);

  if (distMaxAbsoluteLeft != null && distMaxAbsoluteLeft < 0) {
    // console.log(`stopping distance calculation because too far!`);
    return Infinity;
  }

  const foundCommon: FoundCommon = longestCommonSubstring(s1, s2);

  if (foundCommon.length == 0) {
    // console.log('nothing found, ending');
    return s1.filter(elt => elt != '_').length + s2.filter(elt => elt != '%').length;
  } else {
    // console.log(foundCommon);
    for (let i = 0; i < foundCommon.length; i++) {
      s1[foundCommon.indexS1 + i] = `_`;
      s2[foundCommon.indexS2 + i] = '%';
    }
    return addNext + distanceHelper(s1, s2, 1, distMaxAbsoluteLeft != null ? distMaxAbsoluteLeft - addNext : null);
  }
}

// const encodedMap = new Map<string, string[]>();
// const distMap = new Map<string, Map<string, Distance>>();

function getDistance(
  s1: string,
  s2: string,
  distMaxPc: number,
  lang: Languages,
  cacheDistMap: CacheDistMap,
  encodedMap: EncodedMap,
): Distance {
  if (!lang) {
    const err = new Error();
    err.message = `lang is mandatory`;
    throw err;
  }
  // console.log(`calling distance: ${s1} ${s2}`);
  function getStemmedWordsLocal(s: string): string[] {
    // console.log(`getStemmedWordsLocal: s: ${s}, lang ${lang}`);
    const res = getStemmedWords(s, getStandardStopWords(lang), lang);
    // console.log(`getStemmedWordsLocal ${res}`);
    return res;
  }

  function getPrepared(s: string): string[] {
    if (encodedMap) {
      const cached = encodedMap.get(s);
      if (cached) {
        // console.log(`found in cache! ${cached}`);
        return cached;
      }
    }

    const encoded = getStemmedWordsLocal(s);
    if (encodedMap) {
      encodedMap.set(s, encoded);
    }
    return encoded;
  }

  if (cacheDistMap) {
    if (!cacheDistMap.has(s1)) {
      cacheDistMap.set(s1, new Map<string, Distance>());
    }
    if (!cacheDistMap.has(s2)) {
      cacheDistMap.set(s2, new Map<string, Distance>());
    }
    const cachedDist = cacheDistMap.get(s1).get(s2);
    if (cachedDist) {
      // process.stdout.write('X');
      return cachedDist;
    }
  }

  const prepared1 = [...getPrepared(s1)];
  const prepared2 = [...getPrepared(s2)];
  const max = prepared1.length + prepared2.length;
  const distance: Distance = {
    val: distanceHelper(prepared1, prepared2, 0, distMaxPc ? distMaxPc * max : null),
    max: max,
  };
  if (cacheDistMap) {
    cacheDistMap.get(s1).set(s2, distance);
    cacheDistMap.get(s2).set(s1, distance);
  }
  return distance;
}

export function getDistancePourcentage(
  s1: string,
  s2: string,
  distMaxPc: number,
  lang: Languages,
  cacheDistMap: CacheDistMap,
  encodedMap: EncodedMap,
): number {
  const distance: Distance = getDistance(s1, s2, distMaxPc, lang, cacheDistMap, encodedMap);
  //console.log(distance);
  return distance.val === Infinity ? 1 : distance.val / distance.max;
}

export function getDistanceRaw(
  s1: string,
  s2: string,
  lang: Languages,
  cacheDistMap: CacheDistMap,
  encodedMap: EncodedMap,
): number {
  return getDistance(s1, s2, null, lang, cacheDistMap, encodedMap).val;
}
