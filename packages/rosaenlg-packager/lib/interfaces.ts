export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | string;

export interface StaticFs {
  [key: string]: string;
}

export interface RosaeNlgFeatures {
  getRosaeNlgVersion: Function;
  NlgLib: any;
  compileFileClient?: Function; // when just for rendering
}

export interface CompileInfo {
  activate: boolean;
  compileDebug: boolean;
  language: Languages;
  verbs?: string[];
  words?: string[];
  adjectives?: string[];
}

export interface Autotest {
  activate: boolean;
  input: any;
  expected: string[];
}

export interface TemplatesMap {
  [key: string]: string;
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

interface PackagedTemplateAbstract {
  type?: 'existing' | 'custom';
  format: string;
  templateId: string;
  user?: string;
  src: PackagedTemplateSrc;
  comp?: PackagedTemplateComp;
}

export interface PackagedTemplateWithCode extends PackagedTemplateAbstract {
  type?: 'custom';
}

export interface PackagedTemplateExisting extends PackagedTemplateAbstract {
  type: 'existing';
  which: string;
}

export type PackagedTemplate = PackagedTemplateWithCode | PackagedTemplateExisting;
