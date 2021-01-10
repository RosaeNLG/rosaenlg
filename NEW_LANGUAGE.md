<!--
Copyright 2020 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
# Adding a new language - Specification

**as a non developer, but speaker of the target language:**

- complete the following document: example is for French (and non exhaustive)
- always refer to reference articles written in English
- when mentioning a rule, always:
  - define precisely the rule and all its exceptions
  - be exhaustive: long lists are not a problem
- always give a lot of examples which will be used for regression testing
- create examples in `packages/rosaenlg/test/test-rosaenlg/xx_XX`
- create a dedicated tutorial


## General

>- what is the ISO 639-1 name of the language?
>- what is the ISO 639-1 code?
>- what is the ISO 3166-1 alpha-2 country code of the main locutors?
>- do genders matter? is there a neutral?
>- are there grammatical cases, like in German (nominative, dative etc.)? what is the default case?

- French
- fr
- FR
- yes, M or F; no neutral
- no cases


## Words

>- do words inflect (i.e. do they change depending on how their are used: gender, number etc.)?
>- do words have a gender? if so, how to get the gender?
>- what makes them inflect?
>- what are the properties of a word?
>- which numbers are considered as plural? e.g. in English, 0 and 0.5 are plural

- words inflect
- yes, M or F; use a dictionnary
- plural: plural of the word, gender (M or F), contracts (yes or no, default is no)
- bureau:
  - plural: bureaux
  - gender: M
  - contracts: no
- hérisson
  - plural: hérissons
  - gender: M
  - contracts: yes
- plurals:
  - general rule is adding an s: homme => hommes
  - exceptions: genou => genoux
  - some don't change: cas => cas
- numbers and plural:
  - >= 2 is plural
  - 0, 0.5, 1.5 are singular


## Adjectives

>- do adjectives inflect?
>- what makes them change?
>- what are the properties of an adjective?
>- should adjectives be put before or after a word? are both possible? is so, what should be the default position?
>- when there are multiple adjectives, how should they be linked?

- adjectives inflect
- how it changes: 
  - masculine singular, masculine plural, feminine singular, feminine plural
  - when the adjective is before the noun: for some nouns the adjective is changed, e.g. un vieil homme vs un homme vieux
- properties: indicate if it contracts (yes or no, default is no)
  - e.g. homme contracts to make "un vieil homme"
- horrible:
  - contracts: true
  - un vieil homme
  - un vieux tricheur
  - un vieux yaourt
  - un vieil ylang-ylang
  - un mol ectoplasme
- beau:
  - MS: beau
  - MP: beaux
  - FS: belle
  - FP: belles
- can be before and after the word
  - une belle femme: is before
  - un repas riche: is after
  - default is after
- to link, use "et": un repas riche et lourd
- rules:
  - invariable: 
    - chic, super, sympa, maison (des hommes sympa, des pâtisseries maison)
    - flowers, fruits, etc.: orange, saumon, ébène, amande, etc. - huge list
  - some only change when plural: des cheveux châtains
  - change completely when feminine: faux => fausse, turc => turque, exprès => expresse, dissous => dissoute, tiers => tierce, gentil => gentille, seul => seule, incomplet => incomplète - there is a large list
  - ...
  - ...
  - ...


## Verbs

>- do verbs inflect?
>- what makes them change?
>- what is the default tense?
>- are there auxiliary verbs? e.g. to be, to have, etc.? how to choose the auxiliary?
>- are there pronominal forms? how are they constructed?
>- where to get the complete inflection forms?

- verbs inflect
- inflects:
  - tense
  - subject:
    - person (I, you, they, etc.)
    - gender of the the subject, number of the subject
- présent de l'indicatif
- avoir and être
  - some verbs always take être: aller, apparaître, provenir...
  - transitive verbs generally take avoir: camoufler, expérimenter etc. - list is known but huge
  - for some verbs (including transitive verbs) you can choose
- use a conjugation list e.g. LEFFF


## Sentences

