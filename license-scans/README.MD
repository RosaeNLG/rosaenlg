<!--
Copyright 2023 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->

The LF AI & Data performs regular license scan over the different repos of RosaeNLG.
In this folder there is the detailed result of the scans.
This documentation file provides feedback over the findings which have a priority set as "High".


# 2023-08-09 scan analysis
## Finding #1
*Priority: High
The linguistic data referred to is under a COPYLEFT license, which may be incompatible with your project license. Can this language data either be removed or replaced with a more permissive license?
2 files
packages/french-verbs-lefff/resources/LICENSE
packages/french-words-gender-lefff/resources/LICENSE*

`french-verbs-lefff` and `french-words-gender-lefff` use data derived from the [LEFFF - lexique des formes fléchies du français](https://www.labri.fr/perso/clement/lefff/), which is under [LGPLLR](https://www.labri.fr/perso/clement/lefff/licence-LGPLLR.html). During the packaging, the Linguistic Resource is transformed in a json file. This json file is used by the modules at runtime. The code to produce the derived json files is provided.

As described in section 3 of LGPLLR, `french-verbs-lefff` and `french-words-gender-lefff` both contain a derivative of the Linguistic Resource. They combine "work that uses the Linguistic Resource" (the JavaScript code of the modules) with the Linguistic Resource (a derived form of it: json files).

As described in section 4 of LGPLLR, these modules can be distributed under terms of choice (here Apache 2.0), as long a some conditions are met, which is the case:
- The source (LEFFF) is indicated
- Its license is copied as is in the module
- The code to derive the initial resource to the resource used by the module at runtime is provided
- The user can easily use a modified version of the Linguistic Resource with these packages

## Finding #2
*Priority: High
These files refer to resources under CC-BY-SA-(X.0), a share-alike license which may be incompatible with your project license. Can these resources be removed or replaced?
4 files
packages/italian-adjectives-dict/resources/CC-BY-SA-2.0.txt
packages/morph-it-helper/README.md
packages/french-verbs-transitive/README.md
packages/german-adjectives-dict/resources/LICENSE.txt*

The modules `italian-adjectives-dict` and `morph-it-helper` both [Morph-it!](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it), which is licensed under [CC BY-SA 2.0](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it#licensing_information).

At runtime, they use a json file derived from Morph-it for convenience purposes. This derived file is produced when packaging the modules, with a code that is provided.

Under CC BY-SA 2.0, `italian-adjectives-dict` and `morph-it-helper` are derivative work:
- Credit is given: license and original linguistic resource is kept in the source code, and Morph-it is mentioned in the documentation of RosaeNLG
- The derived work (the json files) remains under CC BY-SA 2.0
- The README.MD of the modules clearly mentions this


The module `french-verbs-transitive` uses data from [wiktionary](https://fr.wiktionary.org/wiki/Cat%C3%A9gorie:Verbes_transitifs_en_fran%C3%A7ais), which is under [CC BY-SA 3.0 licence](https://creativecommons.org/licenses/by-sa/3.0/deed.fr).
- Credit is done in the module documentation
- The code to process the source data is provided
- The `resources/transitive/transitive.json` resource remains under CC BY-SA 3.0 licence



The module `german-adjectives-dict` is based on the [german-pos-dict](https://github.com/languagetool-org/german-pos-dict), which is under [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Credit is done in the module documentation
- The code to process the source data is provided
- The output file remains under CC-BY-SA-4.0 licence


## Finding #3
*Priority: High
This file refers to 3rd party code under MPL 2.0, a weak copyleft license, which may be incompatible for downstream users of your project. Can this code be removed?
1 file
packages/rosaenlg-antora-ui/package.json*

The package `rosaenlg-antora-ui` is a fork of [Antora Default UI](https://gitlab.com/antora/antora-ui-default), which is under MPL 2.0. 
`rosaenlg-antora-ui` remains under MPL 2.0.
`rosaenlg-antora-ui` is not part of the RosaeNLG runtime. It is used exclusively to generate the website of [RosaeNLG documentation](https://rosaenlg.org).
