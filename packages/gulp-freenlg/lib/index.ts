import fs = require('fs');
import stream = require('stream');
import freenlgPug = require('@freenlg/freenlg');
import browserify = require('browserify');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | string;

/*
interface FreeNlgOptions {
  language: Languages;
  //[key: string]: any;
}
*/

export function renderTemplateInFile(template: string, dest: string, options: any): void {
  if (template == null) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'template is mandatory';
    throw err;
  }
  if (dest == null) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }

  const rendered = freenlgPug.renderFile(template, options);
  fs.writeFileSync(dest, rendered);
}

interface SourceAndName {
  source: string;
  name: string;
}

export function compileTemplates(
  sourcesAndNames: SourceAndName[],
  language: Languages,
  dest: string,
  holderName: string,
  tinyify: boolean,
): fs.WriteStream {
  if (dest == null) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }
  if (holderName == null) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'holder name is mandatory';
    throw err;
  }

  let s = new stream.Readable();

  sourcesAndNames.forEach(function(sourceAndName: SourceAndName): void {
    console.log(`template ${sourceAndName.source} => ${sourceAndName.name}`);
    const compiled = freenlgPug.compileFileClient(sourceAndName.source, {
      language: language,
      compileDebug: false,
      embedResources: true,
      name: sourceAndName.name,
    });
    s.push(compiled.toString());
  });

  const names = sourcesAndNames.map(function(elt): string {
    return elt.name;
  });
  s.push(`\nmodule.exports = {${names.join(',')}};`);
  s.push(null);

  const outputStream = fs.createWriteStream(dest);

  let b = browserify({
    standalone: holderName,
  });
  /* istanbul ignore if : tinyify is too long for gitlab CI */
  if (tinyify) {
    b.plugin('tinyify');
  }
  b.add(s);

  return b.bundle().pipe(outputStream);
}
