const germanOrdinals = [
  'erste',
  'zweite',
  'dritte',
  'vierte',
  'fünfte',
  'sechste',
  'siebte',
  'achte',
  'neunte',
  'zehnte',
  'elfte',
  'zwölfte',
  'dreizehnte',
  'vierzehnte',
  'fünfzehnte',
  'sechzehnte',
  'siebzehnte',
  'achtzehnte',
  'nehnzehnte',
  'zwanzigste',
  'einundzwanzigste',
  'zweiundzwanzigste',
  'dreiundzwanzigste',
  'vierundzwanzigste',
  'fünfundzwanzigste',
  'sechsundzwanzigste',
  'siebenundzwanzigste',
  'achtundzwanzigste',
  'neunundzwanzigste',
  'dreißigste'
];

export function getGermanOrdinal(val: number): string {
  if (val <= 30) {
    return germanOrdinals[val-1];
  } else {
      console.log('ERROR: German ordinal only works with <= 30');
      return val.toString();  
  }
}
