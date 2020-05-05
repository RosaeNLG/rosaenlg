export interface EndingsSuffix {
  ar: EndingSuffix;
  ir: EndingSuffix;
  er: EndingSuffix;
}

export interface EndingSuffix {
  infinitive: string;
  gerund: string;
  'past participle': {
    singular: {
      masculine: string;
      feminine: string;
    };
    plural: {
      masculine: string;
      feminine: string;
    };
  };
  first: EndingsPerPerson;
  second: EndingsPerPerson;
  third: EndingsPerPerson;
}

export interface EndingsPerPerson {
  singular: EndingsPerPersonPerNumber;
  plural: EndingsPerPersonPerNumber;
}

export interface TuVos {
  tu: string;
  vos: string;
}

export interface EndingsPerPersonPerNumber {
  indicative: {
    present: string | TuVos;
    imperfect: string;
    preterite: string | TuVos;
    future: string;
  };
  subjunctive: {
    present: string | TuVos;
    'imperfect -ra': string;
    'imperfect -se': string;
    future: string;
  };
  conditional: string;
  imperative?:
    | string
    | {
        affirmative: string | TuVos;
        negative: string | TuVos;
      };
}

export const endingsSuffix: EndingsSuffix = {
  ar: {
    infinitive: 'ar',
    gerund: 'ando',
    'past participle': {
      singular: {
        masculine: 'ado',
        feminine: 'ada',
      },
      plural: {
        masculine: 'ados',
        feminine: 'adas',
      },
    },
    first: {
      singular: {
        indicative: {
          present: 'o',
          imperfect: 'aba',
          preterite: 'é',
          future: 'aré',
        },
        subjunctive: {
          present: 'e',
          'imperfect -ra': 'ara',
          'imperfect -se': 'ase',
          future: 'are',
        },
        conditional: 'aría',
      },
      plural: {
        indicative: {
          present: 'amos',
          imperfect: 'ábamos',
          preterite: 'amos',
          future: 'aremos',
        },
        subjunctive: {
          present: 'emos',
          'imperfect -ra': 'áramos',
          'imperfect -se': 'ásemos',
          future: 'áremos',
        },
        conditional: 'aríamos',
        imperative: 'emos',
      },
    },
    second: {
      singular: {
        indicative: {
          present: {
            tu: 'as',
            vos: 'ás',
          },
          imperfect: 'abas',
          preterite: 'aste',
          future: 'arás',
        },
        subjunctive: {
          present: {
            tu: 'es',
            vos: 'és',
          },
          'imperfect -ra': 'aras',
          'imperfect -se': 'ases',
          future: 'ares',
        },
        conditional: 'arías',
        imperative: {
          affirmative: {
            tu: 'a',
            vos: 'á',
          },
          negative: {
            tu: 'es',
            vos: 'és',
          },
        },
      },
      plural: {
        indicative: {
          present: 'áis',
          imperfect: 'abais',
          preterite: 'asteis',
          future: 'aréis',
        },
        subjunctive: {
          present: 'éis',
          'imperfect -ra': 'arais',
          'imperfect -se': 'aseis',
          future: 'areis',
        },
        conditional: 'aríais',
        imperative: {
          affirmative: 'ad',
          negative: 'éis',
        },
      },
    },
    third: {
      singular: {
        indicative: {
          present: 'a',
          imperfect: 'aba',
          preterite: 'ó',
          future: 'ará',
        },
        subjunctive: {
          present: 'e',
          'imperfect -ra': 'ara',
          'imperfect -se': 'ase',
          future: 'are',
        },
        conditional: 'aría',
        imperative: 'e',
      },
      plural: {
        indicative: {
          present: 'an',
          imperfect: 'aban',
          preterite: 'aron',
          future: 'arán',
        },
        subjunctive: {
          present: 'en',
          'imperfect -ra': 'aran',
          'imperfect -se': 'asen',
          future: 'aren',
        },
        conditional: 'arían',
        imperative: 'en',
      },
    },
  },
  ir: {
    infinitive: 'ir',
    gerund: 'iendo',
    'past participle': {
      singular: {
        masculine: 'ido',
        feminine: 'ida',
      },
      plural: {
        masculine: 'idos',
        feminine: 'idas',
      },
    },
    first: {
      singular: {
        indicative: {
          present: 'o',
          imperfect: 'ía',
          preterite: 'í',
          future: 'iré',
        },
        subjunctive: {
          present: 'a',
          'imperfect -ra': 'iera',
          'imperfect -se': 'iese',
          future: 'iere',
        },
        conditional: 'iría',
      },
      plural: {
        indicative: {
          present: 'imos',
          imperfect: 'íamos',
          preterite: 'imos',
          future: 'iremos',
        },
        subjunctive: {
          present: 'amos',
          'imperfect -ra': 'iéramos',
          'imperfect -se': 'iésemos',
          future: 'iéremos',
        },
        conditional: 'iríamos',
        imperative: 'amos',
      },
    },
    second: {
      singular: {
        indicative: {
          present: {
            tu: 'es',
            vos: 'ís',
          },
          imperfect: 'ías',
          preterite: {
            tu: 'iste',
            vos: 'istes',
          },
          future: 'irás',
        },
        subjunctive: {
          present: {
            tu: 'as',
            vos: 'ás',
          },
          'imperfect -ra': 'ieras',
          'imperfect -se': 'ieses',
          future: 'ieres',
        },
        conditional: 'irías',
        imperative: {
          affirmative: {
            tu: 'e',
            vos: 'í',
          },
          negative: {
            tu: 'as',
            vos: 'ás',
          },
        },
      },
      plural: {
        indicative: {
          present: 'ís',
          imperfect: 'íais',
          preterite: 'isteis',
          future: 'iréis',
        },
        subjunctive: {
          present: 'áis',
          'imperfect -ra': 'ierais',
          'imperfect -se': 'ieseis',
          future: 'iereis',
        },
        conditional: 'iríais',
        imperative: {
          affirmative: 'id',
          negative: 'áis',
        },
      },
    },
    third: {
      singular: {
        indicative: {
          present: 'e',
          imperfect: 'ía',
          preterite: 'ió',
          future: 'irá',
        },
        subjunctive: {
          present: 'a',
          'imperfect -ra': 'iera',
          'imperfect -se': 'iese',
          future: 'iere',
        },
        conditional: 'iría',
        imperative: 'a',
      },
      plural: {
        indicative: {
          present: 'en',
          imperfect: 'ían',
          preterite: 'ieron',
          future: 'irán',
        },
        subjunctive: {
          present: 'an',
          'imperfect -ra': 'ieran',
          'imperfect -se': 'iesen',
          future: 'ieren',
        },
        conditional: 'irían',
        imperative: 'an',
      },
    },
  },
  er: {
    infinitive: 'er',
    gerund: 'iendo',
    'past participle': {
      singular: {
        masculine: 'ido',
        feminine: 'ida',
      },
      plural: {
        masculine: 'idos',
        feminine: 'idas',
      },
    },
    first: {
      singular: {
        indicative: {
          present: 'o',
          imperfect: 'ía',
          preterite: 'í',
          future: 'eré',
        },
        subjunctive: {
          present: 'a',
          'imperfect -ra': 'iera',
          'imperfect -se': 'iese',
          future: 'iere',
        },
        conditional: 'ería',
      },
      plural: {
        indicative: {
          present: 'emos',
          imperfect: 'íamos',
          preterite: 'imos',
          future: 'eremos',
        },
        subjunctive: {
          present: 'amos',
          'imperfect -ra': 'iéramos',
          'imperfect -se': 'iésemos',
          future: 'iéremos',
        },
        conditional: 'eríamos',
        imperative: 'amos',
      },
    },
    second: {
      singular: {
        indicative: {
          present: {
            tu: 'es',
            vos: 'és',
          },
          imperfect: 'ías',
          preterite: {
            tu: 'iste',
            vos: 'istes',
          },
          future: 'erás',
        },
        subjunctive: {
          present: {
            tu: 'as',
            vos: 'ás',
          },
          'imperfect -ra': 'ieras',
          'imperfect -se': 'ieses',
          future: 'ieres',
        },
        conditional: 'erías',
        imperative: {
          affirmative: {
            tu: 'e',
            vos: 'é',
          },
          negative: {
            tu: 'as',
            vos: 'ás',
          },
        },
      },
      plural: {
        indicative: {
          present: 'éis',
          imperfect: 'íais',
          preterite: 'isteis',
          future: 'eréis',
        },
        subjunctive: {
          present: 'áis',
          'imperfect -ra': 'ierais',
          'imperfect -se': 'ieseis',
          future: 'iereis',
        },
        conditional: 'eríais',
        imperative: {
          affirmative: 'ed',
          negative: 'áis',
        },
      },
    },
    third: {
      singular: {
        indicative: {
          present: 'e',
          imperfect: 'ía',
          preterite: 'ió',
          future: 'erá',
        },
        subjunctive: {
          present: 'a',
          'imperfect -ra': 'iera',
          'imperfect -se': 'iese',
          future: 'iere',
        },
        conditional: 'ería',
        imperative: 'a',
      },
      plural: {
        indicative: {
          present: 'en',
          imperfect: 'ían',
          preterite: 'ieron',
          future: 'erán',
        },
        subjunctive: {
          present: 'an',
          'imperfect -ra': 'ieran',
          'imperfect -se': 'iesen',
          future: 'ieren',
        },
        conditional: 'erían',
        imperative: 'an',
      },
    },
  },
};

