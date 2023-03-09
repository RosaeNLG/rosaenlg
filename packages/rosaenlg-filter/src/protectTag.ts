const startProtect = '<protect>';
const endProtect = '</protect>';

function removeNestedProtectHtmlTags(input: string, start = 0, opened = 0): string {
  // console.log('removeNestedProtectHtmlTags', input.substring(start), 'opened=', opened);

  // ending
  if (start >= input.length) {
    if (opened > 0) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `<protect> tag without ending </protect> tag`;
      throw err;
    }
    // we're done, everything is ok
    return input;
  }

  const nextStartPos = input.indexOf(startProtect, start);
  const nextEndPos = input.indexOf(endProtect, start);

  //console.log('nextStartPos', nextStartPos, 'nextEndPos', nextEndPos);

  if (opened === 0) {
    // an end, but no start
    if (nextEndPos !== -1 && nextStartPos === -1) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `unexpected </protect> tag`;
      throw err;
    }

    // an end, but before the start
    if (nextEndPos !== -1 && nextEndPos < nextStartPos) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `unexpected </protect> tag`;
      throw err;
    }

    if (nextStartPos === -1 && nextEndPos === -1) {
      // no more - we're done
      return input;
    }

    return removeNestedProtectHtmlTags(input, nextStartPos + startProtect.length, 1);
  } else {
    if (nextEndPos === -1) {
      const err = new Error();
      err.name = 'InternalError';
      err.message = `<protect> tag without ending </protect> tag`;
      throw err;
    }

    if (nextStartPos === -1 || nextEndPos < nextStartPos) {
      if (opened === 1) {
        // we have found the corresponding </protect> tag
        // and we were not nested
        // that's ok: no nesting, nothing to clean for this part
        // we continue after the end tag
        //console.log('situation 1');
        return removeNestedProtectHtmlTags(input, nextEndPos + endProtect.length, 0 /* , ExpectsNexts.OpenOrNothing */);
      } else {
        // we have found a </protect> tag - which we expected
        // it is one to clean, so we remove it
        // and we remember that we removed it
        //console.log('situation 2');
        const cleanedInput = input.substring(0, nextEndPos) + input.substring(nextEndPos + endProtect.length);
        return removeNestedProtectHtmlTags(cleanedInput, nextEndPos, opened - 1);
      }
    } else {
      // we have found a nested <protect> tag
      // we must:
      // 1. remove it
      // 2. remember to cleanup the next </protect>
      //console.log('situation 3');
      const cleanedInput = input.substring(0, nextStartPos) + input.substring(nextStartPos + startProtect.length);
      return removeNestedProtectHtmlTags(cleanedInput, nextStartPos, opened + 1);
    }
  }
}

export function processProtectHtmlTags(input: string): string {
  const cleaned = removeNestedProtectHtmlTags(input);
  // console.log('ORIGINAL', input, 'CLEANED', cleaned);
  return cleaned.replace(/<protect>/g, '§').replace(/<\/protect>/g, '§');
}
