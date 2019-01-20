{

}

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

nominal_group
  = det:determinant_block? after:after_det_block
  {
    return Object.assign({}, det, after);
  }

after_det_block
  = adjective_noun
  / noun_adjective
  / noun:noun {return {'noun':noun}; }

adjective_noun
  = adj:adjective [ ]+ noun:noun { return {'adj':adj, 'noun':noun, 'adjPos':'BEFORE'}; }

noun_adjective
  = noun:noun [ ]+ adj:adjective { return {'adj':adj, 'noun':noun, 'adjPos':'AFTER'}; }

determinant_block
  = det:determinant [ ]+ { return {'det':det}; }

determinant
  = definite { return "DEFINITE"; }
  / indefinite { return "INDEFINITE"; }
  / demonstrative { return "DEMONSTRATIVE"; }

definite
  = "les" / "le" / "la"

indefinite
  = "une" / "un" / "des"

demonstrative
  = "cette" / "cet" / "ce"  // bien mettre dans cet ordre, le plus long d'abord

adjective
  = adj:french_word & {return options.lefffHelper.isAdj(adj)} { return options.lefffHelper.getAdj(adj); }

noun
  = noun:french_word & {return options.lefffHelper.isNoun(noun)} { return options.lefffHelper.getNoun(noun); }

french_word
  = letters:[a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ\-]+ { return letters.join(''); }

