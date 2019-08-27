export interface ReplacedHtml {
  replaced: string,
  elts: string[],
}

const blockLevelElts = ['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1>-<h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
const inlineElts = ['a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output', 'q', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'];

export function replaceHtml(input:string): ReplacedHtml {

  // console.log(input);

  let replacedHtml: ReplacedHtml = {replaced: null, elts: []};

  let regexHtml = new RegExp('<(/?)([a-zA-Z]+)[^>]*>', 'g');
  replacedHtml.replaced = input.replace(regexHtml, function(match: string, begin: string, tag: string): string {
    // console.log(`match: ${match} / tag: ${tag}`);
    replacedHtml.elts.push(match);
    if (blockLevelElts.indexOf(tag)>-1) {
      if (begin==='/') {
        return '☚';
      } else {
        return '☛';
      }
    } else { // inlineElts or other
      if (begin==='/') {
        return '☜';
      } else {
        return '☞';
      }
    }
    // console.log(`rosaenlg-filtering: html tag nature unknown: ${tag} => considered as inline elt`);
  });


  return replacedHtml;
}

export function replacePlaceholders(input:string, elts:string[]): string {

  // console.log(input);

  let regexPlaceholder = new RegExp('[☛☚☞☜]', 'g');
  let res = input.replace(regexPlaceholder, function(match: string, placeholder: string): string {
    //console.log(`match: ${match} / tag: ${placeholder}`);
    let tag = elts.shift();
    //console.log(tag);
    if (typeof tag === 'undefined') {
      let err = new Error();
      err.name = 'InternalError';
      err.message = `There are not enough html tags`;
      throw err;  
    }
    return tag;
  });

  if (elts.length>0) {
    let err = new Error();
    err.name = 'InternalError';
    err.message = `There are left html tags: ${elts}`;
    throw err;
  }

  return res;

}



const protectMap = {
  AMPROTECT: '&amp;',
  LTPROTECT: '&lt;',
  GTPROTECT: '&gt;',
};

export function protectHtmlEscapeSeq(input: string): string {
  let res: string = input;
  for (let key in protectMap) {
    res = res.replace(protectMap[key], key);
  }
  return res;
}

export function unProtectHtmlEscapeSeq(input: string): string {
  let res: string = input;
  for (let key in protectMap) {
    res = res.replace(key, protectMap[key]);
  }
  return res;
}
