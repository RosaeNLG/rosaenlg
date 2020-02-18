import { Languages } from './index';

export interface PackagedTemplateParams {
  templateId: string;
  entryTemplate: string;
  folderWithTemplates: string;
  compileInfo: CompileInfo;
  autotest?: Autotest;
}

interface CompileInfo {
  activate: boolean;
  compileDebug: boolean;
  language: Languages;
}

interface Autotest {
  activate: boolean;
  input: any;
  expected: string[];
}

interface TemplatesMap {
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
