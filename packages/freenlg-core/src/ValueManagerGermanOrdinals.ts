export class GermanOrdinals {

  getOrdinal(val: number): string {
    if (val <= 100) {
      return this.germanOrdinals[val-1];
    } else {
        console.log('ERROR: ORDINAL_TEXTUAL in de_DE only works with <= 100');
        return val.toString();  
    }
  }

  readonly germanOrdinals = [
    'erstens', 
    'zweitens', 
    'drittens', 
    'viertens', 
    'fünftens', 
    'sechstens', 
    'siebtens', 
    'achtens', 
    'neuntens', 
    'zehntens', 
    'elftens', 
    'zwölftens', 
    'dreizehntens', 
    'vierzehntens', 
    'fünfzehntens', 
    'sechzehntens', 
    'siebzehntens', 
    'achtzehntens', 
    'neunzehntens', 
    'zwanzigstens', 
    'einundzwanzigstens', 
    'zweiundzwanzigstens', 
    'dreiundzwanzigstens', 
    'vierundzwanzigstens', 
    'fünfundzwanzigstens', 
    'sechstundzwanzigstens', 
    'siebenundzwanzigstens', 
    'achtundzwanzigstens', 
    'neunundzwanzigstens', 
    'dreizigstens', 
    'einunddreizigstens', 
    'vierzigstens', 
    'zweiundvierzigstens', 
    'fünfzigstens', 
    'dreiundfünfzigstens', 
    'sechzigstens', 
    'vierundsechzistens', 
    'siebzigstens', 
    'fünfundsiebzigstens', 
    'achtzigstens', 
    'sechsundachzigstens', 
    'neunzigstens', 
    'siebenundneunzigstens', 
    'hundertstens'
  ];

}