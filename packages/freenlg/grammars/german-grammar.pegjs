start =
  nominal_group:nominal_group extra_params:extra_params_block?
  {
    return Object.assign({}, nominal_group, extra_params);
  }

extra_params_block =
  [ ]+ extra_params:extra_params { return extra_params; }

extra_params =
  number_gender / gender_number

gender_number =
  gender:gender [ ]* number:number? { return Object.assign({}, gender, number); }

number_gender =
  number:number [ ]* gender:gender? { return Object.assign({}, gender, number); }

number =
  "S"i { return {'number':'S'}; }
  / "P"i { return {'number':'P'}; }

gender =
  "M"i { return {'gender':'M'}; }
  / "F"i { return {'gender':'F'}; }
  / "N"i { return {'gender':'N'}; }

nominal_group
  = det:determiner_block? after:after_det_block { return Object.assign({}, det, after); }

after_det_block
  = known_adjective_known_noun
  / known_adjective_unknown_noun
  / noun:known_noun {return noun; }

known_adjective_known_noun
  = adj:known_adjective [ ]+ noun:known_noun { return Object.assign({}, noun, adj); }

known_adjective_unknown_noun
  = adj:known_adjective [ ]+ noun:unknown_noun { return Object.assign({}, noun, adj); }

determiner_block
  = det:determiner [ ]+ { return {'det':det}; }

determiner
  = demonstrative { return "DEMONSTRATIVE"; } // en 1er car sont plus longs
  / definite { return "DEFINITE"; }
  /// indefinite { return "INDEFINITE"; }

definite
  = "der" / "die" / "das" / "den" / "des"

//indefinite
//  = "une" / "un" / "des"

demonstrative
  = "dieser" / "dieses" / "diesen" / "diese" // bien mettre dans cet ordre, le plus long d'abord

known_adjective
  //= adj:german_word { return {'adj':adj}; }
  = adj:german_word & {return options.dictHelper.isAdj(adj)} { return {'adj':options.dictHelper.getAdj(adj)}; }

known_noun
  = noun:german_word & {return options.dictHelper.isNoun(noun)} { return {'noun':options.dictHelper.getNoun(noun)}; }
  //= noun:german_word { return {'noun':noun}; }

unknown_noun
  = noun:german_word { return {'noun':noun, unknownNoun:true}; }


german_word // same as French + ß and no -
  = letters:[a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸß]+ { return letters.join(''); }

