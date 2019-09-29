import fs = require('fs');
import stream = require('stream');
import rosaenlgPug = require('rosaenlg');
import browserify = require('browserify');
import minify = require('minify-stream');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | string;

/*
interface RosaeNlgOptions {
  language: Languages;
  //[key: string]: any;
}
*/

export function renderTemplateInFile(template: string, dest: string, options: any): void {
  if (!template) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'template is mandatory';
    throw err;
  }
  if (!dest) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }

  const rendered = rosaenlgPug.renderFile(template, options);
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
  if (!dest) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }
  if (!holderName) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'holder name is mandatory';
    throw err;
  }

  const s = new stream.Readable();

  sourcesAndNames.forEach(function(sourceAndName: SourceAndName): void {
    console.log(`template ${sourceAndName.source} => ${sourceAndName.name}`);
    const compiled = rosaenlgPug.compileFileClient(sourceAndName.source, {
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

  const b = browserify({
    standalone: holderName,
  });
  /* istanbul ignore if : tinyify is too long for gitlab CI */
  // if (tinyify) {
  // b.plugin('tinyify');
  // }
  b.add(s);

  if (tinyify) {
    return b
      .bundle()
      .pipe(minify({ sourceMap: false }))
      .pipe(outputStream);
  } else {
    return b.bundle().pipe(outputStream);
  }
}
