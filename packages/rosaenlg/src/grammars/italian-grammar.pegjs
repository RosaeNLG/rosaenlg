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
  = det:determiner [ ]+ { return det; }

determiner
  = demonstrative_near { return {det:"DEMONSTRATIVE", dist:"NEAR"}; }
  / demonstrative_far { return {det:"DEMONSTRATIVE", dist:"FAR"}; }
  / definite { return {det:"DEFINITE"}; }
  / indefinite { return {det:"INDEFINITE"}; }

definite
  = "gli" / "il" / "lo" / "la" / "le" / "i"

indefinite
  = "uno" / "una" / "un"

demonstrative_near
  = "questo" / "questi" / "questa" / "queste"

demonstrative_far
  = "quello" / "quelli" / "quella" / "quelle"

known_adjective
  = adj:italian_word & {return options.dictHelper.isAdj(adj)} { return {'adj':options.dictHelper.getAdj(adj)}; }

known_noun
  = noun:italian_word & {return options.dictHelper.isNoun(noun)} { return {'noun':options.dictHelper.getNoun(noun)}; }

unknown_noun
  = noun:italian_word { return {'noun':noun, unknownNoun:true}; }

italian_word
  = letters:[a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ\-]+ { return letters.join(''); }

