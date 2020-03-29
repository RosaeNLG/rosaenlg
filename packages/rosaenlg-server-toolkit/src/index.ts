export { RosaeContextsManager, CacheValue, RosaeContextsManagerParams } from './RosaeContextsManager';
export { S3RosaeContextsManager, S3Conf } from './S3RosaeContextsManager';
export { DiskRosaeContextsManager } from './DiskRosaeContextsManager';
export { MemoryRosaeContextsManager } from './MemoryRosaeContextsManager';
export { RosaeContext, RosaeNlgFeatures } from './RosaeContext';
export { RenderOptions } from './RenderOptions';
export { RenderedBundle } from './RenderedBundle';
export {
  PackagedTemplate,
  PackagedTemplateSrc,
  TemplatesMap,
  PackagedTemplateComp,
  PackagedTemplateWithUser,
  CompileInfo,
  Autotest,
  justCompile,
  compToPackagedTemplateComp,
} from './PackagedTemplate';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;
// export const SupportedLanguages = ['en_US', 'fr_FR', 'it_IT', 'de_DE', 'OTHER'];
