import fs = require('fs');
import path = require('path');
import stream = require('stream');
import rosaenlg = require('rosaenlg');
import browserify = require('browserify');
import minify = require('minify-stream');

import { PackagedTemplateParams, PackagedTemplate } from './PackagedTemplate';

export { PackagedTemplate, PackagedTemplateSrc, PackagedTemplateComp } from './PackagedTemplate';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | string;

const FORMAT = '1.0.0';

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

  const rendered = rosaenlg.renderFile(template, options);
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
    const compiled = rosaenlg.compileFileClient(sourceAndName.source, {
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

function getFilesInDir(dir: string, filelist: string[]): string[] {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = getFilesInDir(path.join(dir, file), filelist);
    } else {
      if (path.extname(file) == '.pug') {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
}

export function packageTemplateJson(params: PackagedTemplateParams): PackagedTemplate {
  const res: PackagedTemplate = {
    format: FORMAT,
    templateId: params.templateId,
    src: {
      entryTemplate: params.entryTemplate,
      compileInfo: Object.assign({}, params.compileInfo), // as we will modify the object in res
      templates: {},
    },
  };

  // as it is not useful in the result
  if (res.src.compileInfo && res.src.compileInfo.activate != null) {
    delete res.src.compileInfo.activate;
  }

  // autotest data if present
  if (params.autotest) {
    res.src.autotest = params.autotest;
  }
  // get templates content
  const files = getFilesInDir(params.folderWithTemplates, null);
  if (files == null || files.length == 0) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `no files found in ${params.folderWithTemplates}`;
    throw err;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const finalFileName = file
      .replace(new RegExp('\\' + path.sep, 'g'), '/') // change to linux paths
      .replace(params.folderWithTemplates + '/', ''); // and remove root
    res.src.templates[finalFileName] = fs.readFileSync(file, 'utf-8');
  }

  // compile if asked
  if (params.compileInfo && params.compileInfo.activate) {
    const compiled = rosaenlg.compileFileClient(path.join(params.folderWithTemplates, params.entryTemplate), {
      language: params.compileInfo.language,
      compileDebug: params.compileInfo.compileDebug,
      embedResources: true,
    });
    res.comp = {
      compiled: compiled,
      compiledWithVersion: rosaenlg.getRosaeNlgVersion(),
      compiledBy: 'gulp-rosaenlg',
      compiledWhen: new Date().toISOString(),
    };
  }

  return res;
}