export interface EndingsAuxPersonNumber {
  indicative: {
    perfect: string;
    pluperfect: string;
    'future perfect': string;
    'preterite perfect': string;
  };
  subjunctive: {
    perfect: string;
    pluperfect: string;
    'future perfect': string;
  };
  conditional: {
    perfect: string;
  };
}

export interface EndingsAuxPerson {
  singular: EndingsAuxPersonNumber;
  plural: EndingsAuxPersonNumber;
}

export interface EndingsAux {
  first: EndingsAuxPerson;
  second: EndingsAuxPerson;
  third: EndingsAuxPerson;
}

export const endingsAux: EndingsAux = {
  first: {
    singular: {
      indicative: {
        perfect: 'he',
        pluperfect: 'había',
        'future perfect': 'habré',
        'preterite perfect': 'hube',
      },
      subjunctive: {
        perfect: 'haya',
        pluperfect: 'hubiera',
        'future perfect': 'hubiere',
      },
      conditional: {
        perfect: 'habría',
      },
    },
    plural: {
      indicative: {
        perfect: 'hemos',
        pluperfect: 'habíamos',
        'future perfect': 'habremos',
        'preterite perfect': 'hubimos',
      },
      subjunctive: {
        perfect: 'hayamos',
        pluperfect: 'hubiéramos',
        'future perfect': 'hubiéremos',
      },
      conditional: {
        perfect: 'habríamos',
      },
    },
  },
  second: {
    singular: {
      indicative: {
        perfect: 'has',
        pluperfect: 'habías',
        'future perfect': 'habrás',
        'preterite perfect': 'hubiste',
      },
      subjunctive: {
        perfect: 'hayas',
        pluperfect: 'hubieras',
        'future perfect': 'hubieres',
      },
      conditional: {
        perfect: 'habrías',
      },
    },
    plural: {
      indicative: {
        perfect: 'habéis',
        pluperfect: 'habíais',
        'future perfect': 'habréis',
        'preterite perfect': 'hubisteis',
      },
      subjunctive: {
        perfect: 'hayáis',
        pluperfect: 'hubierais',
        'future perfect': 'hubiereis',
      },
      conditional: {
        perfect: 'habríais',
      },
    },
  },
  third: {
    singular: {
      indicative: {
        perfect: 'ha',
        pluperfect: 'había',
        'future perfect': 'habrá',
        'preterite perfect': 'hubo',
      },
      subjunctive: {
        perfect: 'haya',
        pluperfect: 'hubiera',
        'future perfect': 'hubiere',
      },
      conditional: {
        perfect: 'habría',
      },
    },
    plural: {
      indicative: {
        perfect: 'han',
        pluperfect: 'habían',
        'future perfect': 'habrán',
        'preterite perfect': 'hubieron',
      },
      subjunctive: {
        perfect: 'hayan',
        pluperfect: 'hubieran',
        'future perfect': 'hubieren',
      },
      conditional: {
        perfect: 'habrían',
      },
    },
  },
};
