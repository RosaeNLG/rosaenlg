/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

// ne sont pas contractés
const exceptions = [
  'iaido',
  'iatron',
  'iench',
  'iourte',
  'iota',
  'iule',
  'oolong', // cf. wikipedia
  'ouatine',
  'ouistiti',
  'ouolof',
  'uigur',
  'onze',
  'onzième',
  'oui',
  'uhlan',
];

const vowels = 'aeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ';

const beginsWithVowelRE = new RegExp(`^[${vowels}]`);
export function beginsWithVowel(word: string): boolean {
  return beginsWithVowelRE.test(word);
}

export function isContractedVowelWord(word: string): boolean {
  if (!beginsWithVowel(word)) {
    return false;
  }

  const first = word.charAt(0).toLowerCase();
  if ((first === 'i' || first === 'o' || first === 'u') && exceptions.indexOf(word) > -1) {
    return false;
  }

  if (first === 'y') {
    const second = word.charAt(1).toLowerCase();
    if (second && vowels.indexOf(second) > -1) {
      return false;
    }
  }

  return true;
}

/*
a
	aa NA
	ae
		l'aéroplane
		toujours l'
	ai
		l'
	ao
	au
	ay
	==> a : osef de ce qui suit, toujours l'

e
	ea ok
	ee ok
	ei ok
	eo ok
	eu ok
	ey ok
	===> e : toujours l'

i
	a
		le iaido
		la iatron
		sinon l'
	e
		le iench
	i
	o
		l'iode
		l'ionosphère
		la iourte
		le iota
	u
		le iule
	y
	===> quelques exceptions

o
	a
	e
	i
	o
		le oolong cf. wikipedia
	u
		la ouatine
		le ouistiti
		le ouolof

	y

u
	a
	e
	i
		le uigur
	u
	y

y
	a
		le : yac
		TOUS LES YA
			le yaourt
			le yak
			le yacht
			le yassa
	e
		TOUS
		la yeuze
		yéti <= bon cas é
	i
		TOUS
		Yiddish
		yin
	o
		TOUS
		le yoghourt
		le yogi
		yoyo
	u
		TOUS
		yuan
		yuzu

l'ylang-ylang

https://www.linternaute.fr/dictionnaire/fr/abecedaire/ya/1/
*/
