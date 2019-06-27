import { isHAspire } from '@freenlg/french-h-muet-aspire';
import { toutesVoyellesMinMaj, tousCaracteresMinMajRe } from './constants';

export function contractions(input: string): string {
  let res = input;

  // de + voyelle, que + voyelle, etc.
  const contrList: string[] = ['[Dd]e', '[Qq]ue', '[Ll]e', '[Ll]a', '[Ss]e', '[Jj]e'];
  for (let i = 0; i < contrList.length; i++) {
    // gérer le cas où 'de' est en début de phrase
    let regexDe = new RegExp(
      '(\\s+|p>)(' + contrList[i] + ')\\s+([' + toutesVoyellesMinMaj + 'h' + '][' + tousCaracteresMinMajRe + ']*)',
      'g',
    );

    res = res.replace(regexDe, function(corresp, before, determiner, word): string {
      if (!isHAspire(word)) {
        return `${before}${determiner.substring(0, determiner.length - 1)}'${word}`;
      } else {
        // do nothing
        return `${before}${determiner} ${word}`;
      }
    });
  }

  // ce arbre => cet arbre
  {
    let regexCe = new RegExp(
      '(\\s+|p>)([Cc]e)\\s+([' + toutesVoyellesMinMaj + 'h' + '][' + tousCaracteresMinMajRe + ']*)',
      'g',
    );
    res = res.replace(regexCe, function(corresp, before, determiner, word): string {
      // debug(`${before} ${determiner} ${word}`);
      if (!isHAspire(word)) {
        return `${before}${determiner}t ${word}`;
      } else {
        // do nothing
        return `${before}${determiner} ${word}`;
      }
    });
  }

  // de le => du
  res = res.replace(/\s+de\s+le\s+/g, ' du ');

  // De le => du
  res = res.replace(/De\s+le\s+/g, 'Du ');

  // de les => des
  res = res.replace(/\s+de\s+les\s+/g, ' des ');

  // De les => Des
  res = res.replace(/De\s+les\s+/g, 'Des ');

  // des les => des
  res = res.replace(/\s+des\s+les\s+/g, ' des ');

  // à le => au
  res = res.replace(/\s+à\s+le\s+/g, ' au ');

  // à les => aux
  res = res.replace(/\s+à\s+les\s+/g, ' aux ');

  //if (input != res) {
  // debug("changed:" + input + '=>' + res);
  //}
  //console.log(`${input} => ${res}`);

  return res;
}
