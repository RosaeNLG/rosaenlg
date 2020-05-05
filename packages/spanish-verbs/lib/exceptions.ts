import { Mood, Tense, Positivity, NumberSP, Person } from './interfaces';

type Exceptions = {
  [key: string]: ExceptionWithGerund;
};
type Exception = {
  [key in Mood]?: ExceptionMood | ExceptionMoodImp;
};
type ExceptionWithGerund = Exception & {
  gerund?: string;
  'past participle'?: string;
};

type ExceptionMood = {
  [key in Tense]?: ExceptionTense;
};
type ExceptionTense = {
  [key in NumberSP]?: ExceptionPerson;
};
type ExceptionPerson = {
  [key in Person]?: string;
};
type ExceptionMoodImp = {
  [key in Positivity]?: ExceptionTense;
};

export const exceptions: Exceptions = {
  estar: {
    indicative: {
      present: {
        singular: {
          first: 'estoy',
          second: 'estás',
          third: 'está',
        },
        plural: {
          third: 'están',
        },
      },
      preterite: {
        singular: {
          first: 'estuve',
          second: 'estuviste',
          third: 'estuvo',
        },
        plural: {
          first: 'estuvimos',
          second: 'estuvisteis',
          third: 'estuvieron',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'esté',
          second: 'estés',
          third: 'esté',
        },
        plural: {
          third: 'estén',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'estuviera',
          second: 'estuvieras',
          third: 'estuviera',
        },
        plural: {
          first: 'estuviéramos',
          second: 'estuvierais',
          third: 'estuvieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'estuviese',
          second: 'estuvieses',
          third: 'estuviese',
        },
        plural: {
          first: 'estuviésemos',
          second: 'estuvieseis',
          third: 'estuviesen',
        },
      },
      future: {
        singular: {
          first: 'estuviere',
          second: 'estuvieres',
          third: 'estuviere',
        },
        plural: {
          first: 'estuviéremos',
          second: 'estuviereis',
          third: 'estuvieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'está',
          third: 'esté',
        },
        plural: {
          third: 'estén',
        },
      },
      negative: {
        singular: {
          second: 'estés',
          third: 'esté',
        },
        plural: {
          third: 'estén',
        },
      },
    },
  },

  ser: {
    indicative: {
      present: {
        singular: {
          first: 'soy',
          second: 'eres',
          third: 'es',
        },
        plural: {
          first: 'somos',
          second: 'sois',
          third: 'son',
        },
      },
      preterite: {
        singular: {
          first: 'fui',
          second: 'fuiste',
          third: 'fue',
        },
        plural: {
          first: 'fuimos',
          second: 'fuisteis',
          third: 'fueron',
        },
      },
      imperfect: {
        singular: {
          first: 'era',
          second: 'eras',
          third: 'era',
        },
        plural: {
          first: 'éramos',
          second: 'erais',
          third: 'eran',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'sea',
          second: 'seas',
          third: 'sea',
        },
        plural: {
          first: 'seamos',
          second: 'seáis',
          third: 'sean',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'fuera',
          second: 'fueras',
          third: 'fuera',
        },
        plural: {
          first: 'fuéramos',
          second: 'fuéramos',
          third: 'fueran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'fuese',
          second: 'fueses',
          third: 'fuese',
        },
        plural: {
          first: 'fuésemos',
          second: 'fueseis',
          third: 'fuesen',
        },
      },
      future: {
        singular: {
          first: 'fuere',
          second: 'fueres',
          third: 'fuere',
        },
        plural: {
          first: 'fuéremos',
          second: 'fuereis',
          third: 'fueren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'sé',
          third: 'sea',
        },
        plural: {
          first: 'seamos',
          second: 'sed',
          third: 'sean',
        },
      },
      negative: {
        singular: {
          second: 'seas',
          third: 'sea',
        },
        plural: {
          first: 'seamos',
          second: 'seáis',
          third: 'sean',
        },
      },
    },
  },

  haber: {
    indicative: {
      present: {
        singular: {
          first: 'he',
          second: 'has',
          third: 'hay',
        },
        plural: {
          first: 'hemos',
          third: 'han',
        },
      },
      preterite: {
        singular: {
          first: 'hube',
          second: 'hubiste',
          third: 'hubo',
        },
        plural: {
          first: 'hubimos',
          second: 'hubisteis',
          third: 'hubieron',
        },
      },
      future: {
        singular: {
          first: 'habré',
          second: 'habrás',
          third: 'habrá',
        },
        plural: {
          first: 'habremos',
          second: 'habréis',
          third: 'habrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'haya',
          second: 'hayas',
          third: 'haya',
        },
        plural: {
          first: 'hayamos',
          second: 'hayáis',
          third: 'hayan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'hubiera',
          second: 'hubieras',
          third: 'hubiera',
        },
        plural: {
          first: 'hubiéramos',
          second: 'hubierais',
          third: 'hubieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'hubiese',
          second: 'hubieses',
          third: 'hubiese',
        },
        plural: {
          first: 'hubiésemos',
          second: 'hubieseis',
          third: 'hubiesen',
        },
      },
      future: {
        singular: {
          first: 'hubiere',
          second: 'hubieres',
          third: 'hubiere',
        },
        plural: {
          first: 'hubiéremos',
          second: 'hubiereis',
          third: 'hubieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'he',
          third: 'haya',
        },
        plural: {
          first: 'hayamos',
          second: 'habed',
          third: 'hayan',
        },
      },
      negative: {
        singular: {
          second: 'hayes',
          third: 'haya',
        },
        plural: {
          first: 'hayamos',
          second: 'hayáis',
          third: 'hayan',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'habría',
          second: 'habrías',
          third: 'habría',
        },
        plural: {
          first: 'habríamos',
          second: 'habríais',
          third: 'habrían',
        },
      },
      future: {
        singular: {
          first: 'habré',
          second: 'habrás',
          third: 'habrá',
        },
        plural: {
          first: 'habremos',
          second: 'habréis',
          third: 'habrán',
        },
      },
    },
  },

  tener: {
    indicative: {
      present: {
        singular: {
          first: 'tengo',
          second: 'tienes',
          third: 'tiene',
        },
        plural: {
          third: 'tienen',
        },
      },
      preterite: {
        singular: {
          first: 'tuve',
          second: 'tuviste',
          third: 'tuvo',
        },
        plural: {
          first: 'tuvimos',
          second: 'tuvisteis',
          third: 'tuvieron',
        },
      },
      future: {
        singular: {
          first: 'tendré',
          second: 'tendrás',
          third: 'tendrá',
        },
        plural: {
          first: 'tendremos',
          second: 'tendréis',
          third: 'tendrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'tenga',
          second: 'tengas',
          third: 'tenga',
        },
        plural: {
          first: 'tengamos',
          second: 'tengáis',
          third: 'tengan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'tuviera',
          second: 'tuvieras',
          third: 'tuviera',
        },
        plural: {
          first: 'tuviéramos',
          second: 'tuvierais',
          third: 'tuvieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'tuviese',
          second: 'tuvieses',
          third: 'tuviese',
        },
        plural: {
          first: 'tuviésemos',
          second: 'tuvieseis',
          third: 'tuviesen',
        },
      },
      future: {
        singular: {
          first: 'tuviere',
          second: 'tuvieres',
          third: 'tuviere',
        },
        plural: {
          first: 'tuviéremos',
          second: 'tuviereis',
          third: 'tuvieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'tendría',
          second: 'tendrías',
          third: 'tendría',
        },
        plural: {
          first: 'tendríamos',
          second: 'tendríais',
          third: 'tendrían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'ten',
          third: 'tenga',
        },
        plural: {
          first: 'tengamos',
          third: 'tengan',
        },
      },
      negative: {
        singular: {
          second: 'tengas',
          third: 'tenga',
        },
        plural: {
          first: 'tengamos',
          second: 'tengáis',
          third: 'tengan',
        },
      },
    },
  },

  poder: {
    indicative: {
      present: {
        singular: {
          first: 'puedo',
          second: 'puedes',
          third: 'puede',
        },
        plural: {
          third: 'pueden',
        },
      },
      preterite: {
        singular: {
          first: 'pude',
          second: 'pudiste',
          third: 'pudo',
        },
        plural: {
          first: 'pudimos',
          second: 'pudisteis',
          third: 'pudieron',
        },
      },
      future: {
        singular: {
          first: 'podré',
          second: 'podrás',
          third: 'podrá',
        },
        plural: {
          first: 'podremos',
          second: 'podréis',
          third: 'podrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'pueda',
          second: 'puedas',
          third: 'pueda',
        },
        plural: {
          third: 'puedan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'pudiera',
          second: 'pudieras',
          third: 'pudiera',
        },
        plural: {
          first: 'pudiéramos',
          second: 'pudierais',
          third: 'pudieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'pudiese',
          second: 'pudieses',
          third: 'pudiese',
        },
        plural: {
          first: 'pudiésemos',
          second: 'pudieseis',
          third: 'pudiesen',
        },
      },
      future: {
        singular: {
          first: 'pudiere',
          second: 'pudieres',
          third: 'pudiere',
        },
        plural: {
          first: 'pudiéremos',
          second: 'pudiereis',
          third: 'pudieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'podría',
          second: 'podrías',
          third: 'podría',
        },
        plural: {
          first: 'podríamos',
          second: 'podríais',
          third: 'podrían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'puede',
          third: 'pueda',
        },
        plural: {
          third: 'puedan',
        },
      },
      negative: {
        singular: {
          second: 'puedas',
          third: 'pueda',
        },
        plural: {
          third: 'puedan',
        },
      },
    },
  },

  ir: {
    gerund: 'yendo',
    indicative: {
      present: {
        singular: {
          first: 'voy',
          second: 'vas',
          third: 'va',
        },
        plural: {
          first: 'vamos',
          second: 'vais',
          third: 'van',
        },
      },
      preterite: {
        singular: {
          first: 'fui',
          second: 'fuiste',
          third: 'fue',
        },
        plural: {
          first: 'fuimos',
          second: 'fuisteis',
          third: 'fueron',
        },
      },
      imperfect: {
        singular: {
          first: 'iba',
          second: 'ibas',
          third: 'iba',
        },
        plural: {
          first: 'íbamos',
          second: 'ibais',
          third: 'iban',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'vaya',
          second: 'vayas',
          third: 'vaya',
        },
        plural: {
          first: 'vayamos',
          second: 'vayáis',
          third: 'vayan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'fuera',
          second: 'fueras',
          third: 'fuera',
        },
        plural: {
          first: 'fuéramos',
          second: 'fuerais',
          third: 'fueran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'fuese',
          second: 'fueses',
          third: 'fuese',
        },
        plural: {
          first: 'fuésemos',
          second: 'fueseis',
          third: 'fuesen',
        },
      },
      future: {
        singular: {
          first: 'fuere',
          second: 'fueres',
          third: 'fuere',
        },
        plural: {
          first: 'fuéremos',
          second: 'fuereis',
          third: 'fueren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 've',
          third: 'vaya',
        },
        plural: {
          first: 'vayamos',
          third: 'vayan',
        },
      },
      negative: {
        singular: {
          second: 'vayas',
          third: 'vaya',
        },
        plural: {
          first: 'vayamos',
          second: 'vayáis',
          third: 'vayan',
        },
      },
    },
  },

  dar: {
    indicative: {
      present: {
        singular: {
          first: 'doy',
        },
        plural: {
          second: 'dais',
        },
      },
      preterite: {
        singular: {
          first: 'di',
          second: 'diste',
          third: 'dio',
        },
        plural: {
          first: 'dimos',
          second: 'disteis',
          third: 'dieron',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'dé',
          third: 'dé',
        },
        plural: {
          second: 'deis',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'diera',
          second: 'dieras',
          third: 'diera',
        },
        plural: {
          first: 'diéramos',
          second: 'dierais',
          third: 'dieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'diese',
          second: 'dieses',
          third: 'diese',
        },
        plural: {
          first: 'diésemos',
          second: 'dieseis',
          third: 'diesen',
        },
      },
      future: {
        singular: {
          first: 'diere',
          second: 'dieres',
          third: 'diere',
        },
        plural: {
          first: 'diéremos',
          second: 'diereis',
          third: 'dieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          third: 'dé',
        },
      },
      negative: {
        singular: {
          third: 'dé',
        },
        plural: {
          second: 'deis',
        },
      },
    },
  },

  saber: {
    indicative: {
      present: {
        singular: {
          first: 'sé',
        },
      },
      preterite: {
        singular: {
          first: 'supe',
          second: 'supiste',
          third: 'supo',
        },
        plural: {
          first: 'supimos',
          second: 'supisteis',
          third: 'supieron',
        },
      },
      future: {
        singular: {
          first: 'sabré',
          second: 'sabrás',
          third: 'sabrá',
        },
        plural: {
          first: 'sabremos',
          second: 'sabréis',
          third: 'sabrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'sepa',
          second: 'sepas',
          third: 'sepa',
        },
        plural: {
          first: 'sepamos',
          second: 'sepáis',
          third: 'sepan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'supiera',
          second: 'supieras',
          third: 'supiera',
        },
        plural: {
          first: 'supiéramos',
          second: 'supierais',
          third: 'supieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'supiese',
          second: 'supieses',
          third: 'supiese',
        },
        plural: {
          first: 'supiésemos',
          second: 'supieseis',
          third: 'supiesen',
        },
      },
      future: {
        singular: {
          first: 'supiere',
          second: 'supieres',
          third: 'supiere',
        },
        plural: {
          first: 'supiéremos',
          second: 'supiereis',
          third: 'supieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'sabría',
          second: 'sabrías',
          third: 'sabría',
        },
        plural: {
          first: 'sabríamos',
          second: 'sabríais',
          third: 'sabrían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          third: 'sepa',
        },
        plural: {
          first: 'sepamos',
          third: 'sepan',
        },
      },
      negative: {
        singular: {
          second: 'sepas',
          third: 'sepa',
        },
        plural: {
          first: 'sepamos',
          second: 'sepáis',
          third: 'sepan',
        },
      },
    },
  },

  querer: {
    indicative: {
      present: {
        singular: {
          first: 'quiero',
          second: 'quieres',
          third: 'quiere',
        },
        plural: {
          third: 'quieren',
        },
      },
      preterite: {
        singular: {
          first: 'quise',
          second: 'quisiste',
          third: 'quiso',
        },
        plural: {
          first: 'quisimos',
          second: 'quisisteis',
          third: 'quisieron',
        },
      },
      future: {
        singular: {
          first: 'querré',
          second: 'querrás',
          third: 'querrá',
        },
        plural: {
          first: 'querremos',
          second: 'querréis',
          third: 'querrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'quiera',
          second: 'quieras',
          third: 'quiera',
        },
        plural: {
          third: 'quieran',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'quisiera',
          second: 'quisieras',
          third: 'quisiera',
        },
        plural: {
          first: 'quisiéramos',
          second: 'quisierais',
          third: 'quisieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'quisiese',
          second: 'quisieses',
          third: 'quisiese',
        },
        plural: {
          first: 'quisiésemos',
          second: 'quisieseis',
          third: 'quisiesen',
        },
      },
      future: {
        singular: {
          first: 'quisiere',
          second: 'quisieres',
          third: 'quisiere',
        },
        plural: {
          first: 'quisiéremos',
          second: 'quisiereis',
          third: 'quisieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'querría',
          second: 'querrías',
          third: 'querría',
        },
        plural: {
          first: 'querríamos',
          second: 'querríais',
          third: 'querrían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'quiere',
          third: 'quiera',
        },
        plural: {
          third: 'quieran',
        },
      },
      negative: {
        singular: {
          second: 'quieras',
          third: 'quiera',
        },
        plural: {
          third: 'quieran',
        },
      },
    },
  },

  creer: {
    'past participle': 'creido',
    gerund: 'creyendo',
    indicative: {
      preterite: {
        singular: {
          third: 'creyó',
        },
        plural: {
          third: 'creyeron',
        },
      },
    },
    subjunctive: {
      'imperfect -ra': {
        singular: {
          first: 'creyera',
          second: 'creyeras',
          third: 'creyera',
        },
        plural: {
          first: 'creyéramos',
          second: 'creyerais',
          third: 'creyeran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'creyese',
          second: 'creyeses',
          third: 'creyese',
        },
        plural: {
          first: 'creyésemos',
          second: 'creyeseis',
          third: 'creyesen',
        },
      },
      future: {
        singular: {
          first: 'creyere',
          second: 'creyeres',
          third: 'creyere',
        },
        plural: {
          first: 'creyéremos',
          second: 'creyereis',
          third: 'creyeren',
        },
      },
    },
  },

  seguir: {
    indicative: {
      present: {
        singular: {
          first: 'sigo',
          second: 'sigues',
          third: 'sigue',
        },
        plural: {
          third: 'siguen',
        },
      },
      preterite: {
        singular: {
          third: 'siguió',
        },
        plural: {
          third: 'siguieron',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'siga',
          second: 'sigas',
          third: 'siga',
        },
        plural: {
          third: 'sigan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'siguiera',
          second: 'siguieras',
          third: 'siguiera',
        },
        plural: {
          first: 'siguiéramos',
          second: 'siguierais',
          third: 'siguieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'siguiese',
          second: 'siguieses',
          third: 'siguiese',
        },
        plural: {
          first: 'siguiésemos',
          second: 'siguieseis',
          third: 'siguiesen',
        },
      },
      future: {
        singular: {
          first: 'siguiere',
          second: 'siguieres',
          third: 'siguiere',
        },
        plural: {
          first: 'siguiéremos',
          second: 'siguiereis',
          third: 'siguieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'sigue',
          third: 'siga',
        },
        plural: {
          first: 'sigamos',
          third: 'sigan',
        },
      },
      negative: {
        singular: {
          second: 'sigas',
          third: 'siga',
        },
        plural: {
          first: 'sigamos',
          second: 'sigáis',
          third: 'sigan',
        },
      },
    },
  },

  conseguir: {
    indicative: {
      present: {
        singular: {
          first: 'consigo',
          second: 'consigues',
          third: 'consigue',
        },
        plural: {
          third: 'consiguen',
        },
      },
      preterite: {
        singular: {
          third: 'consiguió',
        },
        plural: {
          third: 'consiguieron',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'consiga',
          second: 'consigas',
          third: 'consiga',
        },
        plural: {
          third: 'consigan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'consiguiera',
          second: 'consiguieras',
          third: 'consiguiera',
        },
        plural: {
          first: 'consiguiéramos',
          second: 'consiguierais',
          third: 'consiguieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'consiguiese',
          second: 'consiguieses',
          third: 'consiguiese',
        },
        plural: {
          first: 'consiguiésemos',
          second: 'consiguieseis',
          third: 'consiguiesen',
        },
      },
      future: {
        singular: {
          first: 'consiguiere',
          second: 'consiguieres',
          third: 'consiguiere',
        },
        plural: {
          first: 'consiguiéremos',
          second: 'consiguiereis',
          third: 'consiguieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'consigue',
          third: 'consiga',
        },
        plural: {
          first: 'consigamos',
          third: 'consigan',
        },
      },
      negative: {
        singular: {
          second: 'consigas',
          third: 'consiga',
        },
        plural: {
          first: 'consigamos',
          second: 'consigáis',
          third: 'consigan',
        },
      },
    },
  },

  abrir: {
    'past participle': 'abierto',
  },
  cubrir: {
    'past participle': 'cubierto',
  },
  decir: {
    'past participle': 'dicho',
    gerund: 'diciendo',
    indicative: {
      present: {
        singular: {
          first: 'digo',
          second: 'dices',
          third: 'dice',
        },
        plural: {
          third: 'dicen',
        },
      },
      preterite: {
        singular: {
          first: 'dije',
          second: 'dijiste',
          third: 'dijo',
        },
        plural: {
          first: 'dijimos',
          second: 'dijisteis',
          third: 'dijeron',
        },
      },
      future: {
        singular: {
          first: 'diré',
          second: 'dirás',
          third: 'dirá',
        },
        plural: {
          first: 'diremos',
          second: 'diréis',
          third: 'dirán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'diga',
          second: 'digas',
          third: 'diga',
        },
        plural: {
          first: 'digamos',
          second: 'digáis',
          third: 'digan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'dijera',
          second: 'dijeras',
          third: 'dijera',
        },
        plural: {
          first: 'dijéramos',
          second: 'dijerais',
          third: 'dijeran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'dijese',
          second: 'dijeses',
          third: 'dijese',
        },
        plural: {
          first: 'dijésemos',
          second: 'dijeseis',
          third: 'dijesen',
        },
      },
      future: {
        singular: {
          first: 'dijere',
          second: 'dijeres',
          third: 'dijere',
        },
        plural: {
          first: 'dijéremos',
          second: 'dijereis',
          third: 'dijeren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'diría',
          second: 'dirías',
          third: 'diría',
        },
        plural: {
          first: 'diríamos',
          second: 'diríais',
          third: 'dirían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'di',
          third: 'diga',
        },
        plural: {
          first: 'digamos',
          third: 'digan',
        },
      },
      negative: {
        singular: {
          second: 'digas',
          third: 'diga',
        },
        plural: {
          first: 'digamos',
          second: 'digáis',
          third: 'digan',
        },
      },
    },
  },
  escribir: {
    'past participle': 'escrito',
  },
  hacer: {
    'past participle': 'hecho',
    indicative: {
      present: {
        singular: {
          first: 'hago',
        },
      },
      preterite: {
        singular: {
          first: 'hice',
          second: 'hiciste',
          third: 'hizo',
        },
        plural: {
          first: 'hicimos',
          second: 'hicisteis',
          third: 'hicieron',
        },
      },
      future: {
        singular: {
          first: 'haré',
          second: 'harás',
          third: 'hará',
        },
        plural: {
          first: 'haremos',
          second: 'haréis',
          third: 'harán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'haga',
          second: 'hagas',
          third: 'haga',
        },
        plural: {
          first: 'tengamos',
          second: 'tengáis',
          third: 'tengan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'hiciera',
          second: 'hicieras',
          third: 'hiciera',
        },
        plural: {
          first: 'hiciéramos',
          second: 'hicierais',
          third: 'hicieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'hiciese',
          second: 'hicieses',
          third: 'hiciese',
        },
        plural: {
          first: 'hiciésemos',
          second: 'hicieseis',
          third: 'hiciesen',
        },
      },
      future: {
        singular: {
          first: 'hiciere',
          second: 'hicieres',
          third: 'hiciere',
        },
        plural: {
          first: 'hiciéremos',
          second: 'hiciereis',
          third: 'hicieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'haría',
          second: 'harías',
          third: 'haría',
        },
        plural: {
          first: 'haríamos',
          second: 'haríais',
          third: 'harían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'haz',
          third: 'haga',
        },
        plural: {
          first: 'hagamos',
          third: 'hagan',
        },
      },
      negative: {
        singular: {
          second: 'hagas',
          third: 'haga',
        },
        plural: {
          first: 'hagamos',
          second: 'hagáis',
          third: 'hagan',
        },
      },
    },
  },
  morir: {
    'past participle': 'muerto',
  },
  poner: {
    'past participle': 'puesto',
    indicative: {
      present: {
        singular: {
          first: 'pongo',
        },
      },
      preterite: {
        singular: {
          first: 'puse',
          second: 'pusiste',
          third: 'puso',
        },
        plural: {
          first: 'pusimos',
          second: 'pusisteis',
          third: 'pusieron',
        },
      },
      future: {
        singular: {
          first: 'pondré',
          second: 'pondrás',
          third: 'pondrá',
        },
        plural: {
          first: 'pondremos',
          second: 'pondréis',
          third: 'pondrán',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'ponga',
          second: 'pongas',
          third: 'ponga',
        },
        plural: {
          first: 'pongamos',
          second: 'pongáis',
          third: 'pongan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'pusiera',
          second: 'pusieras',
          third: 'pusiera',
        },
        plural: {
          first: 'pusiéramos',
          second: 'pusierais',
          third: 'pusieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'pusiese',
          second: 'pusieses',
          third: 'pusiese',
        },
        plural: {
          first: 'pusiésemos',
          second: 'pusieseis',
          third: 'pusiesen',
        },
      },
      future: {
        singular: {
          first: 'pusiere',
          second: 'pusieres',
          third: 'pusiere',
        },
        plural: {
          first: 'pusiéremos',
          second: 'pusiereis',
          third: 'pusieren',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'pondría',
          second: 'pondrías',
          third: 'pondría',
        },
        plural: {
          first: 'pondríamos',
          second: 'pondríais',
          third: 'pondrían',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'pon',
          third: 'ponga',
        },
        plural: {
          first: 'pongamos',
          third: 'pongan',
        },
      },
      negative: {
        singular: {
          second: 'pongas',
          third: 'ponga',
        },
        plural: {
          first: 'pongamos',
          second: 'pongáis',
          third: 'pongan',
        },
      },
    },
  },
  romper: {
    'past participle': 'roto',
  },
  ver: {
    'past participle': 'visto',
    indicative: {
      present: {
        singular: {
          first: 'veo',
        },
        plural: {
          second: 'veis',
        },
      },
      preterite: {
        singular: {
          first: 'vi',
          third: 'vio',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'vea',
          second: 'veas',
          third: 'vea',
        },
        plural: {
          first: 'veamos',
          second: 'veáis',
          third: 'vean',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          third: 'vea',
        },
        plural: {
          first: 'veamos',
        },
      },
      negative: {
        singular: {
          second: 'veas',
          third: 'vea',
        },
        plural: {
          first: 'veamos',
          second: 'veáis',
          third: 'vean',
        },
      },
    },
  },
  pudrir: {
    'past participle': 'podrido',
  },
  volver: {
    'past participle': 'vuelto',
  },
  producir: {
    indicative: {
      preterite: {
        singular: {
          first: 'produje',
          third: 'produjo',
        },
      },
    },
  },
  conducir: {
    indicative: {
      preterite: {
        singular: {
          third: 'condujo',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          third: 'conduzca',
        },
      },
      future: {
        singular: {
          third: 'condujere',
        },
      },
      imperfect: {
        singular: {
          third: 'condujese',
        },
      },
    },
  },

  venir: {
    indicative: {
      present: {
        singular: {
          first: 'vengo',
          second: 'vienes',
          third: 'viene',
        },
        plural: {
          third: 'vienen',
        },
      },
      preterite: {
        singular: {
          first: 'vine',
          second: 'viniste',
          third: 'vino',
        },
        plural: {
          first: 'vinimos',
          second: 'vinisteis',
          third: 'vinieron',
        },
      },
    },
    conditional: {
      present: {
        singular: {
          first: 'vendría',
          second: 'vendrías',
          third: 'vendría',
        },
        plural: {
          first: 'vendríamos',
          second: 'vendríais',
          third: 'vendrían',
        },
      },
    },
    subjunctive: {
      present: {
        singular: {
          first: 'venga',
          second: 'vengas',
          third: 'venga',
        },
        plural: {
          first: 'vengamos',
          second: 'vengáis',
          third: 'vengan',
        },
      },
      'imperfect -ra': {
        singular: {
          first: 'viniera',
          second: 'vinieras',
          third: 'viniera',
        },
        plural: {
          first: 'viniéramos',
          second: 'vinierais',
          third: 'vinieran',
        },
      },
      'imperfect -se': {
        singular: {
          first: 'viniese',
          second: 'vinieses',
          third: 'viniese',
        },
        plural: {
          first: 'viniésemos',
          second: 'vinieseis',
          third: 'viniesen',
        },
      },
      future: {
        singular: {
          first: 'viniere',
          second: 'vinieres',
          third: 'viniere',
        },
        plural: {
          first: 'viniéremos',
          second: 'viniereis',
          third: 'vinieren',
        },
      },
    },
    imperative: {
      affirmative: {
        singular: {
          second: 'ven',
          third: 'venga',
        },
        plural: {
          first: 'vengamos',
          third: 'vengan',
        },
      },
      negative: {
        singular: {
          second: 'venga',
          third: 'vengamos',
        },
        plural: {
          second: 'vengáis',
          third: 'vengan',
        },
      },
    },
  },
};
