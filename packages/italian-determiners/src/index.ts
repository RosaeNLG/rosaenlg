/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*
https://www.italien-facile.com/exercices/exercice-italien-2/exercice-italien-65772.php
https://fr.wikipedia.org/wiki/Grammaire_italienne#L'article_d%C3%A9fini
https://www.italien-facile.com/exercices/exercice-italien-2/exercice-italien-68091.php

défini
	masculin
		singulier
			"il" devant consonne
				il romano
				il dio
			"l'" devant voyelle - sauf si i suivi d'une autre voyelle, dans ce cas "lo"
				l'europeo
				l'inno
			"lo" mots commençant par une consonne dite impure, soit : ps, pn, gn, x, z, ou s impur (autrement dit un s suivi d'une autre consonne)
				lo straniero
				lo studente
				lo zingaro
				lo psicologo
		pluriel
			"i" est le cas général pour les consonnes
				i romani
			"gli" voyelle ou consonne impure
				gli stranieri
				gli zingari
				gli europei
				gli psicologi
				gli dei exception ?
	féminin
		singulier
			"la" devant une consonne ou devant un i suivi d'une voyelle
				la romana
				la straniera
				la zingara
				la iucca
			"l'" devant une voyelle
				l'europea
				l'amica
		pluriel
			"le"
				le romane
				le straniere
				le zingare
				le europee
indéfini
	masculin
		"un" cas général
			un romano
			un europeo
			un bel ricordo
			un uomo
		"uno" mots avec consonne s impure, ou z, ou commençant par un i suivi d'une voyelle
			uno straniero
			uno psicologo
			uno yogurt
	féminin
		"una" devant une consonne ou devant un i suivi d'une voyelle
			una romana
			una straniera
			una zingara
		"un'" devant un mot commençant par une voyelle
			un'europea
			un'asta
*/

export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Dist = 'NEAR' | 'FAR';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE'; // 'POSSESSIVE' not supported today

export function getDet(detType: DetType, gender: Genders, number: Numbers, dist: Dist): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (gender != 'M' && gender != 'F' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType === 'INDEFINITE' && number === 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `plural invalid for INDEFINITE`;
    throw err;
  }

  switch (detType) {
    case 'DEMONSTRATIVE':
      if (!dist) {
        dist = 'NEAR';
      } else if (dist != 'NEAR' && dist != 'FAR') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `dist must be NEAR or FAR, here ${dist}`;
        throw err;
      }
      const dem = {
        NEAR: { MS: 'questo', MP: 'questi', FS: 'questa', FP: 'queste' },
        FAR: { MS: 'quello', MP: 'quelli', FS: 'quella', FP: 'quelle' },
      };
      return dem[dist][gender + number];

    case 'DEFINITE':
    case 'INDEFINITE':
      const dets = {
        DEFINITE: { MS: 'il', MP: 'i', FS: 'la', FP: 'le' },
        INDEFINITE: { MS: 'un', FS: 'una' },
      };
      return dets[detType][gender + number];
  }
}
