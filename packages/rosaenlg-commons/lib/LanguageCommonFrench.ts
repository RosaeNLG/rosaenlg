import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonFrench extends LanguageCommon {
  iso2 = 'fr';
  validPropsWord = ['plural', 'gender', 'contracts'];
  validPropsAdj = ['contracts', 'MS', 'MP', 'FS', 'FP'];
}
