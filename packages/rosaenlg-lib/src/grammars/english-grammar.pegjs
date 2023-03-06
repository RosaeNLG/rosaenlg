// Copyright 2019 Ludan Stoecklé
// SPDX-License-Identifier: Apache-2.0

{
  function isNotSP(val) {
    return val!='S' && val!='P';
  }

}

start =
  nominal_group:nominal_group extra_params:extra_params_block?
  {
    return Object.assign({}, nominal_group, extra_params);
  }

extra_params_block =
  [ ]+ extra_params:extra_params { return extra_params; }

extra_params =
  number:number { return Object.assign({}, number); }

number =
  "S"i { return {'number':'S'}; }
  / "P"i { return {'number':'P'}; }

nominal_group
  = det:determiner_block? after:after_det_block { return Object.assign({}, det, after); }

after_det_block
  = adjective_noun
  / noun:noun {return noun; }

adjective_noun
  = adj:adjective [ ]+ noun:noun { return Object.assign({}, noun, adj); }

determiner_block
  = det:determiner [ ]+ { return det }

determiner
  = demonstrative_near { return {det:"DEMONSTRATIVE", dist:"NEAR"}; }
  / demonstrative_far { return {det:"DEMONSTRATIVE", dist:"FAR"}; }
  / definite { return {det:"DEFINITE"}; }
  / indefinite { return {det:"INDEFINITE"}; }

definite
  = "the"

indefinite
  = "an" / "a"

demonstrative_near
  = "these" / "this"

demonstrative_far
  = "those" / "that"

// & { adj!='S' && adj!='P' } 
adjective
  = adj:english_word & { return isNotSP(adj); } { return {'adj':adj}; }

// 
noun
  = noun:english_word & { return isNotSP(noun); }  { return {'noun':noun}; }


english_word // same as French but no -
  = letters:[a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ]+ { return letters.join(''); }

