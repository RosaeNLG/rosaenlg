import fs = require('fs');
import path = require('path');
import stream = require('stream');
import rosaenlg = require('rosaenlg');
import browserify = require('browserify');
import minify = require('minify-stream');

import { PackagedTemplate, CompileInfo, Autotest, Languages, TemplatesMap } from 'rosaenlg-server-toolkit';

export interface PackagedTemplateParams {
  templateId: string;
  entryTemplate: string;
  compileInfo: CompileInfo;
  autotest?: Autotest;
}

const FORMAT = '2.0.0';

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

  sourcesAndNames.forEach(function (sourceAndName: SourceAndName): void {
    //console.log(`template ${sourceAndName.source} => ${sourceAndName.name}`);
    const compiled = rosaenlg.compileFileClient(sourceAndName.source, {
      language: language,
      compileDebug: false,
      embedResources: true,
      name: sourceAndName.name,
    });
    s.push(compiled.toString());
  });

  const names = sourcesAndNames.map(function (elt): string {
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

const includeRe = new RegExp('^\\s*include\\s+([^\\s]+)\\s*$');

function getFinalFileName(baseDir: string, template: string): string {
  const pathElts = path.parse(template);
  const templateWithExt = pathElts.ext == null || pathElts.ext == '' ? template + '.pug' : template;

  const fullPath = baseDir ? path.join(baseDir, templateWithExt) : templateWithExt;
  const finalFileName = fullPath.replace(new RegExp('\\\\', 'g'), '/'); // change to linux paths

  return finalFileName;
}

function getAllIncludes(baseDir: string, template: string, templatesMap: TemplatesMap): TemplatesMap {
  //console.log('starting to process: ' + template);
  templatesMap = templatesMap || {};

  const finalFileName = getFinalFileName(baseDir, template);
  // console.log('finalFileName is: ' + finalFileName);
  const content = fs.readFileSync(finalFileName, 'utf8');

  // add this one
  templatesMap[finalFileName] = content;

  // check includes
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(includeRe);
    if (matches && matches[1]) {
      const matched = matches[1];
      // console.log('found included: ' + matched);
      const newBaseDir = path.parse(finalFileName).dir;
      // console.log('newBaseDir: ' + newBaseDir);
      templatesMap = getAllIncludes(newBaseDir, matched, templatesMap);
    }
  }
  return templatesMap;
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
  // get file list and their content
  const templatesMap: TemplatesMap = getAllIncludes(null, params.entryTemplate, null);

  // console.log(templatesMap);
  res.src.templates = templatesMap;

  // compile if asked
  if (params.compileInfo && params.compileInfo.activate) {
    const compiled = rosaenlg.compileFileClient(params.entryTemplate, {
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
