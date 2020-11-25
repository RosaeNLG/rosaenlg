/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export { LanguageCommon } from './LanguageCommon'; /* istanbul ignore next */
export { LanguageCommonEnglish } from './LanguageCommonEnglish'; /* istanbul ignore next */
export { LanguageCommonFrench } from './LanguageCommonFrench'; /* istanbul ignore next */
export { LanguageCommonGerman } from './LanguageCommonGerman'; /* istanbul ignore next */
export { LanguageCommonItalian } from './LanguageCommonItalian'; /* istanbul ignore next */
export { LanguageCommonSpanish } from './LanguageCommonSpanish'; /* istanbul ignore next */
export { LanguageCommonOther } from './LanguageCommonOther'; /* istanbul ignore next */

export { DictManager } from './DictManager';
export { Constants } from './Constants';
export { buildLanguageCommon, getIso2fromLocale } from './helper';

export type VerbInfo = any;
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
export type WordInfo = any;
export interface WordsInfo {
  [key: string]: WordInfo;
}
export type AdjectiveInfo = any;
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}
