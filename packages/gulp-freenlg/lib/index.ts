import fs = require('fs');
import stream = require('stream');
import freenlgPug = require('freenlg');
import browserify = require('browserify');

export function renderTemplateInFile(template:string, dest:string, options:any):void {
  if (template==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'template is mandatory';
    throw err;
  }
  if (dest==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }

  const rendered = freenlgPug.renderFile(template, options);
  fs.writeFileSync(dest, rendered);
}


export function compileTemplates(
  sourcesAndNames:any[], 
  language:'fr_FR'|'de_DE'|'en_US', 
  dest:string,
  holderName:string,
  tinyify: boolean
  ): fs.WriteStream {

  if (language!='fr_FR' && language!='de_DE' && language!='en_US') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'invalid language';
    throw err;
  }
  if (dest==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'destination file is mandatory';
    throw err;
  }
  if (holderName==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = 'holder name is mandatory';
    throw err;
  }

  let s = new stream.Readable();

  sourcesAndNames.forEach(function(sourceAndName) {
    console.log(`template ${sourceAndName.source} => ${sourceAndName.name}`);
    const compiled = freenlgPug.compileFileClient(sourceAndName.source, {
      language: language,
      compileDebug: false,
      embedResources: true,
      name: sourceAndName.name
    });
    s.push(compiled.toString());
  });

  const names = sourcesAndNames.map((elt) => elt.name);
  s.push(`\nmodule.exports = {${names.join(',')}};`);
  s.push(null); 

  const outputStream = fs.createWriteStream(dest);

  let b = browserify({
    standalone: holderName
  });
  if (tinyify) {
    b.plugin('tinyify');
  }
  b.add(s);

  return b.bundle()
    .pipe(outputStream);
  
}
