// Copyright 2019 Ludan Stoecklé
// SPDX-License-Identifier: Apache-2.0

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
  = det:determiner_block? after:after_det_block { return Object.assign({}, det, after); }

after_det_block
  = known_adjective_known_noun
  / known_noun_known_adjective
  / known_adjective_unknown_noun
  / noun:known_noun {return noun; }

known_adjective_known_noun
  = adj:known_adjective [ ]+ noun:known_noun { return Object.assign({}, noun, adj, {'adjPos':'BEFORE'} ); }

known_noun_known_adjective
  = noun:known_noun [ ]+ adj:known_adjective { return Object.assign({}, noun, adj, {'adjPos':'AFTER'} ); }

known_adjective_unknown_noun
  = adj:known_adjective [ ]+ noun:unknown_noun { return Object.assign({}, noun, adj, {'adjPos':'BEFORE'} ); }

determiner_block
  = det:determiner [ ]+ { return {'det':det}; }

determiner
  = definite { return "DEFINITE"; }
  / indefinite { return "INDEFINITE"; }
  / demonstrative { return "DEMONSTRATIVE"; }

definite
  = "les" / "le" / "la"

indefinite
  = "une" / "un" / "des"

demonstrative
  = "cette" / "cet" / "ces" / "ce"  // bien mettre dans cet ordre, le plus long d'abord

known_adjective
  = adj:french_word & {return options.dictHelper.isAdj(adj)} { return {'adj':options.dictHelper.getAdj(adj)}; }

known_noun
  = noun:french_word & {return options.dictHelper.isNoun(noun)} { return {'noun':options.dictHelper.getNoun(noun)}; }

unknown_noun
  = noun:french_word { return {'noun':noun, unknownNoun:true}; }

french_word
  = letters:[a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ\-]+ { return letters.join(''); }

