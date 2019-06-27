export function joinLines(input: string /*, lang: string*/): string {
  return input.replace(/\n|\r/g, ' ');
}

export function cleanStruct(input: string /*, lang: string*/): string {
  let res: string = input;

  res = res.replace('<p>.</p>', '');
  res = res.replace('</p>.</p>', '</p></p>');
  res = res.replace(/<\/p>\s*.\s*<\/p>/, '</p></p>');

  return res;
}
