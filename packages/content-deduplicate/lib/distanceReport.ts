import { getDistancePourcentage, Distance, CacheDistMap, EncodedMap } from './distance';
import { Languages } from 'synonym-optimizer';

export interface Text {
  text: string;
  [key: string]: any;
}
interface DistText {
  with: Text;
  difference: number;
}

interface DistAnalysis {
  for: Text;
  closestOnes: DistText[];
  mostDifferent: DistText;
}

export function getDistanceReport(
  texts: Text[],
  maxAcceptableDistance: number,
  closestQty: number,
  lang: Languages,
): DistAnalysis[] {
  if (!texts || texts.length == 0) {
    const err = new Error();
    err.message = `you must provide some texts`;
    throw err;
  }
  if (!maxAcceptableDistance) {
    const err = new Error();
    err.message = `the maximum acceptable distance is mandatory`;
    throw err;
  }
  if (!closestQty) {
    const err = new Error();
    err.message = `the closest quantity limit is mandatory`;
    throw err;
  }

  const cacheDistMap: CacheDistMap = new Map<string, Map<string, Distance>>();
  const encodedMap: EncodedMap = new Map<string, string[]>();

  const res: DistAnalysis[] = [];

  for (let i = 0; i < texts.length; i++) {
    // create result holder
    const currentText = texts[i];
    const distAnalysis: DistAnalysis = {
      for: currentText,
      closestOnes: [],
      mostDifferent: null,
    };
    res.push(distAnalysis);

    // compute all distances
    const distances = new Map<Text, number>();
    for (let j = 0; j < texts.length; j++) {
      if (i != j) {
        // but with himself
        const dist = getDistancePourcentage(
          currentText.text,
          texts[j].text,
          maxAcceptableDistance,
          lang,
          cacheDistMap,
          encodedMap,
        );
        // console.log(dist);
        distances.set(texts[j], dist);
      }
    }

    // filter for result

    function findElementWithDistButNot(searchedDistance: number, not: Text[]): Text {
      let res: Text = null;
      distances.forEach((distance: number, text: Text) => {
        if (distance == searchedDistance && not.indexOf(text) == -1) {
          res = text;
        }
      });
      return res;
    }

    // get max
    const max = Math.max(...distances.values());
    distAnalysis.mostDifferent = {
      with: findElementWithDistButNot(max, []),
      difference: Math.round(max * 100) / 100,
    };

    // closest ones
    const distancesArray = Array.from(distances.values());
    distancesArray.sort((a, b) => a - b);
    const not = [];
    for (let j = 0; j < closestQty && j < distancesArray.length; j++) {
      const distance = distancesArray[j];
      if (distance >= maxAcceptableDistance) {
        break;
      }
      const closeOne: DistText = {
        difference: Math.round(distance * 100) / 100,
        with: findElementWithDistButNot(distance, not),
      };
      not.push(closeOne.with);
      distAnalysis.closestOnes.push(closeOne);
    }
  }

  return res;
}
