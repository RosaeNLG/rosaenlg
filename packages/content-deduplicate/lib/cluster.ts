import { Clusterer } from 'k-medoids';
import { getDistanceRaw, Distance, CacheDistMap, EncodedMap } from './distance';
import { Text } from './distanceReport';
import { Languages } from 'synonym-optimizer';

export function getClusters(texts: Text[], clusters: number, lang: Languages): {}[][] {
  if (!texts || texts.length == 0) {
    const err = new Error();
    err.message = `you must provide some texts`;
    throw err;
  }

  if (!clusters) {
    const err = new Error();
    err.message = `number of clusters is mandatory`;
    throw err;
  }

  console.log(`clustering, number of texts: ${texts.length} in ${clusters} clusters`);

  const cacheDistMap: CacheDistMap = new Map<string, Map<string, Distance>>();
  const encodedMap: EncodedMap = new Map<string, string[]>();

  function distanceFct(t1: Text, t2: Text): number {
    return getDistanceRaw(t1.text, t2.text, lang, cacheDistMap, encodedMap);
  }

  const myClusterer = Clusterer.getInstance(texts, clusters, distanceFct);

  return myClusterer.getClusteredData();
}
