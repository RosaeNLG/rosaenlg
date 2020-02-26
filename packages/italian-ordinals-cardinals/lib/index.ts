import n2words = require('n2words')

const fixedOrdinals = {
  1: 'primo',
  2: 'secondo',
  3: 'terzo',
  4: 'quarto',
  5: 'quinto',
  6: 'sesto',
  7: 'settimo',
  8: 'ottavo',
  9: 'nono',
  10: 'decimo',
  1000000: 'milionesimo',
  1000000000: 'miliardesimo',
}

const suffix = 'esimo'
const it = {lang: 'it'}

export function getOrdinal(val: number): string {
  if (val in fixedOrdinals)
		return fixedOrdinals[val]
	else if (val < 1000000){
		
		const last_two_digits = val % 100
		const last_digit = last_two_digits % 10
		const second_last_digit = Math.floor(last_two_digits / 10)

		// 23 -> ventitré -> ventitreesimo
		var cardinal = n2words(val, it).replace(/é/g, 'e')

		// 846 -> ottocentoquarantaseiesimo -> no need to cut off last char
		// 816 -> ottocentosedicesimo -> need to cut
		// 823 -> ottocentoventitreesimo -> no need to cut of the double 'e'
		if (
			(last_digit == 6 && second_last_digit != 1) ||
			(last_digit == 3 && second_last_digit != 1)

		)
			return cardinal + suffix

		cardinal = cardinal.slice(0, -1)

		// 12000 -> dodicimillesimo, need to double the 'l'
		if (cardinal.endsWith('mil'))
			cardinal = cardinal.replace('mil', 'mill')

		return cardinal + suffix
	} 

	const err = new Error();
	err.name = 'RangeError';
	err.message = `Italian ordinal not found for ${val}`;
	throw err;
}
