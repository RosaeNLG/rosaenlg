/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


declare module 'numeral';

declare interface PugMixins {
  insertValUnescaped(val: string): void;
  insertVal(val: string): void;
  value(obj: any, params: any): void;
}

declare interface Spy {
  appendDoubleSpace(): void;
  getPugHtml(): string;
  getPugMixins(): PugMixins;
  setPugHtml(newPugHtml: string): void;
  appendPugHtml(append: string): void;
  isEvaluatingEmpty(): boolean;
  isEvaluatingChoosebest(): boolean;
  getEmbeddedLinguisticResources(): any;
}
