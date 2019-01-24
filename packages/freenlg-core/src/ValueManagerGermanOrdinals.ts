export class GermanOrdinals {

  getOrdinal(val: number): string {
    if (val <= 100) {
      return this.germanOrdinals[val-1];
    } else {
        console.log('ERROR: ORDINAL_TEXTUAL in de_DE only works with <= 30');
        return val.toString();  
    }
  }

  readonly germanOrdinals = [
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

}