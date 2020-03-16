import { Languages } from './index';

export interface CompileInfo {
  activate: boolean;
  compileDebug: boolean;
  language: Languages;
}

export interface Autotest {
  activate: boolean;
  input: any;
  expected: string[];
}

export interface TemplatesMap {
  [key: string]: string;
}
export interface PackagedTemplate {
  format: string;
  templateId: string;
  src: PackagedTemplateSrc;
  comp?: PackagedTemplateComp;
}

export interface PackagedTemplateSrc {
  entryTemplate: string;
  templates: TemplatesMap;
  compileInfo: CompileInfo;
  autotest?: Autotest;
}

export interface PackagedTemplateComp {
  compiled: string;
  compiledWithVersion: string;
  compiledBy?: string;
  compiledWhen?: string;
}

export interface PackagedTemplateWithUser extends PackagedTemplate {
  user: string;
}

export function justCompile(packagedTemplateSrc: PackagedTemplateSrc, compileFileClient: Function): string {
  const opts: any = Object.assign({}, packagedTemplateSrc.compileInfo);
  opts.staticFs = packagedTemplateSrc.templates;
  opts.embedResources = true;
  return compileFileClient(packagedTemplateSrc.entryTemplate, opts);
}

export function compToPackagedTemplateComp(
  packagedTemplateSrc: PackagedTemplateSrc,
  compileFileClient: Function,
  rosaeNlgVersion: string,
  compiledBy: string,
): PackagedTemplateComp {
  return {
    compiledWithVersion: rosaeNlgVersion,
    compiled: justCompile(packagedTemplateSrc, compileFileClient),
    compiledBy: compiledBy,
    compiledWhen: new Date().toISOString(),
  };
}
