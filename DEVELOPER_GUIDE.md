<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
# Developer Guide

Read this if you want to contribute to RosaeNLG.

Check:

- [Build and test RosaeNLG](#build-and-test) from its source code
- [Add a new language](#add-a-new-language) to RosaeNLG


## Code, Tooling

Code is on Github:

- [RosaeNLG project group](https://github.com/RosaeNLG)
- [Main project](https://github.com/RosaeNLG/rosaenlg)

[Sonar dashboard](https://sonarcloud.io/dashboard?id=RosaeNLG_RosaeNLG)


## Main Project Structure

Multi package repo (lerna) which is a fork of Pug @2.0.3 (forked 2018-04-06). Pug @3.0.0 was published 2020-05-25.

- `rosaenlg` is the main package. Derived from `pug`.
- `rosaenlg-pug-xxx` are forks of the original `pug-xxx` packages:
  - Some of them are are unchanged, but I needed to fork them because they carry dependencies with changed packages: `rosaenlg-pug-filters` `rosaenlg-pug-linker` `rosaenlg-pug-load`
  - Some of them are changed to handle specific structures like `synz > syn`: `rosaenlg-pug-lexer` `rosaenlg-pug-parser` `rosaenlg-pug-walk` `pug-code-gen`
- `rosaenlg-yseop` is an Yseop template generator for RosaeNLG templates, derived from `rosaenlg-pug-code-gen` (itself a fork of `pug-code-gen`).
- and multiple packages that each contain a set of features


## Build and Test

Checkout [RosaeNLG main repo](https://github.com/RosaeNLG/rosaenlg).

### Pre install

- lerna: `yarn install lerna -g`
- yarn: `yarn install yarn -g`
- mocha: `yarn install mocha -g`


### Install

- Linking: `yarn install`.
- Build the linguistic resources and the typescript files: `lerna run build`.
- Run the tests: 
  - `lerna run test`
  - use `yarn test` directly in `packages/rosaenlg` folder (or another package)


### Linking a local RosaeNLG project with the local copy of the repo

In your project: *do not* run `npm install` as it will download each RosaeNLG package. And do not use `npm link`.

- just install the other dependencies: for instance `npm install junit`
- make a symbolic link in your project to your local copy of RosaeNLG: `mklink /D node_modules\rosaenlg c:\rosaenlg\rosaenlg\packages\rosaenlg` (adapt the path accordingly)


## Add a new language

Adding a new language in RosaeNLG consists of 2 main tasks:

1. All (well, most of) language specific content must be in dedicated packages: See [create linguistic resources](#create-linguistic-resources). Typically you will define how to agree words, verbs, and adjectives. Create your linguistic resources, one by one. You can start with implementing these modules as they are small and require very few "RosaeNLG specific" knowledge.
1. Implement the high level language specific behaviors and bundle everything together: See [implement in RosaeNLG](#implement-the-language-in-RosaeNLG)


### Create Linguistic Resources

#### Overview

The target is to put 99% of the language specific content in specific packages, in order to:

- favor reuse beyond RosaeNLG
- keep language specific packages for the browser small enough

Language specific packages manage agreement of words, verbs and adjectives. For language with a gender they also manage gender of words. At last, you also have dedicated packages for determiners and ordinal numbers.


#### Example

In French:

- Words / Adjectives / Verbs:
  - words gender are managed using lists, by `french-words` and `french-words-gender-lefff`, while word agreement is managed using rules, by `pluralize-fr`
  - adjectives agreement are managed using rules, by `french-adjectives` and `french-adjectives-wrapper`
  - verbs agreement are managed using lists, by `french-verbs` and `french-verbs-lefff`, and intransitive verbs are in `french-verbs-intransitive`
- Misc:
  - determiners with `french-determiners`
  - contractions by `french-contractions`
  - ordinal numbers by `french-ordinals`
  - helper for simplified syntax (see Simplified Syntax in the reference documentation) is in `lefff-helper`

In English, the a/an mechanism, specific to English, is managed by `english-a-an` (wrapper) and `english-a-an-list` (the real list).


#### Rules or Lists?

Agreements can be managed using rules (as we learned at school) or using explicit lists derived from linguistic resources. Rules can be tedious to implement (there are always plenty of exceptions), while lists are heavy, bring both errors and missing elements, and carry their own license.

Both are ok:

- French is mostly implemented using lists, except for adjectives agreement
- German uses only lists
- Spanish uses only rules

You have to check what exists on npm and elsewhere, and check license compatibility with Apache 2.0.


#### Wrappers and Lists

Each time a package is important enough, you will have to create 2:

- the real package that contains the rules or the just list (e.g. `french-verbs-lefff`); it can be as heavy as required
- a wrapper that uses the real package

The real package will only be used when compiling templates (you need the whole lists when compiling), while the wrapper will only be used when rendering compiled templates (you only need the elements which are in your templates, not the whole lists). This keeps rendering only browser packages small.

The wrapper will used the JSON resource file for testing purposes, but only call it in `devDependencies` (do not to link them together).

WARNING: If your module uses lists, you *must* declare it in `fake_resources.js`, or build times of other packages will take ages as `tsc` will try to parse them (and fail).


### Implement the Language in RosaeNLG

As a general advice:

1. Make something very simple, without language specific behaviors, just to plug everything together and "make things work" (compile, simple tests etc.)
1. Build progressively all language specific behaviors


In `rosaenlg-filter` package:

- create a new class that extends `LanguageFilter`
- it will contain everything specific about filtering for this language: contractions, punctuations
- create something very simple at the beginning; it can become much more complex (like in French or Italian) or remain very simple (like in German)
- update helpers `index.ts` `languageFilterHelper.ts` etc.
- add test cases in `filter.js`


In `rosaenlg-commons` package:

- create a new class that extends `LanguageCommon`
- it must remain quite simple as a target; you can keep it almost empty at the beginning, but at some point update `validPropsWord` and `validPropsAdj`
- update helpers helpers `helper.ts` `index.ts` etc.
- add test cases


In `rosaenlg-pug-code-gen` package:

- create a new class that extends `LanguageCodeGen`
- its only goal is to fetch structured Verb, Word and Adjective data from dedicated modules; it should not contain any language related logic
- update `package.json` accordingly
- update helper `helper.ts`
- add test cases


In `rosaenlg` package:

- create a new class that extends `LanguageImpl`
- indicate properties, and also override methods
- this class can become complex, as it will hold all language specific complex behaviors; but at the beginning you can keep it simple
- use `build:tsc` to build (do not make a complete build, with browser packages, each time)
- update `package.json` accordingly
- create test cases along your development in `test/test-rosaenlg/xx_XX`


Browser packaging, also in `rosaenlg` package:

- declare all language specific packages properly in `rollup.config.js`: the linguistic resource must not be included in the standard package, but only in the package to compile templates (the big one)
- enrich `tiny.js`
- build browser packages: adapt `yarn run rollup_xx` in `package.json`
- check manually the content of each bundled package
- mocha on `tiny.js` should work

In `rosaenlg-lambda` package:

- add the new language in `gulpfile.js`
- create the compiler service with `createXxxx.ts`
- create the render service with `renderXxxx.ts`


## Publish a new version

_for developers who can do the release_

RosaeNLG packages:

- feature branches must be merged in `master` branch
- build & tests must be green on GitHub
- check non regression on another project
- define the target version number
- create a `vXX.XX.XX` branch (to be seen by the doc project + to publish)
- clean `changelog.adoc` content, but leave `== [Unreleased]`
- run locally `gulp release_xxxx` with patch / minor / major as xxxx; this must update `changelog.adoc`, `antora.yml` and github workflows (4 files)
- local environment: `lerna version --no-push --no-git-tag-version --exact patch` (or `minor` etc. instead of patch)
- commit on the branch
- merge with master
- push branch: `git push origin vXX.XX.XX`
- push master: `git push origin master`
- Github Actions should build and publish on npm

Documentation:

- trigger the `antora-ui` project CI on github
- trigger the `docs-site` project CI on github and [check the result](https://rosaenlg.github.io/docs-site)
- trigger the `antora-playbook` CI on github

Misc:

- remove old branches on Github
- update the boilerplate

Update sibling project `rosaenlg-java`.

Publish new API on Lambda:

- build the real version first...
- first test on dev: `yarn run deploy:dev`
- migrate existing templates using `server-scripts` if they are not compatible
- then deploy on prod: `yarn run deploy:prod`
- check on prod