>- what is the standard structure of a sentence? subject verb typically
>- are there classic constructions where the order changes? e.g. in German "leider kennt er sie nicht" or "er hat das Büro aufgeräumt"

- standard is subject verb


## Determiners

>- are there determiners in the language?
>- what are the kind of determiners? definite, indefinite, possessive, etc.
>- how to they flex?

- yes
- definite, indefinite, demonstrative, possessive
- flex:
  - gender of the owned
  - number of the owned
  - number of the owner (when possessive)
  - we don't care about the gender of the owner
  - if there is an adjective after the determiner
  - what is after the determiner
  - de/des
- rules and examples:
  - definite: MS => le, FS => la, P => les
    - la personne
    - les personnes
  - indefinite: un, une, des
    - une personne
    - des personnes
    - de/des when there is an adjective after the determiner:
      - de bons restaurants
      - exception: des jeunes gens
      - force "des": des bons restaurants
  - demonstrative: ce, cette, ces
    - ce bureau
    - cette personne
    - ces personnes
  - possessive:
    - owner is S:
      - owned is S: son, sa (elle, son bureau)
      - owned is P: ses (elle, ses bureaux)
    - owner is P:
      - owned is S: leur (elles, leur bureau)
      - owned is P: leurs (elles, leurs bureaux)


## Possessives

>- possessive imply an owner and an owned object: e.g. the client is the owner, the house is owned
>- does the way it is referred to the owned object depends if the owner has been disclosed? e.g. the house of the client vs the client
>- how does it inflect?

- la maison / le client
- yes:
  - la maison du client / sa maison
  - possessive on "sa maison": use owned object gender and number


## Numbers

>- give the texts for the numbers of 0 to 9
>- do ordinal numbers change depending on gender or anything else?
>- check if `numeral` supports the language
>  - for general formating
>  - for ordinal (in English: 1st, 2nd...)
>- check if `n2words` supports the language for textual numbers (e.g. in English, one, one hundred and eight, one thousand...)
>- explain how to manage textual ordinal (in English: first, second...)
>- when transforming a floating number into text, what is the word for the comma?

- zéro un deux trois quatre cinq six sept huit neuf
- yes: 1er / 1ère, premier / première
- yes numeral works
  - in general
  - for textual numeral
- yes n2words works to textual numbers
- use a list: premier, deuxième, troisième,quatrième, cinquième, sixième, septième...
- use "virgule"



## Dates

>- what is the default date format?
>- does `date-fns` module supports the language?


- yyyy-MM-dd
- yes for date-fns


## Filtering

### Punctuation

>- is there punctuation?
>- what are the punctuation signs and there meaning?
>- what are the rules related to each punctuation? spaces, capitalization, etc.
>- describe their differences with the standard English punctuation

- essentially same as English with some differences
- non-breaking space before : and ;


### Contractions and mutations

>- are there contractions rules? 
>- briefly introduce each mechanism

- some pronouns and determiners combine together: de + les => du, de + les => des, à + lesquelles => auxquelles...
- some determiners and pronouns get contracted when before a vowel
  - se arrêter => s'arrêter, je irai => j'irai, puisque il => puisqu'il...
  - le hebdomadaire => l'hebdomadaire
  - but le hérisson does not change
- some determiners are transformed before a vowel
  - ce arbre => cet arbre
  - ce hebdomadaire => cet hebdomadaire
  - but ce hérisson does not change


>- describe in detail each mechanism
>- give examples

...


## Synonyms optimization

### Tokenizer

>- how can a sentence be split into separate words?

- space and punctuation (,.!?;:' etc.) are the separators
- use a standard tokenizer to extract words


### Stop words

>- do stop words exists in the language?
>- what is the standard list of stop words?

- yes
- use stopwords-fr
- e.g. même - là - lès - m - ma


### Stemming

>- for a flexed word (word, adjective or verb), how to get its root?

- verb: bouffé => bouff
- word: poubelles => poubelle
- use a standard stemmer

